from modeltranslation.translator import translator, TranslationOptions, register
from .models import ServicesModel

@register(ServicesModel)  
class ServicesTranslation(TranslationOptions):  
    fields = ('title', 'descriptions', 'details_header', 'details_text1', 'details_text2', 'details_text3')