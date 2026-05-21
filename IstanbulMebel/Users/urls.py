from django.contrib.auth.views import LogoutView
from django.urls import path
from . import views

urlpatterns = [
   # Authentication URLs
   path('login/', views.CustomLoginView.as_view(), name='login'),                          # Login səhifəsi
   path('register/', views.RegisterView.as_view(), name='register'),                       # Qeydiyyat səhifəsi
   path('confirmation/<str:uidb64>/<str:token>/', views.activate, name='confirmation'),    # Email təsdiqləmə
   path("logout/", LogoutView.as_view(), name="logout"),                                   # Çıxış
    
   # Password Reset URLs
   path('password_reset/', views.CustomPasswordResetView.as_view(), name='password_reset'), # Şifrə sıfırlama sorğusu
   path('password_reset_confirm/<str:uidb64>/<str:token>/',                                 # Şifrə sıfırlama təsdiqi
      views.CustomPasswordResetConfirmView.as_view(), name="password_reset_confirm"),       
    
   # Contact-Us URLs
   path('contact/', views.ContactUsView.as_view(), name='contact'),                         # Əlaqə səhifəsi
   path('contact/success/', views.ContactSuccessView.as_view(), name='contact_success'),    # Əlaqə formu uğurla göndərildikdə göstəriləcək səhifə

   #  MyAccount URLs
   path('account/', views.AccountView.as_view(), name='account'),                           # Hesab məlumatları səhifəsi                   
]
