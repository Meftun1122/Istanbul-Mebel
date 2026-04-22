from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
import openpyxl
from .models import CartItem, WishlistModel, CheckoutModel
# Register your models here.

# ================================================== #
#                     CART ADMIN                       #
# ================================================== #

@admin.register(CartItem)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user_info', 'product_info', 'quantity', 'total_price_display']
    list_display_links = ['user_info', 'product_info']
    search_fields = ['user__email', 'user__username', 'product__title']
    list_filter = ['quantity']
    list_per_page = 20
    raw_id_fields = ['product']
    
    fieldsets = (
        ('Müştəri Məlumatları', {
            'fields': ('user',),
            'classes': ('wide',)
        }),
        ('Məhsul Məlumatları', {
            'fields': ('product', 'quantity'),
            'classes': ('wide',),
        }),
    )
    
    def user_info(self, obj):
        return format_html(
            '{}<br><small style="color: #666;">{}</small>',
            obj.user.get_full_name() or obj.user.username,
            obj.user.email
        )
    user_info.short_description = 'İstifadəçi'
    
    def product_info(self, obj):
        return format_html(
            '{}<br><small style="color: #666;">₺{}</small>',
            obj.product.title,
            obj.product.special_price or obj.product.old_price
        )
    product_info.short_description = 'Məhsul'
    
    def total_price_display(self, obj):
        return format_html(
            '<span style="font-weight: 700; color: #28a745;">₺{}</span>',
            obj.total_price
        )
    total_price_display.short_description = 'Ümumi Qiymət'


# ================================================== #
#                   WISHLIST ADMIN                   #
# ================================================== #

@admin.register(WishlistModel)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user_info', 'product_info', 'added_date']
    list_display_links = ['user_info', 'product_info']
    search_fields = ['user__email', 'user__username', 'product__title']
    list_per_page = 20
    raw_id_fields = ['product']
    
    fieldsets = (
        ('Müştəri Məlumatları', {
            'fields': ('user',),
            'classes': ('wide',)
        }),
        ('Məhsul Məlumatları', {
            'fields': ('product',),
            'classes': ('wide',),
        }),
    )
    
    def user_info(self, obj):
        return format_html(
            '{}<br><small style="color: #666;">{}</small>',
            obj.user.get_full_name() or obj.user.username,
            obj.user.email
        )
    user_info.short_description = 'İstifadəçi'
    
    def product_info(self, obj):
        return format_html(
            '{}<br><small style="color: #666;">₺{}</small>',
            obj.product.title,
            obj.product.special_price or obj.product.old_price
        )
    product_info.short_description = 'Məhsul'
    
    def added_date(self, obj):
        return format_html(
            '<span style="color: #666;">{}</span>',
            obj.created_at.strftime('%d %b %Y, %H:%M')
        )
    added_date.short_description = 'Əlavə olunma tarixi'


