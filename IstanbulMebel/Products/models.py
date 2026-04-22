from django.db import models
from IstanbulMebel.utils.base import BaseModel
from django.conf import settings
# Create your models here.
 

#  ========================================================  #
#                       Category Model                       #
#  ========================================================  #

class CategoryModel(BaseModel):
    title = models.CharField(max_length=50, verbose_name='Kateqoriya növü', help_text='Maximum 50 character')
    descriptions = models.TextField(verbose_name='Kateqoriya haqqında', blank=True, null=True)
    
    class Meta:
        verbose_name = 'Kateqoriya'
        verbose_name_plural = 'Kateqoriyalar'
        
    def __str__(self):
        return self.title


#  ========================================================  #
#                      Manufacturer Model                    #
#  ========================================================  #
    
class ManufacturerModel(BaseModel):
    title = models.CharField(max_length=50, verbose_name='Məhsul İstehsalcısı', help_text='Maximum 50 character')
    description = models.TextField(verbose_name='İstehsalçı haqqında', blank=True, null=True)

    class Meta:
        verbose_name = 'İstehsalçı'
        verbose_name_plural = 'İstehsalçılar'

    def __str__(self):
        return self.title


#  ========================================================  #
#                       Color Model                          #
#  ========================================================  #

class ColorModel(BaseModel):
    title = models.CharField(max_length=50, verbose_name='Rəngin adı', help_text='Maximum 50 character')
    product_color = models.CharField(max_length=50, verbose_name='Məhsulun Rəngi', help_text='Maximum 50 character')
    description = models.TextField(verbose_name='Rəng haqqında', blank=True, null=True)

    class Meta:
        verbose_name = 'Rəng'
        verbose_name_plural = 'Rənglər'

    def __str__(self):
        return self.title



#  ========================================================  #
#                       Product Model                        #
#  ========================================================  #

class ProductModel(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, verbose_name='User')
    title = models.CharField(max_length=100, verbose_name='Məhsul adı')
    descriptions = models.TextField(verbose_name='Məhsul haqqında', blank=True, null=True)
    special_price = models.FloatField(default=0, verbose_name='Yeni qiymət')
    old_price = models.FloatField(default=0, verbose_name='Köhnə qiymət')
    discount = models.IntegerField(verbose_name='Endirim', blank=True, null=True)
    category = models.ForeignKey(CategoryModel, on_delete=models.CASCADE, verbose_name='Məhsulun kateqoriyası', blank=True, null=True)
    manufacturer = models.ForeignKey(ManufacturerModel, on_delete=models.CASCADE, verbose_name='Məhsulun İstehsalçısı', blank=True, null=True)
    color = models.ForeignKey(ColorModel, on_delete=models.CASCADE, verbose_name='Məhsul Rəngi', blank=True, null=True)
    stock =  models.PositiveIntegerField(default=0, verbose_name='Stok sayı',help_text='Məhsulun anbarda olan sayı')
    text = models.TextField(verbose_name='Məhsul haqqında məlumat', blank=True, null=True)
    product_image = models.ImageField(upload_to='product/product_image', verbose_name='Məhsulun Şəkili')
    cov_img = models.ImageField(upload_to='product/cov_img', verbose_name=' Məhsulun üz qabıq şəkili', null=True, blank=True)
    rating = models.DecimalField(default=0, max_digits=2, decimal_places=1)
    # << Detailed product image
    product_detail_imge1 = models.ImageField(upload_to='product/detail_image', verbose_name='Detaylı şəkil-1', null=True, blank=True)
    product_detail_imge2 = models.ImageField(upload_to='product/detail_image', verbose_name='Detaylı şəkil-2', null=True, blank=True)
    product_detail_imge3 = models.ImageField(upload_to='product/detail_image', verbose_name='Detaylı şəkil-3', null=True, blank=True)
    product_detail_imge4 = models.ImageField(upload_to='product/detail_image', verbose_name='Detaylı şəkil-4', null=True, blank=True)
    product_detail_imge5 = models.ImageField(upload_to='product/detail_image', verbose_name='Detaylı şəkil-5', null=True, blank=True)
    # Detailed product image end >>

    class Meta:
        verbose_name = 'Məhsul'
        verbose_name_plural = 'Bütün Məhsullar'

    def __str__(self):
        return self.title
    

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return sum(reviews.rating for review in reviews) / reviews.count()
        return 0 
    



class ReviewModel(BaseModel): 
    """
    Məhsul rəyləri və reply-lər üçün model
    """
    # Əsas əlaqələr
    product = models.ForeignKey(ProductModel, on_delete=models.CASCADE, related_name='reviews', verbose_name='Məhsul')
    # Reply sistemi üçün self foreign key
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name='Ana rəy')
    # İstifadəçi məlumatları
    name = models.CharField(max_length=100, verbose_name='Ad')
    surname = models.CharField(max_length=100, verbose_name='Soyad')
    # Rəy mətni
    text = models.TextField(verbose_name='Rəy mətini')
    # Rating (yalnız əsas rəylər üçün, reply-lər üçün null)
    rating = models.PositiveIntegerField(choices=[(i, f'{i} Star') for i in range(1, 6)], verbose_name='Qiyymetləndirmə', null=True, blank=True)
    # Like/Dislike sistemi
    likes = models.PositiveIntegerField(default=0, verbose_name='Bəyənilmə')
    dislikes = models.PositiveIntegerField(default=0, verbose_name='Bəyənilməmə')
    # Mention üçün (kimə reply edilib) - ⚠️ DƏYİŞDİ: null=True silindi, default='' əlavə edildi
    reply_to_name = models.CharField(max_length=200, blank=True, default='', verbose_name='Cavab verən istifadəçi')
    # Aktiv statusu (admin tərəfindən gizlədilə bilər)
    is_active = models.BooleanField(default=True, verbose_name='Aktiv')
    
    class Meta:
        verbose_name = 'Komenntariya'
        verbose_name_plural = 'Rəylər'
        ordering = ['-created']  
        indexes = [
            models.Index(fields=['product', '-created']), 
            models.Index(fields=['parent']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        if self.parent:
            return f"{self.name} {self.surname} → {self.parent.name} {self.parent.surname} üçün cavab"
        return f"{self.name} {self.surname} - {self.rating}★"
    
    @property
    def full_name(self):
        """Tam adı qaytar"""
        return f"{self.name} {self.surname}".strip()
    
    @property
    def is_reply(self):
        """Reply olub-olmadığını yoxla"""
        return self.parent is not None
    
    def get_replies(self):
        """Bu review-ə aid bütün aktiv reply-ləri qaytar (tarixə görə sıralanmış)"""
        return self.replies.filter(is_active=True).order_by('created')
    
    def like(self):
        """Like sayını artır"""
        self.likes += 1
        self.save(update_fields=['likes'])
        return self.likes
    
    def dislike(self):
        """Dislike sayını artır"""
        self.dislikes += 1
        self.save(update_fields=['dislikes'])
        return self.dislikes
    
    def get_rating_display_stars(self):
        """Rating-i ulduz simvolları ilə qaytar"""
        if not self.rating:
            return ''
        return '★' * self.rating + '☆' * (5 - self.rating)
    
    def save(self, *args, **kwargs):
        """
        Save metodunu override edərək əlavə əməliyyatlar
        """
        if self.is_reply:
            self.rating = None
        super().save(*args, **kwargs)
