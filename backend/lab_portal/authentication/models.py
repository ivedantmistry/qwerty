from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, role='lab_assistant'):
        if not username:
            raise ValueError("Users must have a username")
        user = self.model(username=username, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None):
        user = self.create_user(username=username, password=password, role='manager')
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

# Custom User Model
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('lab_assistant', 'Lab Assistant'),
        ('supervisor', 'Supervisor'),
        ('manager', 'Manager'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='lab_assistant')
    objects = CustomUserManager()

    def __str__(self):
        return self.username
