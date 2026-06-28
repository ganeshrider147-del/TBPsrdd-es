import logging
from twilio.rest import Client
from django.conf import settings

logger = logging.getLogger(__name__)


def send_sms(to_number, body):
    """Send SMS to a specific phone number using Twilio."""
    if not to_number:
        logger.warning("SMS skipped: no recipient phone number provided.")
        return None
    try:
        client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        message = client.messages.create(
            body=body,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_number
        )
        logger.info(f"SMS sent to {to_number} | SID: {message.sid}")
        return message.sid
    except Exception as e:
        logger.error(f"Twilio SMS error to {to_number}: {str(e)}")
        return None


# --------------------------------------------------
# STATUS-SPECIFIC SMS TEMPLATES
# --------------------------------------------------

def sms_complaint_submitted(complaint_id, location, created_at):
    return (
        f"[Road Detector] Complaint #{complaint_id} submitted successfully!\n"
        f"Location: {location}\n"
        f"Time: {created_at}\n"
        f"Status: Pending Review\n"
        f"Track progress: http://localhost:3000/track?id={complaint_id}\n"
        f"Our team will inspect your report shortly."
    )


def sms_complaint_assigned(complaint_id, officer):
    return (
        f"[Road Detector] Update on Complaint #{complaint_id}:\n"
        f"Your complaint has been assigned to the Road Maintenance Department.\n"
        f"Assigned Team: {officer or 'Maintenance Crew'}\n"
        f"Track progress: http://localhost:3000/track?id={complaint_id}"
    )


def sms_work_scheduled(complaint_id, work_date, scheduled_time, team):
    return (
        f"[Road Detector] Work Scheduled for Complaint #{complaint_id}!\n"
        f"Work Date: {work_date}\n"
        f"Scheduled Time: {scheduled_time or 'To be confirmed'}\n"
        f"Assigned Team: {team or 'Maintenance Crew'}\n"
        f"Track progress: http://localhost:3000/track?id={complaint_id}"
    )


def sms_work_started(complaint_id, officer):
    return (
        f"[Road Detector] Great news! Repair work has started on Complaint #{complaint_id}.\n"
        f"Repair work is now officially underway.\n"
        f"Track progress: http://localhost:3000/track?id={complaint_id}"
    )


def sms_in_progress(complaint_id, progress, est_completion):
    return (
        f"[Road Detector] Progress Update for Complaint #{complaint_id}:\n"
        f"Current Progress: {progress}% complete\n"
        f"Expected Completion: {est_completion or 'To be updated'}\n"
        f"Track progress: http://localhost:3000/track?id={complaint_id}"
    )


def sms_completed(complaint_id, completed_at):
    return (
        f"[Road Detector] Complaint #{complaint_id} has been RESOLVED!\n"
        f"Completion Time: {completed_at}\n"
        f"Thank you for helping us keep our roads safe!\n"
        f"Please rate the repair quality: http://localhost:3000/track?id={complaint_id}"
    )


def sms_closed(complaint_id):
    return (
        f"[Road Detector] Complaint #{complaint_id} is now Closed.\n"
        f"Thank you for your contribution to road safety.\n"
        f"Road Detector — Road Damage Reporting & Monitoring System"
    )


def sms_escalated(complaint_id):
    return (
        f"[Road Detector] ESCALATION ALERT — Complaint #{complaint_id}\n"
        f"Your complaint has been escalated for urgent attention.\n"
        f"A senior team has been notified for immediate action.\n"
        f"Track progress: http://localhost:3000/track?id={complaint_id}"
    )


def get_sms_body_for_status(complaint_id, status, **kwargs):
    """Get the appropriate SMS body based on status."""
    templates = {
        'Pending': sms_complaint_submitted(
            complaint_id,
            kwargs.get('location', 'Unknown'),
            kwargs.get('created_at', 'Now')
        ),
        'Assigned': sms_complaint_assigned(
            complaint_id,
            kwargs.get('officer', '')
        ),
        'Work Scheduled': sms_work_scheduled(
            complaint_id,
            kwargs.get('work_date', 'TBD'),
            kwargs.get('scheduled_time', 'TBD'),
            kwargs.get('assigned_team', '')
        ),
        'Work Started': sms_work_started(
            complaint_id,
            kwargs.get('officer', '')
        ),
        'In Progress': sms_in_progress(
            complaint_id,
            kwargs.get('progress', 50),
            kwargs.get('estimated_completion', 'TBD')
        ),
        'Completed': sms_completed(
            complaint_id,
            kwargs.get('completed_at', 'Just now')
        ),
        'Closed': sms_closed(complaint_id),
        'Escalated': sms_escalated(complaint_id),
    }
    return templates.get(status, f"[Road Detector] Complaint #{complaint_id} status updated to: {status}")