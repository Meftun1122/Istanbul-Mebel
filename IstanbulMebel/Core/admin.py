from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import ServicesModel
from django.utils.html import format_html

# Register your models here.

@admin.register(ServicesModel)
class ServicesAdmin(TranslationAdmin):
    list_display = ['title_az', 'short_description', 'cov_img_preview', 'icons_preview']
    list_display_links = ['title_az']
    search_fields = ['title_az', 'title_en', 'title_ru', 'descriptions_az', 'descriptions_en', 'descriptions_ru']
    list_filter = []
    readonly_fields = ['cov_img_preview', 'icons_preview']
    
    fieldsets = (
        ('Azərbaycanca', {
            'fields': ('title_az', 'descriptions_az', 'details_header_az', 'details_text1_az', 'details_text2_az', 'details_text3_az'),
            'classes': ('wide',)
        }),
        ('İngiliscə', {
            'fields': ('title_en', 'descriptions_en', 'details_header_en', 'details_text1_en', 'details_text2_en', 'details_text3_en'),
            'classes': ('wide', 'collapse'),
        }),
        ('Rusca', {
            'fields': ('title_ru', 'descriptions_ru', 'details_header_ru', 'details_text1_ru', 'details_text2_ru', 'details_text3_ru'),
            'classes': ('wide', 'collapse'),
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
        if obj.descriptions_az:
            text = obj.descriptions_az[:50] + '...' if len(obj.descriptions_az) > 50 else obj.descriptions_az
            return text
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