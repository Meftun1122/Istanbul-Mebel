from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.utils.timesince import timesince
from .models import ProductModel, ReviewModel, ManufacturerModel, CategoryModel, ColorModel
from .forms import ReviewForm, ReplyForm, ReviewFilterForm, QuickReviewForm
from django.contrib.auth.decorators import login_required
# Create your views here.


class ProductsView(ListView):
    model = ProductModel
    template_name = 'products.html'
    context_object_name = 'products'
    paginate_by = 12

    def get_queryset(self):
        queryset = super().get_queryset()

        # Manufacturer Filters
        manufacturer_id = self.request.GET.get('manufacturer')
        if manufacturer_id:
            queryset = queryset.filter(manufacturer_id=manufacturer_id)

        # Category Filters
        category_id = self.request.GET.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Color Filters
        color_id = self.request.GET.get('color')
        if color_id:
            queryset = queryset.filter(color_id=color_id)

        # Qiymet Filters
        min_price = self.request.GET.get('min_price')
        max_price = self.request.GET.get('max_price')

        if min_price:
            min_price = min_price.replace('$', '').strip()
        if max_price:
            max_price = max_price.replace('$', '').strip()

        if min_price and max_price:
            queryset = queryset.filter(special_price__gte=float(min_price), special_price__lte=float(max_price))
        elif min_price:
            queryset = queryset.filter(special_price__gte=float(min_price))
        elif max_price:
            queryset = queryset.filter(special_price__lte=float(max_price))
            
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['manufacturers'] = ManufacturerModel.objects.all()
        context['colors'] = ColorModel.objects.all()
        context['categories'] = CategoryModel.objects.all()
        context['request'] = self.request
        return context








