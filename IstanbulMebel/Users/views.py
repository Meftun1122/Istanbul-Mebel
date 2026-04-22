from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView
# Create your views here.
# Create your views here.
from django.urls import reverse_lazy
from django.utils.encoding import force_str, force_bytes
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.contrib import messages
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_decode
from django.core.mail import send_mail
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordResetConfirmView
from django.views.generic import TemplateView, FormView, View
from django.conf import settings
from django.db import transaction
from datetime import datetime
import os
# APP related things
from .models import *
from .tokens import account_activation_token
from .forms import *
from Order.models import CheckoutModel, CartItem, WishlistModel
from Products.models import ProductModel
from IstanbulMebel.settings import EMAIL_HOST_USER
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse



# =============================================== #
#               Register view start               #
# =============================================== #
class RegisterView(FormView):
    template_name = 'register.html'
    form_class = UserRegisterForm
    success_url = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('index')
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        print("="*50)
        print("POST request received in RegisterView")
        print(f"POST data: {request.POST}")
        print("="*50)
        return super().post(request, *args, **kwargs)

    @transaction.atomic
    def form_valid(self, form):
        # Form məlumatlarını debug üçün çap et
        print("Form is valid! Cleaning data...")
        
        email = form.cleaned_data['email'].lower().strip()
        first_name = form.cleaned_data['first_name'].strip()
        last_name = form.cleaned_data['last_name'].strip()
        gender = form.cleaned_data['gender']
        birthdate = form.cleaned_data.get('birthdate')
        phone = form.cleaned_data.get('phone')
        
        # Checkbox dəyərlərini təhlükəsiz şəkildə al
        receive_offers = form.cleaned_data.get('receive_offers', False)
        subscribe_newsletter = form.cleaned_data.get('subscribe_newsletter', False)

        print(f"Creating user with email: {email}")

        # ✅ USER YARAT - username üçün unikal dəyər yarat
        import uuid
        username = f"user_{uuid.uuid4().hex[:8]}"  # Unikal username yarat
        
        user = User.objects.create(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            is_active=False,  # email təsdiqi gələnə qədər deaktiv
        )
        user.set_password(form.cleaned_data['current_password'])
        user.save()
        
        print(f"User created with ID: {user.id}")

        # ✅ PROFILE YARAT
        UserProfile.objects.create(
            user=user,
            gender=gender,
            birthdate=birthdate,
            phone=phone,
            receive_offers=receive_offers,
            subscribe_newsletter=subscribe_newsletter,
        )
        
        print("UserProfile created")

        # ✅ EMAIL TƏSDİQ GÖNDƏR - EMAIL_HOST_USER ilə əlaqələndirildi
        email_sent = False
        try:
            current_site = get_current_site(self.request)
            subject = 'Qeydiyyatınızı təsdiqləyin'

            # HTML email template-i hazırla
            html_message = render_to_string('email/confirmation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': account_activation_token.make_token(user),
            })

            # Plain text versiya (HTML dəstəklənməyən email client-lər üçün)
            plain_message = f"""
            Salam {first_name} {last_name},
            
            Qeydiyyatınızı tamamlamaq üçün aşağıdaki linkə klik edin:
            http://{current_site.domain}/users/activate/{urlsafe_base64_encode(force_bytes(user.pk))}/{account_activation_token.make_token(user)}/
            
            Link işləmirsə, brauzerinizə kopyalayın.
            
            Təşəkkürlər,
            {settings.EMAIL_HOST_USER}
            """

            # Email göndər
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,  # EMAIL_HOST_USER istifadə olunur
                recipient_list=[email],
                html_message=html_message,  # HTML versiya
                fail_silently=False,
            )
            
            print(f"✓ Confirmation email sent to {email} from {settings.EMAIL_HOST_USER}")
            email_sent = True
            
            # ✅ UĞURLU MESAJ
            messages.success(
                self.request, 
                'Qeydiyyatınız uğurla tamamlandı! Email ünvanınızı təsdiqləyin.'
            )
            
        except Exception as e:
            print(f"✗ Email sending failed: {e}")
            print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
            print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if hasattr(settings, 'EMAIL_HOST_PASSWORD') else 'Not set'}")
            
            # Email göndərilməsə belə, qeydiyyat uğurlu sayılır
            if settings.DEBUG:
                # Development mühitində email göndərilməsə belə, aktivasiya linkini göstər
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = account_activation_token.make_token(user)
                activation_link = f"http://{current_site.domain}/users/activate/{uid}/{token}/"
                
                messages.warning(
                    self.request, 
                    f'Qeydiyyatınız uğurla tamamlandı! Email göndərilmədi. Aktivasiya linki: {activation_link}'
                )
                print(f"Activation link (development): {activation_link}")
            else:
                messages.success(
                    self.request, 
                    'Qeydiyyatınız uğurla tamamlandı! Email ünvanınızı təsdiqləyin. (Email göndərilməsində problem var)'
                )

        # Login səhifəsinə yönləndir
        return super().form_valid(form)

    def form_invalid(self, form):
        print("="*50)
        print("Form is invalid!")
        print(f"Form errors: {form.errors}")
        print("="*50)
        
        # Hər bir xətanı mesaj kimi göstər
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(self.request, f"{error}")
        
        # Xəta ilə birlikdə form-u qaytar
        return self.render_to_response(self.get_context_data(form=form))


