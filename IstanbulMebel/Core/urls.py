from django.urls import path
from . import views

urlpatterns = [
    path('index/', views.IndexView.as_view(), name='index'),
    path('services-details/<int:pk>', views.ServiceDetailsView.as_view(), name='service_details'),
]
