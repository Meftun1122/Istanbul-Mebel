from django import template
from django.utils.translation import get_language

register = template.Library()

@register.filter
def color_title(color):
    """Cari dilə görə rəng adını qaytar"""
    if not color:
        return ''
    
    lang = get_language()
    
    if lang == 'az':
        return color.title_az or color.title
    elif lang == 'en':
        return color.title_en or color.title
    elif lang == 'ru':
        return color.title_ru or color.title
    else:
        return color.title