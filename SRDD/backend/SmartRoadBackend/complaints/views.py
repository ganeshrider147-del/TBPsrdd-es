import logging
from datetime import timedelta

from django.utils import timezone
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import Complaint, ComplaintTimeline, Notification
from .serializers import ComplaintSerializer, ComplaintTimelineSerializer, NotificationSerializer
from .detector import detect_damage
from .sms_service import send_sms, get_sms_body_for_status

logger = logging.getLogger(__name__)


# ---------------------------
# HELPERS
# ---------------------------

def create_timeline_entry(complaint, status, **kwargs):
    """Create a timeline entry for a complaint."""
    return ComplaintTimeline.objects.create(
        complaint=complaint,
        status=status,
        officer=kwargs.get('officer', ''),
        remarks=kwargs.get('remarks', f'Status updated to {status}'),
        work_date=kwargs.get('work_date', ''),
        scheduled_time=kwargs.get('scheduled_time', ''),
        assigned_team=kwargs.get('assigned_team', ''),
        progress=kwargs.get('progress', 0),
        estimated_completion=kwargs.get('estimated_completion', None),
    )


def create_notification(user, complaint, title, message, notif_type='info'):
    """Create an in-app notification."""
    if user:
        Notification.objects.create(
            user=user,
            complaint=complaint,
            title=title,
            message=message,
            type=notif_type
        )


def send_complaint_sms(complaint, status, **kwargs):
    """Send SMS to citizen's phone number."""
    phone = complaint.phone_number
    if not phone:
        # Try to get from user profile
        if complaint.user:
            try:
                phone = complaint.user.profile.phone_number
            except Exception:
                pass

    if phone:
        # Safely combine default and custom keyword arguments to prevent duplicates
        sms_kwargs = {
            'location': complaint.location,
            'created_at': complaint.created_at.strftime('%d %b %Y, %I:%M %p') if complaint.created_at else 'N/A',
        }
        sms_kwargs.update(kwargs)
        body = get_sms_body_for_status(
            complaint.id,
            status,
            **sms_kwargs
        )
        send_sms(phone, body)


def escalate_complaint(complaint):
    """Auto-escalate complaints older than 15 days."""
    if (
        complaint.status not in ['Completed', 'Closed', 'Escalated']
        and not complaint.escalated
        and timezone.now() - complaint.created_at > timedelta(days=15)
    ):
        complaint.escalated = True
        complaint.escalation_date = timezone.now()
        complaint.status = 'Escalated'
        complaint.save()
        create_timeline_entry(
            complaint,
            'Escalated',
            remarks='Auto-escalated: complaint unresolved after 15 days.'
        )
        send_complaint_sms(complaint, 'Escalated')


# ---------------------------
# GET ALL COMPLAINTS (Admin)
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_complaints(request):
    complaints = Complaint.objects.select_related('user').prefetch_related('timeline').all()
    for c in complaints:
        escalate_complaint(c)
    serializer = ComplaintSerializer(complaints, many=True, context={'request': request})
    return Response(serializer.data)


