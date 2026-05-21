from .models import CartItem, WishlistModel

def mini_cart(request):
    """
    Bütün template-lərdə istifadə oluna bilən cart məlumatları
    """
    context = {
        'mini_cart_items': [],
        'mini_cart_count': 0,
        'mini_cart_total': 0,
        'wishlist_items': [],
        'wishlist_count': 0,
    }
    
    if request.user.is_authenticated:
        # Cart məlumatları
        cart_items = CartItem.objects.filter(
            user=request.user,
            product__isnull=False
        ).select_related('product')
        
        cart_count = cart_items.count()
        
        # Wishlist məlumatları
        wishlist_items = WishlistModel.objects.filter(
            user=request.user,
            product__isnull=False
        ).select_related('product')
        
        wishlist_count = wishlist_items.count()
        
        # Cart items - template üçün
        cart_data = []
        total = 0
        for item in cart_items:
            price = item.product.special_price or item.product.old_price or 0
            total += price * item.quantity
            
            image_url = None
            if item.product.product_image:
                image_url = item.product.product_image.url
            elif item.product.cov_img:
                image_url = item.product.cov_img.url
            
            cart_data.append({
                'id': item.id,
                'product': item.product,
                'product_id': item.product.id,
                'title': item.product.title, 
                'product_title': item.product.title,
                'image': image_url,  
                'product_image': image_url,
                'price': price,
                'quantity': item.quantity,
                'total': price * item.quantity,
            })
        
        # Wishlist items - template üçün
        wishlist_data = []
        for item in wishlist_items:
            price = item.product.special_price or item.product.old_price or 0
            
            image_url = None
            if item.product.product_image:
                image_url = item.product.product_image.url
            elif item.product.cov_img:
                image_url = item.product.cov_img.url
            
            wishlist_data.append({
                'id': item.id,
                'product': item.product,
                'product_id': item.product.id,
                'title': item.product.title,  
                'product_title': item.product.title,
                'image': image_url,  
                'product_image': image_url,
                'price': price,
            })
        
        context.update({
            'mini_cart_items': cart_data,
            'mini_cart_count': cart_count,
            'mini_cart_total': round(total, 2),
            'wishlist_items': wishlist_data,
            'wishlist_count': wishlist_count,
        })
    
    return context