# ================================================== #
#                   CHECKOUT ADMIN                   #
# ================================================== #
@admin.register(CheckoutModel)
class CheckoutAdmin(admin.ModelAdmin):
    """
    Checkout modeli üçün admin panel konfiqurasiyası
    """
    
    # ========== LIST DISPLAY ==========
    list_display = [
        'order_id',
        'customer_name',
        'email_display',
        'location_display',
        'order_date_display',
        'shipping_status',
        'action_buttons'
    ]
    list_display_links = ['order_id', 'customer_name']
    
    # ========== SEARCH & FILTERS ==========
    search_fields = [
        'first_name',
        'last_name',
        'email_address',
        'address',
        'city',
        'tel_number',
        'shipping_phone_number'
    ]
    list_filter = ['city']
    list_per_page = 20
    list_max_show_all = 100
    
    # ========== FIELDSETS (AZƏRBAYCANCA) ==========
    fieldsets = (
        ('👤 Müştəri Məlumatları', {
            'fields': ('first_name', 'last_name', 'email_address', 'tel_number'),
            'classes': ('wide',),
            'description': 'Müştəri haqqında əsas məlumatlar'
        }),
        ('📍 Çatdırılma Ünvanı', {
            'fields': ('address', 'city'),
            'classes': ('wide',),
            'description': 'Əsas çatdırılma ünvanı'
        }),
        ('🔄 Fərqli Çatdırılma Ünvanı', {
            'fields': (
                'shipping_first_name', 'shipping_last_name', 'shipping_email',
                'shipping_phone_number', 'shipping_city', 'shipping_address',
            ),
            'classes': ('wide', 'collapse'),
            'description': 'Yalnız fərqli ünvana göndəriləcəksə doldurun'
        }),
        ('📝 Sifariş Qeydləri', {
            'fields': ('order_note',),
            'classes': ('wide',),
        }),
    )
    
    readonly_fields = []
    
    # ========== CUSTOM METHODS ==========
    def order_id(self, obj):
        return format_html(
            '<span style="font-weight: 600; color: #149ddd; background: #f0f7ff; '
            'padding: 3px 8px; border-radius: 20px;">#ORD-{}</span>',
            str(obj.id).zfill(4)
        )
    order_id.short_description = 'Sifariş ID'
    order_id.admin_order_field = 'id'
    
    def customer_name(self, obj):
        return format_html(
            '<span style="font-weight: 500;">{} {}</span>',
            obj.first_name,
            obj.last_name
        )
    customer_name.short_description = 'Müştəri'
    customer_name.admin_order_field = 'first_name'
    
    def email_display(self, obj):
        return format_html(
            '<a href="mailto:{}" style="color: #149ddd; text-decoration: none;">{}</a>',
            obj.email_address,
            obj.email_address
        )
    email_display.short_description = 'Email'
    
    def location_display(self, obj):
        return format_html(
            '<span style="font-weight: 500;">{}</span>',
            obj.city
        )
    location_display.short_description = 'Şəhər'
    
    def order_date_display(self, obj):
        if hasattr(obj, 'created_at') and obj.created_at:
            return format_html(
                '<span style="color: #666;">{}<br><small style="color: #999;">#{}</small></span>',
                obj.created_at.strftime('%d.%m.%Y'),
                obj.id
            )
        return format_html(
            '<span style="color: #999;">—</span>'
        )
    order_date_display.short_description = 'Tarix'
    
    def shipping_status(self, obj):
        if obj.shipping_address:
            return format_html(
                '<span style="color: #28a745; background: #e8f5e9; padding: 3px 8px; '
                'border-radius: 20px; font-size: 12px; white-space: nowrap;">✅ Fərqli</span>'
            )
        return format_html(
            '<span style="color: #6c757d; background: #f8f9fa; padding: 3px 8px; '
            'border-radius: 20px; font-size: 12px; white-space: nowrap;">📍 Əsas</span>'
        )
    shipping_status.short_description = 'Çatdırılma növü'
    
    def action_buttons(self, obj):
        try:
            view_url = reverse('admin:Order_checkoutmodel_change', args=[obj.id])
        except:
            view_url = f"/admin/Order/checkoutmodel/{obj.id}/change/"
        
        return format_html(
            '<div style="display: flex; gap: 5px;">'
            '<a href="{}" style="background: #149ddd; color: white; padding: 4px 10px; '
            'border-radius: 20px; text-decoration: none; font-size: 12px;">🔍 Bax</a>'
            '<a href="{}" style="background: #28a745; color: white; padding: 4px 10px; '
            'border-radius: 20px; text-decoration: none; font-size: 12px;">✏️ Redaktə</a>'
            '</div>',
            view_url,
            view_url
        )
    action_buttons.short_description = 'Əməliyyatlar'
    
    # ========== EXPORT FUNCTIONS ==========
    actions = ['export_to_csv']
    
    def export_to_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse
        from datetime import datetime
        
        response = HttpResponse(content_type='text/csv')
        filename = f"checkout_orders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Sifariş ID', 'Ad', 'Soyad', 'Email', 'Şəhər', 'Telefon', 
            'Fərqli Ünvan', 'Fərqli Telefon'
        ])
        
        for obj in queryset:
            writer.writerow([
                f"ORD-{obj.id:04d}",
                obj.first_name,
                obj.last_name,
                obj.email_address,
                obj.city,
                obj.tel_number or '',
                'Bəli' if obj.shipping_address else 'Xeyr',
                obj.shipping_phone_number or ''
            ])
        
        return response
    export_to_csv.short_description = "📥 CSV export et"
    
    # ========== OPTIMIZE QUERYSET ==========
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()