# ---------------------------
# CREATE COMPLAINT
# ---------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_complaint(request):
    # Remove damage_type from data so AI sets it
    data = request.data.copy()
    data['damage_type'] = 'Unknown'  # Will be set by AI

    serializer = ComplaintSerializer(data=data, context={'request': request})

    if serializer.is_valid():
        complaint = serializer.save(user=request.user)

        # Run AI detection
        if complaint.image:
            try:
                result = detect_damage(complaint.image.path)
                damage_type = result.get('damage_type', 'No Damage Detected')
                confidence = result.get('confidence', 0.0)
                bounding_box = result.get('bounding_box')

                # Determine if actual damage was found
                damage_found = damage_type not in ['No Damage Detected', 'Unknown']

                # Severity from confidence (only if damage detected)
                if not damage_found or confidence < 5:
                    severity = 1
                    severity_level = 'Low'
                    priority = 'Low'
                    damage_type = 'No Damage Detected'
                elif confidence >= 80:
                    severity = 5
                    severity_level = 'Critical'
                    priority = 'Urgent'
                elif confidence >= 60:
                    severity = 4
                    severity_level = 'High'
                    priority = 'High'
                elif confidence >= 40:
                    severity = 3
                    severity_level = 'Medium'
                    priority = 'Medium'
                elif confidence >= 20:
                    severity = 2
                    severity_level = 'Low'
                    priority = 'Low'
                else:
                    severity = 1
                    severity_level = 'Low'
                    priority = 'Low'

                if damage_found and confidence >= 5:
                    ai_summary = (
                        f"Computer vision analysis classified this road hazard as: {damage_type}. "
                        f"Confidence score: {confidence}%. "
                        f"Severity: {severity_level}. "
                        f"Recommended action: Deploy maintenance crew for {damage_type.lower()} repair. "
                        f"Repair priority set to {priority} based on damage assessment."
                    )
                else:
                    ai_summary = (
                        "AI analysis did not detect significant road damage in the uploaded image. "
                        "The image has been submitted for manual review by our inspection team."
                    )

                complaint.detected_damage = damage_type
                complaint.damage_type = damage_type if damage_type in ['Pothole', 'Crack'] else 'Unknown'
                complaint.confidence = confidence
                complaint.severity = severity
                complaint.severity_level = severity_level
                complaint.priority = priority
                complaint.ai_summary = ai_summary
                complaint.ai_bounding_box = bounding_box
                complaint.status = 'Pending'
                complaint.save()

                logger.info(f"AI detected: {damage_type} ({confidence}%) for complaint #{complaint.id}")
            except Exception as e:
                logger.error(f"AI detection failed for complaint #{complaint.id}: {str(e)}")
                complaint.detected_damage = 'No Damage Detected'
                complaint.ai_summary = 'AI analysis could not be completed. Manual review required.'
                complaint.save()

        # Create initial timeline entry
        create_timeline_entry(
            complaint,
            'Pending',
            officer='AI System',
            remarks=f'Complaint submitted. AI detected: {complaint.detected_damage or "No Damage Detected"}. Awaiting assignment.'
        )

        # Create in-app notification
        create_notification(
            request.user,
            complaint,
            'Complaint Submitted ✓',
            f'Your complaint #{complaint.id} has been submitted successfully. AI detected: {complaint.detected_damage or "No Damage Detected"}.',
            'success'
        )

        # Send SMS confirmation
        send_complaint_sms(
            complaint,
            'Pending',
            location=complaint.location,
            created_at=complaint.created_at.strftime('%d %b %Y, %I:%M %p') if complaint.created_at else 'Now'
        )

        return Response(ComplaintSerializer(complaint, context={'request': request}).data, status=201)

    return Response(serializer.errors, status=400)


# ---------------------------
# TRACK SINGLE COMPLAINT
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_complaint(request, id):
    try:
        complaint = Complaint.objects.prefetch_related('timeline').get(id=id)
        
        # Admin can track all, ordinary user can only track their own
        if not request.user.is_staff and complaint.user != request.user:
            return Response({'error': 'Permission denied. You do not have access to this complaint.'}, status=403)
            
        escalate_complaint(complaint)
        serializer = ComplaintSerializer(complaint, context={'request': request})
        return Response(serializer.data)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found.'}, status=404)


# ---------------------------
# DASHBOARD STATS
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    if request.user.is_staff:
        qs = Complaint.objects.all()
    else:
        qs = Complaint.objects.filter(user=request.user)

    for c in qs:
        escalate_complaint(c)

    return Response({
        'total': qs.count(),
        'pending': qs.filter(status='Pending').count(),
        'assigned': qs.filter(status='Assigned').count(),
        'in_progress': qs.filter(status__in=['Work Started', 'In Progress', 'Work Scheduled', 'Repair Verification']).count(),
        'completed': qs.filter(status__in=['Completed', 'Closed']).count(),
        'escalated': qs.filter(escalated=True).count(),
        'repair_verification': qs.filter(status='Repair Verification').count(),
    })


