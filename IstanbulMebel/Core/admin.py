from django.contrib import admin
from .models import ServicesModel
from django.utils.html import format_html
# Register your models here.

@admin.register(ServicesModel)
class ServicesAdmin(admin.ModelAdmin):
    list_display = ['title', 'short_description', 'cov_img_preview', 'icons_preview']
    list_display_links = ['title']
    search_fields = ['title', 'descriptions', 'details_header']
    list_filter = []
    readonly_fields = ['cov_img_preview', 'icons_preview']
    fieldsets = (
        ('Əsas Məlumatlar', {
            'fields': ('title', 'descriptions', 'details_header'),
            'classes': ('wide',)
        }),
        
        ('Ətraflı Məlumatlar', {
            'fields': ('details_text1', 'details_text2', 'details_text3'),
            'classes': ('wide', 'extrapretty'),
        }),
        
        ('Cover Şəkli', {
            'fields': ('cov_img', 'cov_img_preview'),
            'classes': ('wide',),
        }),
        
        ('İkon Şəkli', {
            'fields': ('icons', 'icons_preview'),
            'classes': ('wide',),
        }),
    )

    def short_description(self, obj):
        if obj.descriptions:
            return obj.descriptions[:50] + '...' if len(obj.descriptions) > 50 else obj.descriptions
        return '-'
    short_description.short_description = 'Qısa açıqlama'
    
    def cov_img_preview(self, obj):
        if obj.cov_img and hasattr(obj.cov_img, 'url'):
            return format_html(
                '<img src="{}" width="140px" height="90px" style="object-fit: cover; border: 2px solid #149ddd; border-radius: 6px;" />',
                obj.cov_img.url
            )
        return format_html(
            '<div style="border: 2px dashed #ccc; border-radius: 6px; padding: 25px 15px; background: #f5f5f5; text-align: center;">'
            '<span style="color: #999; font-size: 12px;">Şəkil yoxdur</span>'
            '</div>'
        )
    cov_img_preview.short_description = 'Cover önizləmə'
    
    def icons_preview(self, obj):
        if obj.icons and hasattr(obj.icons, 'url'):
            return format_html(
                '<img src="{}" width="70px" height="70px" style="object-fit: contain; border: 2px solid #28a745; border-radius: 50%;" />',
                obj.icons.url
            )
        return format_html(
            '<div style="border: 2px dashed #ccc; border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">'
            '<span style="color: #999; font-size: 10px;">İkon yoxdur</span>'
            '</div>'
        )
    icons_preview.short_description = 'İkon önizləmə'
    
    class Media:
        css = {
            'all': ('admin/css/services_admin.css',)
        }