from django.apps import AppConfig

class ComplaintsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'complaints'

    def ready(self):
        # Handle HEIF image format registration
        try:
            from pi_heif import register_heif_opener
            register_heif_opener()
        except ImportError:
            pass
        
        # Start background scheduler
        from .scheduler import start
        start()
        
        # Register signal handlers for proper file cleanup
        import logging
        from django.db.models.signals import pre_delete
        from django.dispatch import receiver
        from .models import Complaint
        
        logger = logging.getLogger(__name__)
        
        @receiver(pre_delete, sender=Complaint)
        def delete_complaint_files(sender, instance, **kwargs):
            """
            Delete associated image files when a complaint is deleted.
            This ensures files are cleaned up even on Railway's ephemeral filesystem.
            """
            try:
                # Delete main image
                if instance.image:
                    if instance.image.name:
                        instance.image.delete(save=False)
                        logger.info(f"Deleted image file for complaint {instance.id}")
                
                # Delete after repair image
                if instance.after_image:
                    if instance.after_image.name:
                        instance.after_image.delete(save=False)
                        logger.info(f"Deleted after_image file for complaint {instance.id}")
            except Exception as e:
                logger.warning(f"Error deleting files for complaint {instance.id}: {e}")