# =============================================== #
#              Account Activation                 #
# =============================================== #
def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.filter(pk=uid, is_active=False).first()
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, 'Hesabınız uğurla aktivləşdirildi! İndi daxil ola bilərsiniz.')
        return redirect('login')
    else:
        messages.error(request, 'Aktivləşdirmə linki etibarsızdır və ya vaxtı keçib!')
        return redirect('index')


# =============================================== #
#                Login view start                 #
# =============================================== #
class CustomLoginView(LoginView):
    form_class = LoginForm
    template_name = 'login.html'
    authentication_form = LoginForm
    redirect_authenticated_user = True

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('index')  # 'index' əvəzinə 'home'
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        # User-i əldə et
        user = form.get_user()
        print(f"User logged in: {user.email}")
        
        messages.success(self.request, f"Xoş gəldiniz, {user.first_name}! Uğurla daxil oldunuz.")
        
        # Remember me funksionallığı
        if not self.request.POST.get('remember_me'):
            self.request.session.set_expiry(0)  # Brauzer bağlananda session silinsin
        else:
            self.request.session.set_expiry(1209600)  # 2 həftə (default)
        
        return super().form_valid(form)

    def form_invalid(self, form):
        """Form uğursuz olarsa"""
        print("="*50)
        print("FORM INVALID")
        print(f"Form errors: {form.errors}")
        print("="*50)
        
        # Birinci xətanı göstər
        if form.non_field_errors():
            messages.error(self.request, form.non_field_errors()[0])
        elif form.errors.get('username'):
            messages.error(self.request, form.errors['username'][0])
        elif form.errors.get('password'):
            messages.error(self.request, form.errors['password'][0])
        else:
            messages.error(self.request, "Email və ya şifrə yanlışdır!")
        
        return super().form_invalid(form)

    def get_success_url(self):
        return self.get_redirect_url() or reverse_lazy('index')


# =============================================== #
#           Password Reset Views                  #
# =============================================== #
class CustomPasswordResetView(PasswordResetView):
    email_template_name = 'email/password_message.html'
    form_class = CustomPasswordResetForm
    template_name = 'password/password_reset.html'
    success_url = reverse_lazy('login')

    def form_valid(self, form):
        messages.success(
            self.request, 
            'Şifrə dəyişdirmə sorğunuz qeydə alındı. Email ünvanınızı yoxlayın.'
        )
        return super().form_valid(form)

    def form_invalid(self, form):
        if form.errors.get('email'):
            messages.error(self.request, form.errors['email'][0])
        else:
            messages.error(self.request, "Email ünvanı yanlışdır!")
        return super().form_invalid(form)


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'password/password_reset_confirm.html'
    form_class = CustomSetPasswordForm
    success_url = reverse_lazy('login')

    def form_valid(self, form):
        messages.success(
            self.request, 
            'Şifrəniz uğurla dəyişdirildi! İndi yeni şifrənizlə daxil ola bilərsiniz.'
        )
        return super().form_valid(form)

    def form_invalid(self, form):
        if form.errors.get('new_password2'):
            messages.error(self.request, form.errors['new_password2'][0])
        elif form.errors.get('new_password1'):
            messages.error(self.request, form.errors['new_password1'][0])
        else:
            messages.error(self.request, "Şifrə dəyişdirilərkən xəta baş verdi!")
        return super().form_invalid(form)