# ---------------------------
# UPDATE STATUS (Admin)
# ---------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_status(request, id):
    try:
        complaint = Complaint.objects.select_related('user').get(id=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found.'}, status=404)

    valid_statuses = [
        'Pending', 'Assigned', 'Work Scheduled', 'Work Started',
        'In Progress', 'Repair Verification', 'Completed', 'Closed', 'Escalated'
    ]

    new_status = request.data.get('status', complaint.status)
    if new_status not in valid_statuses:
        return Response({'error': f'Invalid status. Valid choices: {valid_statuses}'}, status=400)

    old_status = complaint.status
    complaint.status = new_status

    # Set workflow timestamps
    if new_status == 'Work Started' and not complaint.work_started_at:
        complaint.work_started_at = timezone.now()
    if new_status in ['Completed', 'Closed'] and not complaint.completed_at:
        complaint.completed_at = timezone.now()

    # Update officer/team if provided
    officer = request.data.get('officer', '')
    assigned_team = request.data.get('assigned_team', '')
    if officer:
        complaint.assigned_officer = officer
    if assigned_team:
        complaint.assigned_team = assigned_team

    est_completion = request.data.get('estimated_completion')
    if est_completion:
        complaint.estimated_completion = est_completion

    complaint.save()

    # Timeline entry
    create_timeline_entry(
        complaint,
        new_status,
        officer=officer or complaint.assigned_officer or 'Admin',
        remarks=request.data.get('remarks', f'Status updated from {old_status} to {new_status}.'),
        work_date=request.data.get('work_date', ''),
        scheduled_time=request.data.get('scheduled_time', ''),
        assigned_team=assigned_team or complaint.assigned_team or '',
        progress=request.data.get('progress', 0),
        estimated_completion=est_completion,
    )

    # In-app notification
    if complaint.user:
        notif_messages = {
            'Assigned': f'Your complaint #{complaint.id} has been assigned to the Road Maintenance Department.',
            'Work Scheduled': f'Repair work for complaint #{complaint.id} has been scheduled.',
            'Work Started': f'Repair work on complaint #{complaint.id} has officially started.',
            'In Progress': f'Complaint #{complaint.id} is actively being worked on.',
            'Repair Verification': f'Complaint #{complaint.id} is undergoing repair verification.',
            'Completed': f'Your complaint #{complaint.id} has been resolved. Please rate the work quality.',
            'Closed': f'Complaint #{complaint.id} has been closed. Thank you for helping make our roads safer!',
            'Escalated': f'Your complaint #{complaint.id} has been escalated for urgent attention.',
        }
        msg = notif_messages.get(new_status, f'Your complaint #{complaint.id} status updated to: {new_status}')
        notif_type = 'success' if new_status in ['Completed', 'Closed'] else \
                     'error' if new_status == 'Escalated' else 'info'
        create_notification(complaint.user, complaint, f'Status: {new_status}', msg, notif_type)

    # Send SMS
    send_complaint_sms(
        complaint,
        new_status,
        officer=officer or complaint.assigned_officer or 'Maintenance Team',
        work_date=request.data.get('work_date', 'TBD'),
        scheduled_time=request.data.get('scheduled_time', 'TBD'),
        assigned_team=assigned_team or complaint.assigned_team or 'Road Maintenance Crew',
        progress=request.data.get('progress', 50),
        estimated_completion=str(complaint.estimated_completion) if complaint.estimated_completion else 'TBD',
        completed_at=str(complaint.completed_at) if complaint.completed_at else 'Now',
    )

    return Response(ComplaintSerializer(complaint, context={'request': request}).data)


# ---------------------------
# UPLOAD AFTER IMAGE
# ---------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_after_image(request, id):
    try:
        complaint = Complaint.objects.get(id=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found.'}, status=404)

    if 'after_image' not in request.FILES:
        return Response({'error': 'No image file provided.'}, status=400)

    complaint.after_image = request.FILES['after_image']
    complaint.save()

    create_timeline_entry(
        complaint,
        'Repair Verification',
        officer=request.data.get('officer', 'Admin'),
        remarks='Repair completion image uploaded for verification.'
    )

    return Response(ComplaintSerializer(complaint, context={'request': request}).data)


# ---------------------------
# SUBMIT FEEDBACK
# ---------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def submit_feedback(request, id):
    try:
        complaint = Complaint.objects.get(id=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found.'}, status=404)

    # Check permission
    if not request.user.is_staff and complaint.user != request.user:
        return Response({'error': 'Permission denied. You do not have access to this complaint.'}, status=403)

    if complaint.status not in ['Completed', 'Closed']:
        return Response({'error': 'Feedback can only be submitted for completed complaints.'}, status=400)

    rating = request.data.get('rating')
    feedback_text = request.data.get('feedback_text', '')

    if rating is not None:
        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                return Response({'error': 'Rating must be between 1 and 5.'}, status=400)
        except ValueError:
            return Response({'error': 'Rating must be a number.'}, status=400)

    complaint.rating = rating
    complaint.feedback_text = feedback_text
    complaint.save()

    return Response(ComplaintSerializer(complaint, context={'request': request}).data)


# ---------------------------
# DOWNLOAD REPORT (Text)
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_report(request, id):
    try:
        complaint = Complaint.objects.prefetch_related('timeline').get(id=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found.'}, status=404)

    # Check permission
    if not request.user.is_staff and complaint.user != request.user:
        return Response({'error': 'Permission denied. You do not have access to this report.'}, status=403)

    # Build report text
    lines = [
        "=" * 60,
        "ROAD DETECTOR — COMPLAINT REPORT",
        "Road Damage Reporting & Monitoring System",
        "=" * 60,
        "",
        f"Reference ID    : RD-{complaint.id}",
        f"Location        : {complaint.location}",
        f"Submitted       : {complaint.created_at.strftime('%d %b %Y, %I:%M %p') if complaint.created_at else 'N/A'}",
        f"Status          : {complaint.status}",
        "",
        "--- DETECTED DAMAGE INFO ---",
        f"Damage Type     : {complaint.detected_damage or complaint.damage_type or 'No Damage Detected'}",
        f"Detection Accuracy: {complaint.confidence}%",
        f"Damage Severity : {complaint.severity_level}",
        f"Priority        : {complaint.priority}",
        f"Repair Priority : {complaint.get_repair_priority_display_text()}",
        "",
        "--- DAMAGE ASSESSMENT ---",
        f"{complaint.ai_summary or 'No assessment available.'}",
        "",
        "--- REPAIR TIMELINE ---",
    ]

    for entry in complaint.timeline.all():
        lines.append(f"  [{entry.created_at.strftime('%d %b %Y %H:%M') if entry.created_at else 'N/A'}] {entry.status}")
        if entry.officer:
            lines.append(f"    Officer  : {entry.officer}")
        if entry.remarks:
            lines.append(f"    Remarks  : {entry.remarks}")
        lines.append("")

    if complaint.rating:
        lines += [
            "--- CITIZEN FEEDBACK ---",
            f"Rating          : {complaint.rating}/5 stars",
            f"Feedback        : {complaint.feedback_text or 'No comments.'}",
            "",
        ]

    lines += [
        "=" * 60,
        "Report generated by Road Detector",
        f"Generated at: {timezone.now().strftime('%d %b %Y, %I:%M %p')}",
        "=" * 60,
    ]

    content = "\n".join(lines)
    response = HttpResponse(content, content_type='text/plain; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="road_report_RD-{complaint.id}.txt"'
    return response


# ---------------------------
# ESCALATED LIST
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def escalated_complaints(request):
    complaints = Complaint.objects.filter(escalated=True).prefetch_related('timeline')
    serializer = ComplaintSerializer(complaints, many=True, context={'request': request})
    return Response(serializer.data)


# ---------------------------
# SEVERITY STATS
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def severity_stats(request):
    return Response({
        'low': Complaint.objects.filter(severity_level='Low').count(),
        'medium': Complaint.objects.filter(severity_level='Medium').count(),
        'high': Complaint.objects.filter(severity_level='High').count(),
        'critical': Complaint.objects.filter(severity_level='Critical').count(),
    })


# ---------------------------
# ANALYTICS
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics(request):
    from django.db.models import Avg, Count
    from collections import defaultdict

    total = Complaint.objects.count()
    completed = Complaint.objects.filter(status__in=['Completed', 'Closed']).count()
    completion_rate = round((completed / total) * 100, 1) if total > 0 else 0

    avg_rating = Complaint.objects.filter(rating__isnull=False).aggregate(avg=Avg('rating'))['avg']

    # Group monthly trends in Python to remain timezone/db-agnostic
    trends_dict = defaultdict(int)
    for c in Complaint.objects.all():
        if c.created_at:
            month_str = c.created_at.strftime('%b %Y')
            trends_dict[month_str] += 1

    # Sort monthly trends chronologically
    try:
        sorted_months = sorted(
            trends_dict.keys(), 
            key=lambda x: timezone.datetime.strptime(x, '%b %Y')
        )
    except Exception:
        sorted_months = sorted(trends_dict.keys())

    monthly_data = [
        {
            'month': m,
            'count': trends_dict[m]
        }
        for m in sorted_months
    ]

    damage_dist = {
        'pothole': Complaint.objects.filter(detected_damage='Pothole').count(),
        'crack': Complaint.objects.filter(detected_damage='Crack').count(),
        'unknown': Complaint.objects.exclude(detected_damage__in=['Pothole', 'Crack']).count(),
    }

    return Response({
        'total_complaints': total,
        'completion_rate': completion_rate,
        'average_rating': round(avg_rating, 1) if avg_rating else None,
        'monthly_trends': monthly_data,
        'damage_distribution': damage_dist,
        'severity_breakdown': {
            'low': Complaint.objects.filter(severity_level='Low').count(),
            'medium': Complaint.objects.filter(severity_level='Medium').count(),
            'high': Complaint.objects.filter(severity_level='High').count(),
            'critical': Complaint.objects.filter(severity_level='Critical').count(),
        },
        'status_breakdown': {
            'pending': Complaint.objects.filter(status='Pending').count(),
            'in_progress': Complaint.objects.filter(status__in=['Work Started', 'In Progress']).count(),
            'completed': Complaint.objects.filter(status__in=['Completed', 'Closed']).count(),
            'escalated': Complaint.objects.filter(escalated=True).count(),
        }
    })


# ---------------------------
# NOTIFICATIONS (In-App)
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, id):
    try:
        notification = Notification.objects.get(id=id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'status': 'ok'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found.'}, status=404)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'All notifications marked as read.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notification_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'count': count})