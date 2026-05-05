from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import ProductModel, CategoryModel, ManufacturerModel, ColorModel, ReviewModel
from django.utils.html import format_html

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
    list_display = ['id', 'name', 'product', 'rating', 'is_active', 'created']
    list_filter = ['is_active', 'rating', 'created']
    search_fields = ['name', 'surname', 'text', 'product__title_az']


@admin.register(CategoryModel)
class CategoryAdmin(TranslationAdmin):
    pass


@admin.register(ManufacturerModel)
class ManufacturerAdmin(TranslationAdmin):
    pass


@admin.register(ColorModel)
class ColorAdmin(TranslationAdmin):
    pass