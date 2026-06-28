from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'account_type', 'phone_number', 'full_name', 'department']
    list_filter = ['account_type']
    search_fields = ['user__username', 'user__email', 'full_name', 'phone_number']
