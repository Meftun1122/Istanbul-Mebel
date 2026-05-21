from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import ProductModel, CategoryModel, ManufacturerModel, ColorModel, ReviewModel
from django.utils.html import format_html
from django.db import models

admin.site.site_header = 'İstanbulMebel Admin Panel'
admin.site.site_title = 'İstanbulMebel'





@admin.register(ProductModel)
class ProductAdmin(TranslationAdmin):
    search_fields = ('title_az', 'title_en', 'title_ru')
    
    list_display = ['title_az', 'category', 'manufacturer', 'color', 'discount', 'get_product_image']
    list_editable = ['category', 'manufacturer', 'color', 'discount']
    
    readonly_fields = ['get_product_image', 'preview_1', 'preview_2', 'preview_3', 'preview_4', 'preview_5']
    
    fieldsets = (
        ('Azərbaycanca', {
            'fields': ('title_az', 'description_az', 'text_az')
        }),
        ('İngiliscə', {
            'fields': ('title_en', 'description_en', 'text_en'),
            'classes': ('collapse',)
        }),
        ('Rusca', {
            'fields': ('title_ru', 'description_ru', 'text_ru'),
            'classes': ('collapse',)
        }),
        ('Qiymət Məlumatları', {
            'fields': ('special_price', 'old_price', 'discount', 'stock')
        }),
        ('Kategoriya', {
            'fields': ('category', 'manufacturer', 'color')
        }),
        ('Şəkil Məlumatları', {
            'fields': (
                'product_image', 'get_product_image',
                'product_detail_imge1', 'preview_1',
                'product_detail_imge2', 'preview_2',
                'product_detail_imge3', 'preview_3',
                'product_detail_imge4', 'preview_4',
                'product_detail_imge5', 'preview_5',
                'cov_img',
            )
        }),
    )

    def get_product_image(self, obj):
        if obj.product_image:
            return format_html('<img src="{}" width="135px"/>', obj.product_image.url)
        return format_html('<b style="color:red">Şəkil tapılmadı</b>')
    get_product_image.short_description = 'Əsas şəkil önizləmə'

    def preview_1(self, obj):
        if obj.product_detail_imge1:
            return format_html('<img src="{}" width="100px"/>', obj.product_detail_imge1.url)
        return format_html('<b style="color:red">Şəkil yoxdur</b>')
    preview_1.short_description = 'Önizləmə 1'

    def preview_2(self, obj):
        if obj.product_detail_imge2:
            return format_html('<img src="{}" width="100px"/>', obj.product_detail_imge2.url)
        return format_html('<b style="color:red">Şəkil yoxdur</b>')
    preview_2.short_description = 'Önizləmə 2'

    def preview_3(self, obj):
        if obj.product_detail_imge3:
            return format_html('<img src="{}" width="100px"/>', obj.product_detail_imge3.url)
        return format_html('<b style="color:red">Şəkil yoxdur</b>')
    preview_3.short_description = 'Önizləmə 3'

    def preview_4(self, obj):
        if obj.product_detail_imge4:
            return format_html('<img src="{}" width="100px"/>', obj.product_detail_imge4.url)
        return format_html('<b style="color:red">Şəkil yoxdur</b>')
    preview_4.short_description = 'Önizləmə 4'

    def preview_5(self, obj):
        if obj.product_detail_imge5:
            return format_html('<img src="{}" width="100px"/>', obj.product_detail_imge5.url)
        return format_html('<b style="color:red">Şəkil yoxdur</b>')
    preview_5.short_description = 'Önizləmə 5'






