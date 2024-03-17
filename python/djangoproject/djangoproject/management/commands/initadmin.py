# myapp/management/commands/initadmin.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

class Command(BaseCommand):
    help = 'Initialize admin accounts'

    def handle(self, *args, **options):
        if get_user_model().objects.filter(is_superuser=True).count() == 0:
            username = 'admin'
            email = 'admin'
            password = 'admin'
            print('Creating account for %s (%s)' % (username, email))
            admin = get_user_model().objects.create_superuser(email=email, username=username, password=password)
            admin.is_active = True
            admin.is_admin = True
            admin.save()
        else:
            print('Admin accounts can only be initialized if no accounts exist')
