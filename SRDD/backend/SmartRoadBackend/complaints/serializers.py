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
        from django.conf import settings
        
        PROD_BACKEND_URL = "https://tbpsrdd-backend-93820.up.railway.app"
        
        # Build absolute URL for image
        if instance.image:
            url = instance.image.url
            if url.startswith('http://') or url.startswith('https://'):
                representation['image'] = url
            elif settings.DEBUG:
                if request:
                    representation['image'] = request.build_absolute_uri(url)
                else:
                    representation['image'] = f"http://localhost:8000{url}"
            else:
                representation['image'] = f"{PROD_BACKEND_URL}{url}"
        else:
            representation['image'] = None

        # Build absolute URL for after_image
        if instance.after_image:
            url = instance.after_image.url
            if url.startswith('http://') or url.startswith('https://'):
                representation['after_image'] = url
            elif settings.DEBUG:
                if request:
                    representation['after_image'] = request.build_absolute_uri(url)
                else:
                    representation['after_image'] = f"http://localhost:8000{url}"
            else:
                representation['after_image'] = f"{PROD_BACKEND_URL}{url}"
        else:
            representation['after_image'] = None
            
        return representation

    def get_repair_priority_text(self, obj):
        return obj.get_repair_priority_display_text()

    def get_user_username(self, obj):
        if obj.user:
            return obj.user.username
        return None

    def validate_image(self, value):
        if value:
            return self._normalize_image(value)
        return value

    def validate_after_image(self, value):
        if value:
            return self._normalize_image(value)
        return value

    def _normalize_image(self, value):
        from PIL import Image
        import io
        from django.core.files.uploadedfile import InMemoryUploadedFile
        from rest_framework.exceptions import ValidationError
        
        ALLOWED_FORMATS = {
            'JPEG': 'image/jpeg',
            'JPG': 'image/jpeg',
            'PNG': 'image/png',
            'WEBP': 'image/webp',
            'BMP': 'image/bmp',
            'GIF': 'image/gif',
            'TIFF': 'image/tiff',
            'TIF': 'image/tiff',
        }

        try:
            from pi_heif import register_heif_opener
            register_heif_opener()
            ALLOWED_FORMATS['HEIF'] = 'image/heic'
            ALLOWED_FORMATS['HEIC'] = 'image/heic'
        except Exception:
            pass

        try:
            value.seek(0)
            img = Image.open(value)
            img_format = (img.format or "").upper()
            
            if img_format not in ALLOWED_FORMATS:
                raise ValidationError(f"Unsupported image format: {img_format}. Allowed formats: JPG, JPEG, PNG, WEBP, BMP, GIF, TIFF.")
                
            # If standard web format, return it
            if img_format in ['JPEG', 'JPG', 'PNG', 'WEBP', 'GIF']:
                value.seek(0)
                return value
                
            # Convert non-web images (BMP, TIFF, HEIC, etc.) to JPEG
            buffer = io.BytesIO()
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            elif img.mode == 'CMYK':
                img = img.convert('RGB')
                
            img.save(buffer, format='JPEG', quality=90)
            buffer.seek(0)
            
            name = value.name
            dot_idx = name.rfind('.')
            if dot_idx != -1:
                name = name[:dot_idx] + '.jpg'
            else:
                name = name + '.jpg'
                
            new_file = InMemoryUploadedFile(
                buffer,
                field_name=value.field_name,
                name=name,
                content_type='image/jpeg',
                size=buffer.getbuffer().nbytes,
                charset=None
            )
            return new_file
        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError("Invalid image file or unsupported format.")