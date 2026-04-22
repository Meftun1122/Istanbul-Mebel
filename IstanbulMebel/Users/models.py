from django.db import models
from IstanbulMebel.utils.base import BaseModel
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.conf import settings
# Create your models here.


class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = 'İstifadeçi'
        verbose_name_plural = 'Admin'




class UserProfile(BaseModel):
    GENDER_CHOICES = (
        (1, 'Male'),
        (2, 'Female'),
        (3, 'Other'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='Profil')
    gender = models.PositiveSmallIntegerField(choices=GENDER_CHOICES, default=1)
    birthdate = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=50, verbose_name='Telefon nömrəsi', blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', verbose_name='Profil şəkili', blank=True, null=True)
    receive_offers = models.BooleanField(default=False, verbose_name='Təkifləri nəzərdən keçirin')
    subscribe_newsletter = models.BooleanField(default=False, verbose_name='Xəbər büllentinə abonə olun')

    class Meta:
        verbose_name = 'İstifadəçi'
        verbose_name_plural = 'İstifadəçi Profilləri'
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email}'s Profile"
    
    def delete_profile_image(self):
        """Profil şəklini silmək üçün metod"""
        if self.profile_image:
            self.profile_image.delete()
            self.profile_image = None
            self.save()
            return True
        return False






class ContactLocationsModel(BaseModel):
    """
    Şirkət əlaqə məlumatları - SADƏCƏ 1 DƏFƏ DOLDURULACAQ
    Bu model sol tərəfdə göstərilən məlumatlar üçündür
    """
    # İstifadəçi məlumatları (əgər giriş edibsə)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='İstifadəçi', blank=True, null=True)
    # Əlaqə məlumatları (şirkət məlumatları)
    address = models.CharField(max_length=255, verbose_name='Ünvan', help_text='Maksimum 255 simvol',blank=True, null=True)
    call_us = models.CharField(max_length=20, verbose_name='Telefon', help_text='Maksimum 20 simvol', blank=True, null=True)
    email_us = models.EmailField(verbose_name='Email', help_text='Email ünvanı',blank=True, null=True)
    location = models.CharField(max_length=255, verbose_name='Lokasiya', help_text='Maksimum 255 simvol (Google Maps linki və ya ünvan)', blank=True, null=True)
    # Aktiv məlumat (yalnız bir aktiv məlumat ola bilər)
    is_active = models.BooleanField(default=True,verbose_name='Aktiv',help_text='Bu məlumat aktivdir? (Yalnız bir aktiv məlumat ola bilər)')

    class Meta:
        verbose_name = 'Məkan Məlumatları'
        verbose_name_plural = 'Əlaqə Məlumatları'
        ordering = ['-is_active', '-created']

    def __str__(self):
        return f"{self.address[:30]}... - {self.call_us}"

    def save(self, *args, **kwargs):
        """Yalnız bir aktiv məlumat olmasını təmin et"""
        if self.is_active:
            # Bütün digər məlumatları deaktiv et
            ContactLocationsModel.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)



class ContactUsModel(BaseModel):
    """
    Contact Us modeli - İstifadəçilərin göndərdiyi mesajlar üçün
    Bu model sağ tərəfdəki form məlumatları üçündür
    """
    # İstifadəçi məlumatları (əgər giriş edibsə)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='İstifadəçi', blank=True, null=True)
    # Kontakt form məlumatları
    first_name = models.CharField(max_length=255, verbose_name='Ad', help_text='Maksimum 255 simvol')
    last_name = models.CharField(max_length=255,verbose_name='Soyad',help_text='Maksimum 255 simvol')
    email_address = models.EmailField(verbose_name='Email Ünvanı', help_text='Düzgün email formatı daxil edin')
    subject = models.CharField(max_length=255, verbose_name='Mövzu', help_text='Maksimum 255 simvol')
    message = models.TextField(verbose_name='Mesaj', help_text='Mesajınızı daxil edin')
    # Status və metadata
    is_read = models.BooleanField(default=False, verbose_name='Oxundu', help_text='Admin tərəfindən oxundu?')
    
    class Meta:
        verbose_name = 'Əlaqə Mesajı'
        verbose_name_plural = 'Əlaqə Mesajları'
        ordering = ['-created']

    def __str__(self):
        return f"{self.first_name} - {self.last_name}"