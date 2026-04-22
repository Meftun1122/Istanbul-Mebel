from django.shortcuts import render
from .models import *
from Products.models import ProductModel, ReviewModel
from django.views.generic import TemplateView, DetailView, ListView 
from django.db.models import Q, Avg, Count
# Create your views here.




class IndexView(ListView):
    model = ProductModel
    template_name = 'index.html'
    context_object_name = 'core'
    paginate_by = 12

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


