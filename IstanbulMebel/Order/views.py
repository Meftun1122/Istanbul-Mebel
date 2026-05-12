from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.db.models import F
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django.views.generic.edit import FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse_lazy
from django.contrib import messages
from .models import CartItem, WishlistModel, CheckoutModel
from Products.models import ProductModel
from .forms import *



# ============================================= #
#                Carts View                     #
# ============================================= #
@method_decorator(csrf_protect, name='dispatch')
class CartView(LoginRequiredMixin, View):
    login_url = 'login'

    def get(self, request):
        cart_items = CartItem.objects.filter(
            user=request.user
        ).select_related(
            'product', 
            'product__manufacturer'
        )

        sub_total = sum(
            (item.product.special_price or item.product.old_price) * item.quantity 
            for item in cart_items
        )

        return render(request, 'carts.html', {
            'cart_items': cart_items,
            'sub_total': sub_total,
            'total': sub_total,
        })

    @method_decorator(csrf_protect)
    def post(self, request):
        product_id = request.POST.get('product_id')
        quantity = request.POST.get('quantity', 1)

        print(f"📝 CartView POST - product_id: {product_id}, quantity: {quantity}")

        if not product_id:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'Product ID is missing!'
                }, status=400)
            messages.error(request, "Product ID is missing!")
            return redirect('all_carts')

        try:
            quantity = int(quantity)
            if quantity < 1:
                quantity = 1
        except ValueError:
            quantity = 1

        try:
            product = get_object_or_404(ProductModel, id=product_id)

            cart_item, created = CartItem.objects.get_or_create(
                user=request.user,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                CartItem.objects.filter(id=cart_item.id).update(
                    quantity=F('quantity') + quantity
                )
                cart_item.refresh_from_db()
                message = f'"{product.title}" quantity updated to {cart_item.quantity}!'
            else:
                message = f'"{product.title}" added to cart!'

            deleted_count = WishlistModel.objects.filter(
                user=request.user, 
                product=product
            ).delete()
            
            if deleted_count[0] > 0:
                message += ' (Removed from wishlist)'

            cart_count = CartItem.objects.filter(user=request.user).count()
            wishlist_count = WishlistModel.objects.filter(user=request.user).count()

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': message,
                    'cart_count': cart_count,
                    'wishlist_count': wishlist_count,
                    'product_id': product_id
                })

            messages.success(request, message)

        except Exception as e:
            print(f"❌ CartView POST Error: {e}")

            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': f"An error occurred: {str(e)}"
                }, status=500)

            messages.error(request, f"An error occurred: {str(e)}")

        referer = request.META.get('HTTP_REFERER')
        if referer and 'wishlist' in referer:
            return redirect('all_list')
        return redirect('all_carts')


# ============================================= #
#              Update Carts View                #
# ============================================= #
class UpdateCartView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request):
        updated = False
        updated_items = []

        for key, value in request.POST.items():
            if key.startswith('quantity_'):
                try:
                    cart_item_id = key.replace('quantity_', '')
                    
                    cart_item = get_object_or_404(
                        CartItem, 
                        id=cart_item_id, 
                        user=request.user
                    )
                    
                    try:
                        quantity = int(value)
                    except (ValueError, TypeError):
                        continue
                    
                    if quantity > 0 and cart_item.quantity != quantity:
                        cart_item.quantity = quantity
                        cart_item.save(update_fields=['quantity'])
                        updated = True
                        updated_items.append({
                            'id': cart_item_id,
                            'quantity': quantity
                        })

                except CartItem.DoesNotExist:
                    continue
                except Exception as e:
                    print(f"❌ UpdateCart Error: {e}")
                    continue

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if updated:
                cart_items = CartItem.objects.filter(
                    user=request.user
                ).select_related('product')
                
                subtotal = sum(
                    (item.product.special_price or item.product.old_price) * item.quantity 
                    for item in cart_items
                )
                cart_count = cart_items.count()
                wishlist_count = WishlistModel.objects.filter(user=request.user).count()

                return JsonResponse({
                    'success': True,
                    'message': "Cart updated successfully ✅",
                    'subtotal': float(subtotal),
                    'cart_count': cart_count,
                    'wishlist_count': wishlist_count,
                    'updated_items': updated_items
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': "No changes were made to your cart"
                })

        if updated:
            messages.success(request, "Cart updated successfully ✅")
        else:
            messages.warning(request, "No changes were made to your cart")

        return redirect('all_carts')


