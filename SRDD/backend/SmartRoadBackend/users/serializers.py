from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'account_type', 'phone_number', 'full_name', 'location',
            'admin_id', 'department', 'designation', 'created_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'profile']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    account_type = serializers.ChoiceField(choices=['citizen', 'administrator'])

    # Citizen fields
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)

    # Admin fields
    admin_id = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    designation = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        account_type = validated_data.get('account_type', 'citizen')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )

        if account_type == 'administrator':
            user.is_staff = True
            user.save()

        UserProfile.objects.create(
            user=user,
            account_type=account_type,
            phone_number=validated_data.get('phone_number', ''),
            full_name=validated_data.get('full_name', ''),
            location=validated_data.get('location', ''),
            admin_id=validated_data.get('admin_id', ''),
            department=validated_data.get('department', ''),
            designation=validated_data.get('designation', ''),
        )

        return user
