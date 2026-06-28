"""
Background scheduler — auto-escalation every 5 minutes.
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)


def start():
    """Start the background scheduler."""
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            run_escalation_check,
            "interval",
            minutes=5,
            id="run_escalation_check",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("APScheduler started — escalation job scheduled every 5 minutes.")
    except Exception as e:
        logger.warning(f"APScheduler could not start: {e}")


def run_escalation_check():
    """Auto-escalate complaints older than 15 days without resolution."""
    logger.info("Running escalation check...")
    try:
        from django.utils import timezone
        from datetime import timedelta
        from .models import Complaint
        from .sms_service import send_sms, sms_escalated

        complaints = Complaint.objects.filter(
            escalated=False,
            status__in=["Pending", "Assigned", "Work Scheduled", "Work Started", "In Progress"],
        )

        escalated_count = 0
        for complaint in complaints:
            if timezone.now() - complaint.created_at > timedelta(days=15):
                complaint.escalated = True
                complaint.escalation_date = timezone.now()
                complaint.status = "Escalated"
                complaint.save()
                escalated_count += 1

                # Send SMS if phone number is available
                phone = complaint.phone_number
                if not phone and complaint.user:
                    try:
                        phone = complaint.user.profile.phone_number
                    except Exception:
                        pass

                if phone:
                    body = sms_escalated(complaint.id)
                    send_sms(phone, body)

        logger.info(f"Escalation check done: {escalated_count} complaint(s) escalated.")
    except Exception as e:
        logger.error(f"Escalation check error: {e}")