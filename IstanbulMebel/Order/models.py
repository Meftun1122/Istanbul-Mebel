from django.db import models
from IstanbulMebel.utils.base import BaseModel
from Products.models import ProductModel
from django.conf import settings
from django.contrib.auth.models import User
# Create your models here.


# ================================================== #
#                    Carts Item                      #
# ================================================== #
class CartItem(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(ProductModel, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = 'Səbət Əşyası'
        verbose_name_plural = 'Səbət Əşyaları'
        unique_together = ('user', 'product')
        ordering = ['created']  # Ən son əlavə edilən ilk sırada

    def __str__(self):
        return f"{self.user.email} - {self.product.title} x {self.quantity}"
    
    @property
    def total_price(self):
        """Məhsulun ümumi qiyməti (endirim varsa special_price, yoxsa price)"""
        price = self.product.special_price or self.product.price
        return price * self.quantity
    
    @property
    def unit_price(self):
        """Məhsulun vahid qiyməti"""
        return self.product.special_price or self.product.price


# ================================================== #
#                    wishlist Model                  #
# ================================================== #
class WishlistModel(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(ProductModel, on_delete=models.CASCADE, related_name='wishlist_items')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'İstək Listəsi'
        verbose_name_plural = 'İstək Listəsi'
        unique_together = ('user', 'product')
        ordering = ['created']  # Ən son əlavə edilən ilk sırada

    def __str__(self):
        return f"{self.user.email} - {self.product.title}"




# ================================================== #
#                   Checkout Model                   #
# ================================================== #
class CheckoutModel(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100, verbose_name='Ad', help_text='Maximum 100 characters')
    last_name = models.CharField(max_length=100, verbose_name='Soyad', help_text='Maximum 100 characters')
    email_address = models.EmailField(verbose_name='İstifadeçi E-mail')
    address = models.CharField(max_length=255, verbose_name='Ünvanınız', help_text='Maximum 255 characters')
    city = models.CharField(max_length=255, verbose_name='Şəhər', help_text='Maximum 255 characters') 
    tel_number = models.CharField(max_length=20, verbose_name='Telefon nömrəsi', blank=True, null=True)
    order_note = models.TextField(verbose_name='Sifariş qeydi', null=True, blank=True)  # ✅ BİR DƏFƏ

    # 🆕 SHIPPING (different address üçün)
    shipping_first_name = models.CharField(max_length=100, verbose_name="Ad", blank=True, null=True)
    shipping_last_name = models.CharField(max_length=100,verbose_name="Soyad", blank=True, null=True)
    shipping_email = models.EmailField(blank=True,verbose_name="E-mail", null=True)
    shipping_city = models.CharField(max_length=255,verbose_name="Şəhər", blank=True, null=True)
    shipping_address = models.CharField(max_length=255,verbose_name="Ünvan", blank=True, null=True)
    shipping_phone_number = models.CharField(max_length=20, verbose_name='Phone Number', blank=True, null=True)
    

    class Meta:
        verbose_name = 'Sifariş'
        verbose_name_plural = 'Sifarişlər'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