class ContactUsView(FormView):
    """
    Contact Us view - istifadəçilərin mesaj göndərməsi üçün
    """
    template_name = 'contact-us.html'
    form_class = ContactUsForm
    success_url = reverse_lazy('contact_success') 

    def get_context_data(self, **kwargs):
        """Konteks məlumatlarını əlavə et"""
        context = super().get_context_data(**kwargs)
        # Aktiv əlaqə məlumatlarını çək
        try:
            active_location = ContactLocationsModel.objects.filter(is_active=True).first()
            if not active_location:
                active_location = ContactLocationsModel.objects.first()
            context['contact_info'] = active_location
        except Exception as e:
            print(f"Xəta: {e}")
            context['contact_info'] = None
        
        return context

    def form_valid(self, form):
        """Form uğurlu olarsa"""
        try:
            # İstifadəçini əlavə et
            if self.request.user.is_authenticated:
                form.instance.user = self.request.user
            form.save()
            # Uğur mesajı
            messages.success(self.request, 'Mesajınız uğurla göndərildi!')
            # Debug üçün
            print(f"Mesaj göndərildi: {form.cleaned_data['first_name']}")
        except Exception as e:
            messages.error(self.request, f'Xəta baş verdi: {str(e)}')
            return self.form_invalid(form)
        return super().form_valid(form)

    def form_invalid(self, form):
        """Form uğursuz olarsa"""
        error_messages = []
        for field, errors in form.errors.items():
            for error in errors:
                error_messages.append(f"{error}")
        if error_messages:
            messages.error(self.request, error_messages[0])
        else:
            messages.error(self.request, 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.')
        return super().form_invalid(form)





# Uğurlu mesaj səhifəsi üçün view
class ContactSuccessView(TemplateView):
    template_name = 'contact_success.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Ən son mesajı əldə et (ID ən böyük olan)
        last_message = ContactUsModel.objects.order_by('-id').first()
        
        if last_message:
            context['last_message'] = last_message
            # Modelinizdəki field adlarına uyğun
            context['first_name'] = last_message.first_name if hasattr(last_message, 'first_name') else ''
            context['last_name'] = last_message.last_name if hasattr(last_message, 'last_name') else ''
            context['email'] = last_message.email_address if hasattr(last_message, 'email_address') else ''
            context['subject'] = last_message.subject if hasattr(last_message, 'subject') else ''
        
        return context









class AccountView(LoginRequiredMixin, TemplateView):
    template_name = 'my-account.html'
    login_url = reverse_lazy('login')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        # Profil yarat və ya get
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Wishlist və Cart məlumatları
        wishlist_items = WishlistModel.objects.filter(user=user).select_related('product')
        cart_items = CartItem.objects.filter(user=user).select_related('product')
        
        # Ümumi məbləğ
        cart_total = sum(item.total_price for item in cart_items)
        
        # Aktiv tab (URL parametrindən)
        active_tab = self.request.GET.get('tab', 'wishlist')

        context.update({
            'user': user,
            'profile': profile,
            'wishlist_items': wishlist_items,
            'cart_items': cart_items,
            'cart_total': cart_total,
            'wishlist_count': wishlist_items.count(),
            'cart_count': cart_items.count(),
            'active_tab': active_tab,
        })
        return context

    def post(self, request, *args, **kwargs):
        """Bütün POST sorğularını idarə edir"""
        
        # AJAX sorğusu
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return self.handle_ajax(request)
        
        # Normal POST (form submission) - fallback
        return self.handle_normal_post(request)

    def handle_normal_post(self, request):
        """Normal (non-AJAX) form submission - səhifə yeniləyir"""
        
        # Profil yeniləmə
        if 'update_profile' in request.POST:
            self._update_profile(request.user, request.POST)
            return redirect('account')
        
        # Səbətə əlavə
        if 'add_to_cart' in request.POST:
            product_id = request.POST.get('product_id')
            if product_id:
                self._add_to_cart(request.user, product_id)
            return redirect('account')
        
        # Səbətdən sil
        if 'remove_from_cart' in request.POST:
            product_id = request.POST.get('product_id')
            if product_id:
                self._remove_from_cart(request.user, product_id)
            return redirect('account')
        
        # Wishlist-dən sil
        if 'remove_from_wishlist' in request.POST:
            product_id = request.POST.get('product_id')
            if product_id:
                self._remove_from_wishlist(request.user, product_id)
            return redirect('account')
        
        return redirect('account')

    def handle_ajax(self, request):
        """AJAX sorğularını idarə edir - səhifə yenilənmir"""
        
        print("🔍 AJAX request received. POST keys:", list(request.POST.keys()))
        
        # ========== PROFİL ŞƏKLİ YÜKLƏ ==========
        if request.FILES.get('profile_image') or 'update_profile_image' in request.POST:
            return self.ajax_update_profile_image(request)
        
        # ========== PROFİL ŞƏKLİ SİL ==========
        if 'delete_profile_image' in request.POST:
            return self.ajax_delete_profile_image(request)
        
        # ========== PROFİL YENİLƏ ==========
        if 'update_profile' in request.POST:
            return self.ajax_update_profile(request)
        
        # ========== SƏBƏTƏ ƏLAVƏ ET ==========
        if 'add_to_cart' in request.POST:
            return self.ajax_add_to_cart(request)
        
        # ========== SƏBƏTDƏN SİL ==========
        if 'remove_from_cart' in request.POST:
            return self.ajax_remove_from_cart(request)
        
        # ========== SƏBƏTDƏ MİQDAR YENİLƏ ==========
        if 'update_cart_quantity' in request.POST:
            return self.ajax_update_cart_quantity(request)
        
        # ========== WISHLIST-DƏN SİL ==========
        if 'remove_from_wishlist' in request.POST:
            return self.ajax_remove_from_wishlist(request)
        
        # ========== BİLİNMƏYƏN ACTION ==========
        return JsonResponse({
            'status': 'error',
            'message': 'Unknown action',
            'received_keys': list(request.POST.keys())
        })

    # ==================== PROFİL YENİLƏMƏ METODLARI ====================
    
    def _update_profile(self, user, post_data):
        """Profil məlumatlarını yeniləyir (normal POST üçün)"""
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        user.first_name = post_data.get('first_name', '').strip()
        user.last_name = post_data.get('last_name', '').strip()
        user.save()
        
        profile.phone = post_data.get('phone', '').strip()
        
        birthdate = post_data.get('birthdate')
        if birthdate:
            try:
                profile.birthdate = datetime.strptime(birthdate, '%Y-%m-%d').date()
            except:
                pass
        
        profile.gender = post_data.get('gender', '').lower()
        profile.receive_offers = post_data.get('receive_offers') == 'on'
        profile.subscribe_newsletter = post_data.get('subscribe_newsletter') == 'on'
        profile.save()

    def ajax_update_profile(self, request):
        """AJAX ilə profil yeniləmə - JSON cavab qaytarır"""
        
        print("🟢 ajax_update_profile CALLED")
        print("📥 POST data:", request.POST.dict())
        
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        # İstifadəçi məlumatları
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        user.save()
        
        # Profil məlumatları
        phone = request.POST.get('phone', '').strip()
        birthdate_str = request.POST.get('birthdate')
        gender = request.POST.get('gender')
        receive_offers = request.POST.get('receive_offers') == 'on'
        subscribe_newsletter = request.POST.get('subscribe_newsletter') == 'on'
        
        if phone:
            profile.phone = phone
        
        if birthdate_str:
            try:
                profile.birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d').date()
            except Exception as e:
                print(f"Birthdate error: {e}")
        
        if gender:
            profile.gender = gender.lower()
        
        profile.receive_offers = receive_offers
        profile.subscribe_newsletter = subscribe_newsletter
        profile.save()
        
        # Cavab məlumatları
        response_data = {
            'status': 'success',
            'message': '✅ Profil məlumatları yeniləndi!',
            'user': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.get_full_name(),
                'email': user.email,
            },
            'profile': {
                'phone': profile.phone or '',
                'birthdate': str(profile.birthdate) if profile.birthdate else '',
                'gender': profile.gender or '',
                'receive_offers': profile.receive_offers,
                'subscribe_newsletter': profile.subscribe_newsletter,
            }
        }
        
        print("📤 Response:", response_data)
        return JsonResponse(response_data)

    # ==================== PROFİL ŞƏKİL METODLARI ====================
    
    def ajax_update_profile_image(self, request):
        """AJAX ilə profil şəkli yüklə"""
        
        print("🟢 ajax_update_profile_image CALLED")
        
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        # Şəkli tap
        profile_image = request.FILES.get('profile_image')
        
        if not profile_image:
            return JsonResponse({
                'status': 'error',
                'message': '❌ Şəkil tapılmadı!'
            })
        
        # Köhnə şəkli sil
        if profile.profile_image:
            try:
                old_path = profile.profile_image.path
                if os.path.isfile(old_path):
                    os.remove(old_path)
            except Exception as e:
                print(f"Error deleting old image: {e}")
        
        # Yeni şəkli saxla
        profile.profile_image = profile_image
        profile.save()
        
        return JsonResponse({
            'status': 'success',
            'message': '✅ Profil şəkli yeniləndi!',
            'image_url': profile.profile_image.url
        })

    def ajax_delete_profile_image(self, request):
        """AJAX ilə profil şəkli sil"""
        
        print("🟢 ajax_delete_profile_image CALLED")
        
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        if profile.profile_image:
            try:
                old_path = profile.profile_image.path
                if os.path.isfile(old_path):
                    os.remove(old_path)
            except Exception as e:
                print(f"Error deleting image: {e}")
            
            profile.profile_image = None
            profile.save()
            
            return JsonResponse({
                'status': 'success',
                'message': '✅ Profil şəkli silindi!'
            })
        
        return JsonResponse({
            'status': 'error',
            'message': '❌ Silinəcək şəkil yoxdur'
        })

    # ==================== SƏBƏT METODLARI ====================
    
    def _add_to_cart(self, user, product_id):
        """Səbətə məhsul əlavə et (normal POST)"""
        try:
            product = get_object_or_404(ProductModel, id=product_id)
            cart_item, created = CartItem.objects.get_or_create(
                user=user,
                product=product,
                defaults={'quantity': 1}
            )
            if not created:
                cart_item.quantity += 1
                cart_item.save()
        except Exception as e:
            print(f"Add to cart error: {e}")

    def _remove_from_cart(self, user, product_id):
        """Səbətdən məhsul sil (normal POST)"""
        CartItem.objects.filter(user=user, product_id=product_id).delete()

    def ajax_add_to_cart(self, request):
        """AJAX ilə səbətə əlavə et"""
        
        product_id = request.POST.get('product_id')
        if not product_id:
            return JsonResponse({'status': 'error', 'message': 'Product ID required!'})
        
        try:
            product = get_object_or_404(ProductModel, id=product_id)
        except:
            return JsonResponse({'status': 'error', 'message': 'Product not found!'})
        
        # Səbətə əlavə et
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': 1}
        )
        
        if not created:
            cart_item.quantity += 1
            cart_item.save()
        
        # Wishlist-dən sil (əgər varsa)
        WishlistModel.objects.filter(user=request.user, product=product).delete()
        
        # Sayları hesabla
        cart_count = CartItem.objects.filter(user=request.user).count()
        wishlist_count = WishlistModel.objects.filter(user=request.user).count()
        
        return JsonResponse({
            'status': 'success',
            'message': '✅ Məhsul səbətə əlavə edildi!',
            'cart_count': cart_count,
            'wishlist_count': wishlist_count,
        })

    def ajax_remove_from_cart(self, request):
        """AJAX ilə səbətdən sil"""
        
        product_id = request.POST.get('product_id')
        if not product_id:
            return JsonResponse({'status': 'error', 'message': 'Product ID required!'})
        
        CartItem.objects.filter(user=request.user, product_id=product_id).delete()
        
        cart_count = CartItem.objects.filter(user=request.user).count()
        wishlist_count = WishlistModel.objects.filter(user=request.user).count()
        
        return JsonResponse({
            'status': 'success',
            'message': '✅ Məhsul səbətdən silindi!',
            'cart_count': cart_count,
            'wishlist_count': wishlist_count,
        })

    def ajax_update_cart_quantity(self, request):
        """AJAX ilə səbət miqdarını yenilə"""
        
        product_id = request.POST.get('product_id')
        quantity = request.POST.get('quantity', 1)
        
        if not product_id:
            return JsonResponse({'status': 'error', 'message': 'Product ID required!'})
        
        try:
            quantity = int(quantity)
        except:
            quantity = 1
        
        try:
            cart_item = get_object_or_404(CartItem, user=request.user, product_id=product_id)
        except:
            return JsonResponse({'status': 'error', 'message': 'Cart item not found!'})
        
        if quantity > 0:
            cart_item.quantity = quantity
            cart_item.save()
        else:
            cart_item.delete()
        
        cart_count = CartItem.objects.filter(user=request.user).count()
        wishlist_count = WishlistModel.objects.filter(user=request.user).count()
        
        return JsonResponse({
            'status': 'success',
            'message': '✅ Səbət yeniləndi!',
            'cart_count': cart_count,
            'wishlist_count': wishlist_count,
        })

    # ==================== WISHLIST METODLARI ====================
    
    def _remove_from_wishlist(self, user, product_id):
        """Wishlist-dən sil (normal POST)"""
        WishlistModel.objects.filter(user=user, product_id=product_id).delete()

    def ajax_remove_from_wishlist(self, request):
        """AJAX ilə wishlist-dən sil"""
        
        product_id = request.POST.get('product_id')
        if not product_id:
            return JsonResponse({'status': 'error', 'message': 'Product ID required!'})
        
        WishlistModel.objects.filter(user=request.user, product_id=product_id).delete()
        
        wishlist_count = WishlistModel.objects.filter(user=request.user).count()
        cart_count = CartItem.objects.filter(user=request.user).count()
        
        return JsonResponse({
            'status': 'success',
            'message': '✅ Wishlist-dən silindi!',
            'wishlist_count': wishlist_count,
            'cart_count': cart_count,
        })