# ============================================= #
#              Remove Carts View                #
# ============================================= #
class RemoveFromCartView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request, item_id):
        cart_item = get_object_or_404(
            CartItem.objects.select_related('product'),
            id=item_id,
            user=request.user
        )

        product_name = cart_item.product.title
        product_id = cart_item.product.id
        cart_item.delete()
        
        cart_count = CartItem.objects.filter(user=request.user).count()
        wishlist_count = WishlistModel.objects.filter(user=request.user).count()

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': f"“{product_name}” səbətdən silindi 🗑️",
                'cart_count': cart_count,
                'wishlist_count': wishlist_count,
                'product_id': product_id
            })

        messages.success(request, f"“{product_name}” səbətdən silindi 🗑️")
        return redirect('all_carts')


# ============================================= #
#                Wishlist Views                 #
# ============================================= #
class WishlistView(LoginRequiredMixin, View):
    login_url = 'login'

    def get(self, request):
        wishlist_items = WishlistModel.objects.filter(user=request.user).select_related('product')
        return render(request, 'wishlist.html', {
            'wishlist_items': wishlist_items
        })


# ============================================= #
#             Add to Wishlist Views             #
# ============================================= #
class AddToWishlistView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request, product_id):
        product = get_object_or_404(ProductModel, id=product_id)

        wishlist_item, created = WishlistModel.objects.get_or_create(
            user=request.user,
            product=product
        )

        wishlist_count = WishlistModel.objects.filter(user=request.user).count()
        cart_count = CartItem.objects.filter(user=request.user).count()

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if created:
                return JsonResponse({
                    'success': True,
                    'message': f"“{product.title}” wishlist-ə əlavə edildi ❤️",
                    'wishlist_count': wishlist_count,
                    'cart_count': cart_count,
                    'action': 'added'
                })
            else:
                return JsonResponse({
                    'success': True,
                    'message': f"“{product.title}” artıq wishlist-dədir",
                    'wishlist_count': wishlist_count,
                    'cart_count': cart_count,
                    'action': 'exists'
                })

        if created:
            messages.success(request, f"“{product.title}” wishlist-ə əlavə edildi ❤️")
        else:
            messages.info(request, f"“{product.title}” artıq wishlist-dədir")

        return redirect('all_list')


# ============================================= #
#            Remove Wishlist Views              #
# ============================================= #
class RemoveFromWishlistView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request, item_id):
        wishlist_item = get_object_or_404(
            WishlistModel.objects.select_related('product'),
            id=item_id,
            user=request.user
        )

        product_name = wishlist_item.product.title
        product_id = wishlist_item.product.id
        wishlist_item.delete()
        
        wishlist_count = WishlistModel.objects.filter(user=request.user).count()
        cart_count = CartItem.objects.filter(user=request.user).count()

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': f"“{product_name}” wishlist-dən silindi 🗑️",
                'wishlist_count': wishlist_count,
                'cart_count': cart_count,
                'action': 'removed',
                'product_id': product_id
            })

        messages.success(request, f"“{product_name}” wishlist-dən silindi 🗑️")
        return redirect('all_list')


