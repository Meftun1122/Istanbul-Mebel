from django.urls import path
from . import views


urlpatterns = [
    # Cart URLs
    path('cart/', views.CartView.as_view(), name='all_carts'),  
    path('ajax/add-to-cart/', views.AjaxAddToCartView.as_view(), name='ajax_add_to_cart'),
    path('cart/ajax/get-cart-data/', views.AjaxGetCartDataView.as_view(), name='ajax_get_cart_data'),  # ƏLAVƏ EDİLDİ
    path('update-cart/', views.UpdateCartView.as_view(), name='update_cart'),
    path('remove_from_cart/<int:item_id>/', views.RemoveFromCartView.as_view(), name='remove_from_cart'),

    # Wishlist URLs
    path('wishlist/', views.WishlistView.as_view(), name='all_list'),
    path('ajax/add-to-wishlist/', views.AjaxAddToWishlistView.as_view(), name='ajax_add_to_wishlist'),
    path('wishlist/ajax/get-wishlist-data/', views.AjaxGetWishlistDataView.as_view(), name='ajax_get_wishlist_data'),  # ƏLAVƏ EDİLDİ
    path('wishlist/remove/<int:item_id>/', views.RemoveFromWishlistView.as_view(), name='remove_from_wishlist'),
    path('wishlist/move-to-cart/<int:product_id>/', views.MoveToCartView.as_view(), name='move_to_cart'),

    # Checkout URLs
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('order-success/', views.OrderSuccessView.as_view(), name='order_success'),
]