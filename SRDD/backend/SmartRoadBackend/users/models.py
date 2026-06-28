from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ACCOUNT_TYPES = [
        ('citizen', 'Citizen'),
        ('administrator', 'Administrator'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default='citizen')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    # Administrator-specific fields
    admin_id = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    designation = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.account_type})"