# ============================================= #
#     Move to Wishlist to Cart View             #
# ============================================= #
class MoveToCartView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request, product_id):
        product = get_object_or_404(ProductModel, id=product_id)
        
        WishlistModel.objects.filter(
            user=request.user, 
            product=product
        ).delete()
        
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': 1}
        )
        
        if not created:
            cart_item.quantity = F('quantity') + 1
            cart_item.save(update_fields=['quantity'])
        
        cart_count = CartItem.objects.filter(user=request.user).count()
        wishlist_count = WishlistModel.objects.filter(user=request.user).count()

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': f"“{product.title}” səbətə əlavə edildi və wishlist-dən silindi 🛒",
                'cart_count': cart_count,
                'wishlist_count': wishlist_count,
                'product_id': product_id
            })

        messages.success(request, f"“{product.title}” səbətə əlavə edildi və wishlist-dən silindi 🛒")
        return redirect('all_list')


# ============================================= #
#          AJAX ADD TO CART VIEW                #
# ============================================= #

@method_decorator(csrf_exempt, name='dispatch')
class AjaxAddToCartView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request):
        product_id = request.POST.get('product_id')
        quantity = request.POST.get('quantity', 1)

        print(f"🛒 AJAX Add to Cart - Product ID: {product_id}, Quantity: {quantity}")

        if not product_id:
            return JsonResponse({
                'success': False,
                'message': 'Product ID tapılmadı!'
            }, status=400)

        try:
            quantity = int(quantity)
            if quantity < 1:
                quantity = 1
        except ValueError:
            quantity = 1

        try:
            product = get_object_or_404(ProductModel, id=product_id)

            cart_item, created = CartItem.objects.get_or_create(
                user=request.user,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                CartItem.objects.filter(id=cart_item.id).update(
                    quantity=F('quantity') + quantity
                )
                cart_item.refresh_from_db()
                message = 'Məhsulun sayı artırıldı!'
            else:
                message = 'Məhsul səbətə əlavə edildi!'

            WishlistModel.objects.filter(
                user=request.user, 
                product=product
            ).delete()

            cart_count = CartItem.objects.filter(user=request.user).count()
            wishlist_count = WishlistModel.objects.filter(user=request.user).count()

            return JsonResponse({
                'success': True,
                'message': message,
                'cart_count': cart_count,
                'wishlist_count': wishlist_count,
                'product_id': product_id
            })

        except Exception as e:
            print(f"❌ AjaxAddToCart Error: {e}")
            return JsonResponse({
                'success': False,
                'message': 'Xəta baş verdi!'
            }, status=500)


# ============================================= #
#         AJAX ADD TO WISHLIST VIEW             #
# ============================================= #

@method_decorator(csrf_exempt, name='dispatch')
class AjaxAddToWishlistView(LoginRequiredMixin, View):
    login_url = 'login'

    def post(self, request):
        product_id = request.POST.get('product_id')

        print(f"❤️ AJAX Add to Wishlist - Product ID: {product_id}")

        if not product_id:
            return JsonResponse({
                'success': False,
                'message': 'Product ID tapılmadı!'
            }, status=400)

        try:
            product = get_object_or_404(ProductModel, id=product_id)

            wishlist_item, created = WishlistModel.objects.get_or_create(
                user=request.user,
                product=product
            )

            if created:
                message = 'Məhsul wishlist-ə əlavə edildi!'
                action = 'added'
            else:
                wishlist_item.delete()
                message = 'Məhsul wishlist-dən silindi!'
                action = 'removed'

            wishlist_count = WishlistModel.objects.filter(user=request.user).count()
            cart_count = CartItem.objects.filter(user=request.user).count()

            return JsonResponse({
                'success': True,
                'message': message,
                'wishlist_count': wishlist_count,
                'cart_count': cart_count,
                'action': action,
                'product_id': product_id
            })

        except Exception as e:
            print(f"❌ AjaxAddToWishlist Error: {e}")
            return JsonResponse({
                'success': False,
                'message': 'Xəta baş verdi!'
            }, status=500)


# ============================================= #
#        AJAX Get Cart Data View                #
# ============================================= #

class AjaxGetCartDataView(LoginRequiredMixin, View):
    def get(self, request):
        cart_items = CartItem.objects.filter(
            user=request.user,
            product__isnull=False
        ).select_related('product')
        
        items = []
        cart_total = 0
        
        for item in cart_items:
            price = item.product.special_price or item.product.old_price
            item_total = price * item.quantity
            cart_total += item_total
            
            image_url = None
            if item.product.product_image:
                image_url = item.product.product_image.url
            elif item.product.cov_img:
                image_url = item.product.cov_img.url
            
            items.append({
                'id': item.id,
                'product_id': item.product.id,
                'title': item.product.title,
                'price': float(price),
                'quantity': item.quantity,
                'image': image_url
            })
        
        print(f"📦 AJAX Cart data: {len(items)} items, Total: ${cart_total}")
        
        return JsonResponse({
            'success': True,
            'items': items,
            'cart_count': len(items),
            'cart_total': float(cart_total)
        })


# ============================================= #
#       AJAX Get Wishlist Data View             #
# ============================================= #

class AjaxGetWishlistDataView(LoginRequiredMixin, View):
    def get(self, request):
        wishlist_items = WishlistModel.objects.filter(
            user=request.user,
            product__isnull=False
        ).select_related('product')
        
        items = []
        for item in wishlist_items:
            image_url = None
            if item.product.product_image:
                image_url = item.product.product_image.url
            elif item.product.cov_img:
                image_url = item.product.cov_img.url
            
            price = item.product.special_price or item.product.old_price
            
            items.append({
                'id': item.id,
                'product_id': item.product.id,
                'title': item.product.title,
                'price': float(price),
                'image': image_url
            })
        
        print(f"❤️ Wishlist data for {request.user.username}: {len(items)} items")
        
        return JsonResponse({
            'success': True,
            'items': items,
            'wishlist_count': len(items)
        })








# ============================================= #
#             Checkout Wiew Start               #
# ============================================= #
class CheckoutView(LoginRequiredMixin, FormView):
    template_name = 'checkout.html'
    form_class = CheckoutForm
    success_url = reverse_lazy('order_success')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # İstifadəçinin səbətindəki məhsulları əldə et
        # MODELİNİZƏ UYĞUN OLARAQ DƏYİŞDİRİN!
        
        # Əgər CartItem modeliniz birbaşa user ilə əlaqəlidirsə:
        cart_items = CartItem.objects.filter(user=self.request.user)
        
        # Əgər Cart modeliniz varsa və CartItem cart-a bağlıdırsa:
        # cart = Cart.objects.filter(user=self.request.user).first()
        # cart_items = cart.items.all() if cart else []
        
        context['cart_items'] = cart_items
        # Ümumi qiyməti hesabla
        total_price = sum(item.product.special_price * item.quantity for item in cart_items)
        context['total_price'] = total_price
        
        # Çatdırılma pulsuzdur (və ya öz qaydanız)
        context['shipping'] = 0
        
        return context

    def form_valid(self, form):
        # Form məlumatlarını yadda saxla
        checkout = form.save(commit=False)
        checkout.user = self.request.user
        checkout.save()
        
        # Sifariş verildikdən sonra səbəti təmizlə (istəyə bağlı)
        CartItem.objects.filter(user=self.request.user).delete()
        
        messages.success(self.request, 'Sifarişiniz uğurla qeydə alındı!')
        return super().form_valid(form)
    
    def form_invalid(self, form):
        messages.error(self.request, 'Form doldurularkən xəta baş verdi')
        return super().form_invalid(form)





# ============================================= #
#           OrderSuccessView Wiew Start         #
# ============================================= #
class OrderSuccessView(LoginRequiredMixin, TemplateView):
    template_name = 'order_success.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # İstifadəçinin son sifarişini tap
        try:
            last_order = CheckoutModel.objects.filter(
                user=self.request.user
            ).latest('id')
            context['order'] = last_order
        except CheckoutModel.DoesNotExist:
            pass
        
        return context