@admin.register(ReviewModel)
class ReviewModelAdmin(admin.ModelAdmin):
    # ========== LIST DISPLAY ==========
    list_display = [
        'user_info',
        'product_info',
        'review_id',
        'rating_display',
        'likes_displays',
        'created_info',
        'status_badge',
    ]
    
    list_display_links = ['review_id', 'user_info']
    
    # ========== SEARCH & FILTERS ==========
    search_fields = [
        'name', 'surname', 'text', 
        'product__title', 'product__id',
        'reply_to_name'
    ]
    
    list_filter = [
        'rating',
        'is_active',
        'created',
        ('parent', admin.EmptyFieldListFilter),
    ]
    
    date_hierarchy = 'created'
    list_per_page = 25
    list_max_show_all = 100
    
    # ========== FIELDSETS (AZƏRBAYCANCA) ==========
    fieldsets = (
        ('📦 MƏHSUL MƏLUMATLARI', {
            'fields': ('product',),
            'classes': ('wide',),
        }),
        
        ('👤 İSTİFADƏÇİ MƏLUMATLARI', {
            'fields': ('name', 'surname'),
            'classes': ('wide',),
        }),
        
        ('📝 RƏY MƏZMUNU', {
            'fields': ('text', 'rating', 'parent'),
            'classes': ('wide',),
        }),
        
        ('❤️ STATİSTİKA', {
            'fields': ('likes', 'dislikes'),
            'classes': ('wide', 'collapse'),
        }),
        
        ('🔄 CAVAB MƏLUMATLARI', {
            'fields': ('reply_to_name',),
            'classes': ('wide', 'collapse'),
        }),
        
        ('⚙️ STATUS', {
            'fields': ('is_active',),
            'classes': ('wide',),
        }),
    )
    
    readonly_fields = ['created', 'updated', 'likes', 'dislikes']
    
    actions = ['make_active', 'make_inactive', 'delete_selected']
    
    # ========== CUSTOM METHODS (AZƏRBAYCANCA BAŞLIQLAR) ==========
    
    def review_id(self, obj):
        if not obj or not obj.id:
            return '-'
        
        if obj.is_reply:
            return format_html(
                '<span style="color: #28a745; font-weight: 500;">#REP-{}</span>',
                str(obj.id).zfill(4)
            )
        return format_html(
            '<span style="color: #149ddd; font-weight: 600;">#REV-{}</span>',
            str(obj.id).zfill(4)
        )
    review_id.short_description = 'ID'
    review_id.admin_order_field = 'id'
    
    def product_info(self, obj):
        if not obj.product:
            return '-'
        return format_html(
            '<span style="font-weight: 500;">{}<br><small style="color: #666;">ID: {}</small></span>',
            obj.product.title,
            obj.product.id
        )
    product_info.short_description = 'Məhsul'
    product_info.admin_order_field = 'product__title'
    
    def user_info(self, obj):
        if obj.is_reply and obj.reply_to_name:
            return format_html(
                '<span style="font-weight: 600;">{} {}</span><br>'
                '<small style="color: #149ddd;">↳ Cavab: @{}</small>',
                obj.name,
                obj.surname,
                obj.reply_to_name
            )
        return format_html(
            '<span style="font-weight: 600;">{} {}</span>',
            obj.name,
            obj.surname
        )
    user_info.short_description = 'İstifadəçi'
    user_info.admin_order_field = 'name'
    
    def rating_display(self, obj):
        if not obj.rating:
            return format_html('<span style="color: #999;">—</span>')
        
        stars = obj.get_rating_display_stars()
        return format_html(
            '<span style="color: #ffc107; font-size: 16px;" title="{} ulduz">{} {}/5</span>',
            str(obj.rating),
            stars,
            str(obj.rating)
        )
    rating_display.short_description = 'Reytinq'
    rating_display.admin_order_field = 'rating'
    
    def likes_displays(self, obj):
        return format_html(
            '<span style="color: #28a745;">👍 {}</span> | <span style="color: #dc3545;">👎 {}</span>',
            str(obj.likes),
            str(obj.dislikes)
        )
    likes_displays.short_description = 'Bəyənmə/Bəyənməmə'
    
    def created_info(self, obj):
        if not obj.created:
            return '-'
        return format_html(
            '<span title="{}">{}</span><br><small style="color: #999;">{}</small>',
            obj.created.strftime('%Y-%m-%d %H:%M:%S'),
            obj.created.strftime('%d.%m.%Y'),
            obj.created.strftime('%H:%M')
        )
    created_info.short_description = 'Yaradılma tarixi'
    created_info.admin_order_field = 'created'
    
    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 4px 8px; '
                'border-radius: 20px; font-size: 11px; font-weight: 600;">AKTİV</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 4px 8px; '
            'border-radius: 20px; font-size: 11px; font-weight: 600;">DEAKTİV</span>'
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_active'
    
    # ========== ACTIONS (AZƏRBAYCANCA) ==========
    
    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} rəy uğurla aktiv edildi.')
    make_active.short_description = "✅ Seçilmiş rəyləri aktiv et"
    
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} rəy uğurla deaktiv edildi.')
    make_inactive.short_description = "❌ Seçilmiş rəyləri deaktiv et"
    
    def delete_selected(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} rəy uğurla silindi.')
    delete_selected.short_description = "🗑️ Seçilmiş rəyləri sil"
    
    # ========== OVERRIDE METHODS ==========
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'product', 'parent'
        ).prefetch_related('replies')
    
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.is_reply:
            return self.readonly_fields + ['rating', 'parent']
        return self.readonly_fields
    
    def save_model(self, request, obj, form, change):
        if not change and obj.is_reply:
            obj.rating = None
        super().save_model(request, obj, form, change)
    
    # ========== STATISTICS ==========
    
    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context)
        
        try:
            qs = response.context_data['cl'].queryset
        except (AttributeError, KeyError):
            return response
        
        total_reviews = qs.count()
        active_reviews = qs.filter(is_active=True).count()
        total_likes = qs.aggregate(total=models.Sum('likes'))['total'] or 0
        avg_rating = qs.filter(rating__isnull=False).aggregate(avg=models.Avg('rating'))['avg']
        
        response.context_data['stats'] = {
            'total': total_reviews,
            'active': active_reviews,
            'inactive': total_reviews - active_reviews,
            'likes': total_likes,
            'avg_rating': round(avg_rating, 1) if avg_rating else 0,
        }
        
        return response
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }
        js = ('admin/js/custom_admin.js',)



@admin.register(CategoryModel)
class CategoryAdmin(TranslationAdmin):
    pass


@admin.register(ManufacturerModel)
class ManufacturerAdmin(TranslationAdmin):
    pass


@admin.register(ColorModel)
class ColorAdmin(TranslationAdmin):
    pass