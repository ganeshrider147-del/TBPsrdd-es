from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register, login_view, me, my_complaints, update_profile, change_password

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('me/', me, name='me'),
    path('my-complaints/', my_complaints, name='my_complaints'),
    path('profile/update/', update_profile, name='update_profile'),
    path('profile/change-password/', change_password, name='change_password'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
