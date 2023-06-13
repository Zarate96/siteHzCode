import os
from decouple import config
from hzcode.settings.base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['hzcode.mx']


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

SITE_URL = 'https://hzcode.mx/'
PROTOCOL_HTTP = 'https'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
    }
}

