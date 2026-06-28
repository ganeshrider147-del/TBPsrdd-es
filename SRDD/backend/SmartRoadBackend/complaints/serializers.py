from rest_framework import serializers
from .models import Complaint, ComplaintTimeline, Notification


class ComplaintTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintTimeline
        fields = [
            'id', 'status', 'officer', 'remarks', 'work_date',
            'scheduled_time', 'assigned_team', 'progress',
            'estimated_completion', 'created_at'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'is_read',
            'complaint', 'created_at'
        ]


class ComplaintSerializer(serializers.ModelSerializer):
    timeline = ComplaintTimelineSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    after_image = serializers.ImageField(required=False, allow_null=True)
    repair_priority_text = serializers.SerializerMethodField()
    user_username = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'user', 'user_username',
            'image', 'after_image',
            'location', 'phone_number', 'description',
            'damage_type', 'detected_damage', 'confidence',
            'ai_summary', 'ai_bounding_box',
            'severity', 'severity_level', 'priority',
            'repair_priority_text',
            'status', 'assigned_officer', 'assigned_team',
            'estimated_completion', 'work_scheduled_date',
            'work_started_at', 'completed_at',
            'escalated', 'escalation_date',
            'rating', 'feedback_text',
            'created_at', 'updated_at',
            'timeline',
        ]
        read_only_fields = [
            'detected_damage', 'confidence', 'ai_summary',
            'severity', 'severity_level', 'priority',
            'escalated', 'escalation_date',
            'created_at', 'updated_at',
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        # Build absolute URL for image
        if instance.image:
            url = instance.image.url
            if request:
                representation['image'] = request.build_absolute_uri(url)
            else:
                representation['image'] = f"http://localhost:8000{url}"
        else:
            representation['image'] = None

        # Build absolute URL for after_image
        if instance.after_image:
            url = instance.after_image.url
            if request:
                representation['after_image'] = request.build_absolute_uri(url)
            else:
                representation['after_image'] = f"http://localhost:8000{url}"
        else:
            representation['after_image'] = None
            
        return representation

    def get_repair_priority_text(self, obj):
        return obj.get_repair_priority_display_text()

    def get_user_username(self, obj):
        if obj.user:
            return obj.user.username
        return None