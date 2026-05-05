from modeltranslation.translator import translator, TranslationOptions, register
from .models import CategoryModel, ManufacturerModel, ColorModel, ProductModel

@register(CategoryModel)
class CategoryTranslation(TranslationOptions):
    fields = ('title',)

@register(ManufacturerModel)
class ManufacturerTranslation(TranslationOptions):
    fields = ('title',)

@register(ColorModel)
class ColorTranslation(TranslationOptions):
    fields = ('title',)

@register(ProductModel)
class ProductTranslation(TranslationOptions):
    fields = ('title', 'description', 'text',)