"""
Django settings for Road Detector backend.
"""

import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-^dgp!k*#d333&lpvv-qo2320y0xq7em7vd7vb+tu-msjedqp*v",
)

DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
    "tbpsrdd-es-production.up.railway.app",
    "tbpsrdd-es-production-b2fa.up.railway.app",
    "localhost",
    "127.0.0.1",
]
# ------------------------------------
# APPLICATIONS
# ------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    'users',
    'complaints.apps.ComplaintsConfig',
    'django_crontab',
]

# ------------------------------------
# MIDDLEWARE
# ------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
]

try:
    import whitenoise
    MIDDLEWARE.append('whitenoise.middleware.WhiteNoiseMiddleware')
except ImportError:
    pass

MIDDLEWARE += [
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ------------------------------------
# DATABASE
# ------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME') or os.environ.get('MYSQLDATABASE') or 'smartroad',
        'USER': os.environ.get('DB_USER') or os.environ.get('MYSQLUSER') or 'root',
        'PASSWORD': os.environ.get('DB_PASSWORD') or os.environ.get('MYSQLPASSWORD') or '21040724',
        'HOST': os.environ.get('DB_HOST') or os.environ.get('MYSQLHOST') or 'localhost',
        'PORT': os.environ.get('DB_PORT') or os.environ.get('MYSQLPORT') or '3306',
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}

try:
    import dj_database_url
    db_url = os.environ.get('DATABASE_URL') or os.environ.get('MYSQL_URL') or os.environ.get('MYSQL_PRIVATE_URL')
    if db_url:
        DATABASES['default'] = dj_database_url.config(default=db_url, conn_max_age=600, ssl_require=False)
except ImportError:
    pass

# ------------------------------------
# AUTH & JWT
# ------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=6),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ------------------------------------
# I18N
# ------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# ------------------------------------
# STATIC & MEDIA
# ------------------------------------
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

USE_X_FORWARDED_HOST = True

# CORS & CSRF
# ------------------------------------
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
]

CSRF_TRUSTED_ORIGINS = [
    'https://tbpsrdd-es-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
]

# ------------------------------------
# LOGGING
# ------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {module}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'complaints': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'users': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

## ------------------------------------
# CORS & CSRF
# ------------------------------------
from corsheaders.defaults import default_headers

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://tbpsrdd-es-production-b2fa.up.railway.app",
    "https://tbpsrdd-es-production.up.railway.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "https://tbpsrdd-es-production-b2fa.up.railway.app",
    "https://tbpsrdd-es-production.up.railway.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
]
# ------------------------------------
# TWILIO SMS
# ------------------------------------
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'ACc88bf01c69b68ebd99fcd914a901349c')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '80e6b31b8c2af4dfc14ba348d6aa633e')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '+19516292515')
ADMIN_PHONE_NUMBER = os.environ.get('ADMIN_PHONE_NUMBER', '+917815909821')
