from django.urls import path
from . import views


urlpatterns = [
    path('product/', views.ProductsView.as_view(), name='all_product'),
    path('product/<int:pk>/', views.ProductDetailsView.as_view(), name='product_details'),
]
