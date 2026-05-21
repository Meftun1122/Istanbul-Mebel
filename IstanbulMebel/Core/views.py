from django.shortcuts import render
from .models import *
from Products.models import ProductModel, ReviewModel
from django.views.generic import TemplateView, DetailView, ListView 
from django.db.models import Q, Avg, Count
from django.http import HttpResponseRedirect
# Create your views here.
from django.utils import translation
from django.urls import resolve, reverse, translate_url
from urllib.parse import urlparse
from django.conf import settings




class IndexView(ListView):
    model = ProductModel
    template_name = 'index.html'
    context_object_name = 'core'
    paginate_by = 12

    # Bu view, ana səhifədə məhsulları göstərmək üçün istifadə olunur. 
    # Məhsullar ID-yə görə azalan sırada sıralanır və hər səhifədə 12 məhsul göstərilir. 
    # Həmçinin, kontekstə xidmətlər və rəylər haqqında məlumatlar əlavə edilir, beləliklə ana səhifədə həm məhsullar, 
    # həm də xidmətlər və rəylər dinamik olaraq göstərilə bilər. Məhsullar üçün ortalama reytinq və rəy sayı da hesablanır və 
    # kontekstə əlavə edilir, beləliklə ön tərəfdə bu məlumatları göstərə bilərsiniz.
    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.order_by('-id')
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Services modelindən bütün xidmətləri çəkmək
        context['services'] = ServicesModel.objects.all().order_by('-id')[:6]
        
        # ========== RƏY MƏLUMATLARI ==========
        context['all_reviews'] = ReviewModel.objects.filter(
            parent__isnull=True,  # Yalnız əsas rəylər (reply deyil)
            is_active=True        # Yalnız aktiv rəylər
        ).select_related('product').order_by('-created')[:10]
        
        # 2. Hər bir məhsul üçün rəy statistikası
        products = context['core']
        
        for product in products:
            # Bu məhsula aid bütün aktiv review-lar
            reviews = ReviewModel.objects.filter(
                product=product,
                parent__isnull=True,
                is_active=True
            )
            
            # Orta rating hesabla
            avg_rating = reviews.filter(rating__isnull=False).aggregate(
                Avg('rating')
            )['rating__avg']
            
            # Review sayı
            reviews_count = reviews.count()
            
            # Son 3 review
            recent_reviews = reviews.order_by('-created')[:3]
            
            # Product obyektinə dinamik atributlar əlavə et
            product.avg_rating = round(avg_rating, 1) if avg_rating else 0
            product.reviews_count = reviews_count
            product.recent_reviews = recent_reviews
        return context



class ServiceDetailsView(DetailView):
    model = ServicesModel
    template_name = 'service-details.html'
    context_object_name = 'service'
    pk_url_kwarg = 'pk'




def change_language(request):
    lang = request.GET.get('lang')
    next_url = request.META.get('HTTP_REFERER', '/')
    parsed_url = urlparse(next_url)
    path = parsed_url.path
    
    if lang in ['az', 'en', 'ru']:
        # 1. URL-i mövcud prefikslərdən tam təmizləyirik
        clean_path = path
        for supported_lang in ['en', 'ru']:
            if path.startswith(f'/{supported_lang}/'):
                clean_path = path.replace(f'/{supported_lang}/', '/', 1)
                break

        try:
            # 2. Təmiz path ilə səhifəni tapırıq
            view = resolve(clean_path)
            translation.activate(lang)
            target_url = reverse(view.view_name, args=view.args, kwargs=view.kwargs)
            
            if parsed_url.query:
                target_url = f"{target_url}?{parsed_url.query}"
        except:
            # 3. Əgər resolve alınmasa, manual olaraq yeni dili yapışdırırıq
            if lang == 'az':
                target_url = clean_path
            else:
                # clean_path-in başında / olmasını təmin edirik
                if not clean_path.startswith('/'):
                    clean_path = f'/{clean_path}'
                target_url = f"/{lang}{clean_path}"

        response = HttpResponseRedirect(target_url)
        
        # 4. Dil seçimini yadda saxlayırıq
        # LANGUAGE_SESSION_KEY yerinə birbaşa '_language' stringindən istifadə edirik
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang)
        if hasattr(request, 'session'):
            request.session['_language'] = lang # Django bu açarı istifadə edir
            
        return response

    return HttpResponseRedirect('/')