from django import template

register = template.Library()

@register.filter
def calc_total(cart_item):
    """
    Səbət item-inin total qiymətini hesablayır
    """
    try:
        product = cart_item.product
        # special_price varsa onu istifadə et, yoxsa price-i
        price = product.special_price if product.special_price else product.price
        return price * cart_item.quantity
    except (AttributeError, TypeError, ValueError):
        return 0

@register.filter
def multiply(value, arg):
    """İki rəqəmi vurur"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0