from django.db import models
from django.contrib.auth.models import User


# ------------------------------------------
# COMPLAINT MODEL (Enhanced)
# ------------------------------------------
class Complaint(models.Model):

    DAMAGE_TYPES = [
        ('Pothole', 'Pothole'),
        ('Crack', 'Crack'),
        ('Unknown', 'Unknown'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Assigned', 'Assigned'),
        ('Work Scheduled', 'Work Scheduled'),
        ('Work Started', 'Work Started'),
        ('In Progress', 'In Progress'),
        ('Repair Verification', 'Repair Verification'),
        ('Completed', 'Completed'),
        ('Closed', 'Closed'),
        ('Escalated', 'Escalated'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]

    # Relationship
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints'
    )

    # Images
    image = models.ImageField(
        upload_to='complaints/',
        blank=True,
        null=True
    )
    after_image = models.ImageField(
        upload_to='complaints/after/',
        blank=True,
        null=True
    )

    # Location & Contact
    location = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # AI Detection Results
    damage_type = models.CharField(
        max_length=20,
        choices=DAMAGE_TYPES,
        default='Unknown'
    )
    detected_damage = models.CharField(max_length=100, blank=True, null=True)
    confidence = models.FloatField(default=0)
    ai_summary = models.TextField(blank=True, null=True)
    ai_bounding_box = models.JSONField(blank=True, null=True)

    # Severity & Priority
    severity = models.IntegerField(default=1)
    severity_level = models.CharField(max_length=20, default='Low')
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='Low'
    )

    # Status & Workflow
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='Pending'
    )
    assigned_officer = models.CharField(max_length=255, blank=True, null=True)
    assigned_team = models.CharField(max_length=255, blank=True, null=True)
    estimated_completion = models.DateTimeField(null=True, blank=True)
    work_scheduled_date = models.DateTimeField(null=True, blank=True)
    work_started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Escalation
    escalated = models.BooleanField(default=False)
    escalation_date = models.DateTimeField(null=True, blank=True)

    # Citizen Feedback
    rating = models.IntegerField(null=True, blank=True)
    feedback_text = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"RD-{self.id} | {self.detected_damage or self.damage_type} | {self.status}"

    def get_repair_priority_display_text(self):
        severity_map = {
            'Critical': 'Urgent (Within 24 Hours)',
            'High': 'High Priority (Within 48 Hours)',
            'Medium': 'Standard (Within 7 Days)',
            'Low': 'Routine (Within 30 Days)',
        }
        return severity_map.get(self.severity_level, 'Standard (Within 7 Days)')


# ------------------------------------------
# COMPLAINT TIMELINE
# ------------------------------------------
class ComplaintTimeline(models.Model):
    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='timeline'
    )
    status = models.CharField(max_length=50)
    officer = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    work_date = models.CharField(max_length=100, blank=True, null=True)
    scheduled_time = models.CharField(max_length=100, blank=True, null=True)
    assigned_team = models.CharField(max_length=255, blank=True, null=True)
    progress = models.IntegerField(default=0)
    estimated_completion = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Timeline: RD-{self.complaint.id} → {self.status}"


# ------------------------------------------
# IN-APP NOTIFICATIONS
# ------------------------------------------
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='info'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