class ProductDetailsView(DetailView):
    model = ProductModel
    template_name = 'portfolio-details.html'
    context_object_name = 'product_details'
    pk_url_kwarg = 'pk'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product = self.object
        
        # Stock dəyərini integer-a çevir
        try:
            context['stock_int'] = int(product.stock) if product.stock else 0
        except (ValueError, TypeError):
            context['stock_int'] = 0
        
        # Filter form
        filter_form = ReviewFilterForm(self.request.GET or None)
        context['filter_form'] = filter_form
        
        # Yalnız aktiv və əsas (parent=None) review-ları gətir
        reviews = ReviewModel.objects.filter(
            product=product,
            parent__isnull=True,
            is_active=True
        ).prefetch_related('replies')
        
        # Filtrləmə tətbiq et
        if filter_form.is_valid():
            sort = filter_form.cleaned_data.get('sort')
            rating = filter_form.cleaned_data.get('rating')
            search = filter_form.cleaned_data.get('search')
            
            if rating:
                reviews = reviews.filter(rating=rating)
            
            if search:
                reviews = reviews.filter(
                    Q(name__icontains=search) |
                    Q(surname__icontains=search) |
                    Q(text__icontains=search)
                )
            
            # Sıralama
            if sort == 'newest':
                reviews = reviews.order_by('-created')
            elif sort == 'oldest':
                reviews = reviews.order_by('created')
            elif sort == 'highest':
                reviews = reviews.order_by('-rating', '-created')
            elif sort == 'lowest':
                reviews = reviews.order_by('rating', '-created')
        else:
            reviews = reviews.order_by('-created')
        
        context['reviews'] = reviews
        context['reviews_count'] = reviews.count()
        
        # Bütün review-lar (reply-lər daxil) üçün statistika
        all_reviews = ReviewModel.objects.filter(
            product=product, 
            is_active=True
        ).exclude(rating__isnull=True)
        
        if all_reviews.exists():
            # Ortalama rating
            avg_rating = all_reviews.aggregate(Avg('rating'))['rating__avg']
            context['avg_rating'] = round(avg_rating, 1)
            
            # Hər rating üçün say
            rating_counts = {}
            for i in range(1, 6):
                rating_counts[i] = all_reviews.filter(rating=i).count()
            context['rating_counts'] = rating_counts
            
            # Ümumi review sayı
            context['total_reviews'] = all_reviews.count()
        else:
            context['avg_rating'] = 0
            context['rating_counts'] = {1:0, 2:0, 3:0, 4:0, 5:0}
            context['total_reviews'] = 0
        
        # Formları context-ə əlavə et
        context['review_form'] = ReviewForm()
        context['reply_form'] = ReplyForm()
        context['quick_review_form'] = QuickReviewForm()
        
        return context
    
    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        
        action = request.POST.get('action')
        
        if action == 'add_review':
            return self.add_review(request)
        elif action == 'add_reply':
            return self.add_reply(request)
        elif action == 'quick_review':
            return self.quick_review(request)
        elif action == 'like_review':
            return self.like_review(request)
        elif action == 'dislike_review':
            return self.dislike_review(request)
        # YENİ: reply like/dislike action-ları
        elif action == 'like_reply':
            return self.like_reply(request)
        elif action == 'dislike_reply':
            return self.dislike_reply(request)
        
        return redirect('product_details', pk=self.object.pk)
    
    def add_review(self, request):
        """Yeni rəy əlavə et"""
        form = ReviewForm(request.POST)
        
        if form.is_valid():
            review = form.save(commit=False)
            review.product = self.object
            review.is_active = True
            review.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Rəyiniz uğurla əlavə edildi!',
                    'review': {
                        'id': review.id,
                        'name': review.full_name,
                        'text': review.text,
                        'rating': review.rating,
                        'rating_stars': review.get_rating_display_stars(),
                        'created': review.created.strftime('%d.%m.%Y %H:%M'),
                        'created_ago': self.timesince(review.created),
                        'likes': review.likes,
                        'dislikes': review.dislikes,
                        'is_reply': False,
                        'replies': []
                    }
                })
            
            messages.success(request, 'Rəyiniz uğurla əlavə edildi!')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error',
                    'message': 'Form məlumatları düzgün deyil!',
                    'errors': form.errors.get_json_data()
                }, status=400)
            
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
        
        return redirect('product_details', pk=self.object.pk)
    
    def add_reply(self, request):
        """Reply əlavə et"""
        form = ReplyForm(request.POST)
        
        if form.is_valid():
            name = form.cleaned_data.get('name') or 'İstifadəçi'
            surname = form.cleaned_data.get('surname') or ''
            text = form.cleaned_data.get('text')
            parent_id = form.cleaned_data.get('parent_id')
            reply_to_name = form.cleaned_data.get('reply_to_name', '')
            
            try:
                parent_review = ReviewModel.objects.get(
                    id=parent_id, 
                    product=self.object,
                    is_active=True
                )
            except ReviewModel.DoesNotExist:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Rəy tapılmadı!'
                    }, status=404)
                messages.error(request, 'Rəy tapılmadı!')
                return redirect('product_details', pk=self.object.pk)
            
            # Reply-i yarat
            reply = ReviewModel.objects.create(
                product=self.object,
                parent=parent_review,
                name=name,
                surname=surname,
                text=text,
                rating=None,
                reply_to_name=reply_to_name,
                is_active=True
            )
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Cavabınız əlavə edildi!',
                    'reply': {
                        'id': reply.id,
                        'name': reply.full_name,
                        'text': reply.text,
                        'reply_to_name': reply.reply_to_name,
                        'created': reply.created.strftime('%d.%m.%Y %H:%M'),
                        'created_ago': self.timesince(reply.created),
                        'likes': reply.likes,
                        'dislikes': reply.dislikes,
                        'parent_id': parent_review.id
                    }
                })
            
            messages.success(request, 'Cavabınız əlavə edildi!')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error',
                    'message': 'Form məlumatları düzgün deyil!',
                    'errors': form.errors.get_json_data()
                }, status=400)
            
            messages.error(request, 'Xəta baş verdi!')
        
        return redirect('product_details', pk=self.object.pk)
    
    def quick_review(self, request):
        """AJAX üçün sadə rəy formu"""
        form = QuickReviewForm(request.POST)
        
        if form.is_valid():
            review = form.save(commit=False)
            review.product = self.object
            review.is_active = True
            review.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Rəyiniz əlavə edildi!',
                'review': {
                    'id': review.id,
                    'name': review.full_name,
                    'text': review.text,
                    'rating': review.rating,
                    'created_ago': self.timesince(review.created),
                    'likes': 0,
                    'dislikes': 0
                }
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Validasiya xətası',
                'errors': form.errors.get_json_data()
            }, status=400)
    
    @method_decorator(login_required)
    def like_review(self, request):
        """Rəyi bəyən"""
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'error', 'message': 'Yalnız AJAX sorğuları qəbul edilir'}, status=400)
        
        review_id = request.POST.get('review_id')
        
        try:
            review = ReviewModel.objects.get(
                id=review_id, 
                product=self.object,
                is_active=True
            )
            
            # Session-based like tracking
            session_key = f"liked_review_{review_id}"
            if request.session.get(session_key):
                # Unlike
                review.likes = max(0, review.likes - 1)
                del request.session[session_key]
                liked = False
            else:
                # Like
                review.likes += 1
                request.session[session_key] = True
                liked = True
                
                # Əgər dislike varsa, onu sil
                dislike_key = f"disliked_review_{review_id}"
                if request.session.get(dislike_key):
                    del request.session[dislike_key]
            
            review.save(update_fields=['likes'])
            
            return JsonResponse({
                'status': 'success',
                'likes': review.likes,
                'dislikes': review.dislikes,
                'liked': liked,
                'message': 'Rəy bəyənildi' if liked else 'Rəy bəyənmə geri alındı'
            })
            
        except ReviewModel.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Rəy tapılmadı'
            }, status=404)
    
    @method_decorator(login_required)
    def dislike_review(self, request):
        """Rəyi bəyənmə"""
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'error', 'message': 'Yalnız AJAX sorğuları qəbul edilir'}, status=400)
        
        review_id = request.POST.get('review_id')
        
        try:
            review = ReviewModel.objects.get(
                id=review_id, 
                product=self.object,
                is_active=True
            )
            
            # Session-based dislike tracking
            session_key = f"disliked_review_{review_id}"
            if request.session.get(session_key):
                # Undislike
                review.dislikes = max(0, review.dislikes - 1)
                del request.session[session_key]
                disliked = False
            else:
                # Dislike
                review.dislikes += 1
                request.session[session_key] = True
                disliked = True
                
                # Əgər like varsa, onu sil
                like_key = f"liked_review_{review_id}"
                if request.session.get(like_key):
                    del request.session[like_key]
            
            review.save(update_fields=['dislikes'])
            
            return JsonResponse({
                'status': 'success',
                'likes': review.likes,
                'dislikes': review.dislikes,
                'disliked': disliked,
                'message': 'Rəy bəyənilmədi' if disliked else 'Rəy bəyənilmə geri alındı'
            })
            
        except ReviewModel.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Rəy tapılmadı'
            }, status=404)
    
    # ========== YENİ METODLAR: REPLY LİKE/DİSLİKE ==========
    
    @method_decorator(login_required)
    def like_reply(self, request):
        """Reply-i bəyən"""
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'error', 'message': 'Yalnız AJAX sorğuları qəbul edilir'}, status=400)
        
        reply_id = request.POST.get('review_id')
        
        try:
            reply = ReviewModel.objects.get(
                id=reply_id, 
                product=self.object,
                parent__isnull=False,  # Reply olduğunu yoxla
                is_active=True
            )
            
            # Session-based like tracking
            session_key = f"liked_reply_{reply_id}"
            if request.session.get(session_key):
                # Unlike
                reply.likes = max(0, reply.likes - 1)
                del request.session[session_key]
                liked = False
            else:
                # Like
                reply.likes += 1
                request.session[session_key] = True
                liked = True
                
                # Əgər dislike varsa, onu sil
                dislike_key = f"disliked_reply_{reply_id}"
                if request.session.get(dislike_key):
                    del request.session[dislike_key]
            
            reply.save(update_fields=['likes'])
            
            return JsonResponse({
                'status': 'success',
                'likes': reply.likes,
                'dislikes': reply.dislikes,
                'liked': liked,
                'message': 'Cavab bəyənildi' if liked else 'Cavab bəyənmə geri alındı'
            })
            
        except ReviewModel.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Cavab tapılmadı'
            }, status=404)
    
    @method_decorator(login_required)
    def dislike_reply(self, request):
        """Reply-i bəyənmə"""
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'error', 'message': 'Yalnız AJAX sorğuları qəbul edilir'}, status=400)
        
        reply_id = request.POST.get('review_id')
        
        try:
            reply = ReviewModel.objects.get(
                id=reply_id, 
                product=self.object,
                parent__isnull=False,  # Reply olduğunu yoxla
                is_active=True
            )
            
            # Session-based dislike tracking
            session_key = f"disliked_reply_{reply_id}"
            if request.session.get(session_key):
                # Undislike
                reply.dislikes = max(0, reply.dislikes - 1)
                del request.session[session_key]
                disliked = False
            else:
                # Dislike
                reply.dislikes += 1
                request.session[session_key] = True
                disliked = True
                
                # Əgər like varsa, onu sil
                like_key = f"liked_reply_{reply_id}"
                if request.session.get(like_key):
                    del request.session[like_key]
            
            reply.save(update_fields=['dislikes'])
            
            return JsonResponse({
                'status': 'success',
                'likes': reply.likes,
                'dislikes': reply.dislikes,
                'disliked': disliked,
                'message': 'Cavab bəyənilmədi' if disliked else 'Cavab bəyənilmə geri alındı'
            })
            
        except ReviewModel.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Cavab tapılmadı'
            }, status=404)
    
    def timesince(self, date):
        """Neçə vaxt əvvəl yazıldığını hesabla"""
        if not date:
            return 'İndi'
        return timesince(date, timezone.now())
