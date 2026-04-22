from django.db import models
from django.utils.html import format_html
from IstanbulMebel.utils.base import BaseModel
# Create your models here.


class ServicesModel(BaseModel):
    title = models.CharField(max_length=50, verbose_name='Servis növü', help_text='Maksimum 100 simvol')
    descriptions = models.CharField(max_length=250, verbose_name='Xidmət təsviri')
    details_header = models.CharField(max_length=250, verbose_name='Detaylı Xidmətlər başlığı', help_text='Maksimum 250 simvol')
    details_text1 = models.TextField(verbose_name='Xidmət haqqında-1', blank=True, null=True)
    details_text2 = models.TextField(verbose_name='Xidmət haqqında-2', blank=True, null=True)
    details_text3 = models.TextField(verbose_name='Xidmət haqqında-3', blank=True, null=True)
    cov_img = models.ImageField(upload_to='Core/cov_img', verbose_name='Xidmətin üz şəkili', null=True, blank=True)
    icons = models.ImageField(upload_to='Core/service_image',verbose_name='Xidmət şəkili', blank=True, null=True)


    class Meta:
        verbose_name = 'Servis'
        verbose_name_plural = 'Bütün Servislər'


    def __str__(self):
        return self.title

