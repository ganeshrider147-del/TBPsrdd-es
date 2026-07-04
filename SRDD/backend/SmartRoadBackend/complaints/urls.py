from django.http import JsonResponse
from django.urls import path

from .views import (
    create_complaint,
    get_complaints,
    track_complaint,
    dashboard_stats,
    update_status,
    upload_after_image,
    submit_feedback,
    download_report,
    escalated_complaints,
    severity_stats,
    analytics,
    get_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    unread_notification_count,
)


def api_home(request):
    return JsonResponse({
        "message": "Road Detector — API Running",
        "version": "2.0",
        "platform": "Road Damage Reporting & Monitoring System"
    })


urlpatterns = [
    path('', api_home),

    # Complaints
    path('complaints/', create_complaint),
    path('complaints/list/', get_complaints),
    path('complaints/escalated/', escalated_complaints),
    path('complaints/severity/', severity_stats),
    path('complaints/<int:id>/', track_complaint),
    path('complaints/<int:id>/status/', update_status),
    path('complaints/<int:id>/after-image/', upload_after_image),
    path('complaints/<int:id>/feedback/', submit_feedback),
    path('complaints/<int:id>/report/', download_report),

    # Dashboard & Analytics
    path('dashboard/', dashboard_stats),
    path('analytics/', analytics),

    # Notifications
    path('notifications/', get_notifications),
    path('notifications/unread-count/', unread_notification_count),
    path('notifications/mark-all-read/', mark_all_notifications_read),
    path('notifications/<int:id>/read/', mark_notification_read),
]