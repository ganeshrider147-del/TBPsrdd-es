from django.apps import AppConfig

class ComplaintsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'complaints'

    def ready(self):
        try:
            from pi_heif import register_heif_opener
            register_heif_opener()
        except ImportError:
            pass
        from .scheduler import start
        start()