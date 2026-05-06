from django import forms
from .models import CheckoutModel
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model




User = get_user_model()
# ============================================= #
#            Checkout Form Start                #
# ============================================= #
from django import forms
from .models import CheckoutModel

class CheckoutForm(forms.ModelForm):
    """
    Checkout üçün form - ModelForm istifadə edir
    """
    
    # Azərbaycan şəhərləri (əlifba sırası ilə)
    CITY_CHOICES = [
        ('', '---- Şəhər seçin ----'),
        ('Ağcabədi', 'Ağcabədi'),
        ('Ağdam', 'Ağdam'),
        ('Ağdaş', 'Ağdaş'),
        ('Ağstafa', 'Ağstafa'),
        ('Ağsu', 'Ağsu'),
        ('Astara', 'Astara'),
        ('Bakı', 'Bakı'),
        ('Balakən', 'Balakən'),
        ('Bərdə', 'Bərdə'),
        ('Beyləqan', 'Beyləqan'),
        ('Biləsuvar', 'Biləsuvar'),
        ('Cəbrayıl', 'Cəbrayıl'),
        ('Cəlilabad', 'Cəlilabad'),
        ('Daşkəsən', 'Daşkəsən'),
        ('Füzuli', 'Füzuli'),
        ('Gədəbəy', 'Gədəbəy'),
        ('Gəncə', 'Gəncə'),
        ('Goranboy', 'Goranboy'),
        ('Göyçay', 'Göyçay'),
        ('Göygöl', 'Göygöl'),
        ('Hacıqabul', 'Hacıqabul'),
        ('İmişli', 'İmişli'),
        ('İsmayıllı', 'İsmayıllı'),
        ('Kəlbəcər', 'Kəlbəcər'),
        ('Kürdəmir', 'Kürdəmir'),
        ('Laçın', 'Laçın'),
        ('Lənkəran', 'Lənkəran'),
        ('Lerik', 'Lerik'),
        ('Masallı', 'Masallı'),
        ('Mingəçevir', 'Mingəçevir'),
        ('Naftalan', 'Naftalan'),
        ('Neftçala', 'Neftçala'),
        ('Oğuz', 'Oğuz'),
        ('Qax', 'Qax'),
        ('Qazax', 'Qazax'),
        ('Qəbələ', 'Qəbələ'),
        ('Qobustan', 'Qobustan'),
        ('Quba', 'Quba'),
        ('Qubadlı', 'Qubadlı'),
        ('Qusar', 'Qusar'),
        ('Saatlı', 'Saatlı'),
        ('Sabirabad', 'Sabirabad'),
        ('Salyan', 'Salyan'),
        ('Samux', 'Samux'),
        ('Siyəzən', 'Siyəzən'),
        ('Sumqayıt', 'Sumqayıt'),
        ('Şabran', 'Şabran'),
        ('Şamaxı', 'Şamaxı'),
        ('Şəki', 'Şəki'),
        ('Şəmkir', 'Şəmkir'),
        ('Şirvan', 'Şirvan'),
        ('Tərtər', 'Tərtər'),
        ('Tovuz', 'Tovuz'),
        ('Ucar', 'Ucar'),
        ('Xaçmaz', 'Xaçmaz'),
        ('Xızı', 'Xızı'),
        ('Xocalı', 'Xocalı'),
        ('Xocavənd', 'Xocavənd'),
        ('Yardımlı', 'Yardımlı'),
        ('Yevlax', 'Yevlax'),
        ('Zaqatala', 'Zaqatala'),
        ('Zəngilan', 'Zəngilan'),
        ('Zərdab', 'Zərdab'),
    ]

    # Ana ünvan üçün city field
    city = forms.ChoiceField(
        choices=CITY_CHOICES,
        required=True,
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'city_name'
        })
    )
    
    # Fərqli ünvan üçün shipping_city field
    shipping_city = forms.ChoiceField(
        choices=CITY_CHOICES,
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'cit_name'
        })
    )

    # Telefon nömrəsi üçün validasiya
    tel_number = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+994 XX XXX XX XX',
            'id': 'tel_number'
        })
    )

    # 🔴 YENİ: Shipping telefon nömrəsi
    shipping_phone_number = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+994 XX XXX XX XX',
            'id': 'shipping_phone'
        })
    )

    # Fərqli ünvan üçün checkbox (modeldə yoxdur, ancaq formda istifadə olunur)
    different_shipping = forms.BooleanField(
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input',
            'id': 'different_shipping'
        })
    )

    class Meta:
        model = CheckoutModel
        fields = [
            'first_name', 'last_name', 'email_address', 
            'address', 'city', 'tel_number', 'order_note',
            'shipping_first_name', 'shipping_last_name', 'shipping_email',
            'shipping_phone_number', 'shipping_address', 'shipping_city'
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Adınız',
                'id': 'first_name'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Soyadınız',
                'id': 'last_name'
            }),
            'email_address': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email ünvanınız',
                'id': 'email_address'
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Ünvanınız (küçə, ev №, mənzil №)',
                'rows': 3,
                'id': 'p_address'
            }),
            'order_note': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Sifariş haqqında qeyd (istəyə bağlı)',
                'rows': 2,
                'id': 'order_notes'
            }),
            'shipping_first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ad',
                'id': 'f_name'
            }),
            'shipping_last_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Soyad',
                'id': 'l_name'
            }),
            'shipping_email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email',
                'id': 'email_add'
            }),
            'shipping_address': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Ünvan',
                'rows': 2,
                'id': 's_address'
            }),
        }
        labels = {
            'first_name': 'Ad',
            'last_name': 'Soyad',
            'email_address': 'Email',
            'address': 'Ünvan',
            'city': 'Şəhər',
            'tel_number': 'Telefon nömrəsi',
            'order_note': 'Qeyd',
            'shipping_first_name': 'Ad',
            'shipping_last_name': 'Soyad',
            'shipping_email': 'Email',
            'shipping_phone_number': 'Telefon nömrəsi', 
            'shipping_address': 'Ünvan',
            'shipping_city': 'Şəhər',
        }
        help_texts = {
            'first_name': 'Maksimum 100 simvol',
            'last_name': 'Maksimum 100 simvol',
            'address': 'Maksimum 255 simvol',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name not in ['different_shipping']:
                if 'class' not in field.widget.attrs:
                    field.widget.attrs['class'] = 'form-control'

    # Telefon nömrəsi validasiyası
    def clean_tel_number(self):
        tel = self.cleaned_data.get('tel_number')
        if tel:
            import re
            digits = re.sub(r'\D', '', tel)
            
            if len(digits) == 9:
                return f'+994{digits}'
            elif len(digits) == 12 and digits.startswith('994'):
                return f'+{digits}'
            elif len(digits) == 13 and digits.startswith('0994'):
                return f'+{digits[1:]}'
        return tel

    def clean_shipping_phone_number(self):
        phone = self.cleaned_data.get('shipping_phone_number')
        if phone:
            import re
            digits = re.sub(r'\D', '', phone)
            
            if len(digits) == 9:
                return f'+994{digits}'
            elif len(digits) == 12 and digits.startswith('994'):
                return f'+{digits}'
            elif len(digits) == 13 and digits.startswith('0994'):
                return f'+{digits[1:]}'
        return phone

    # Email validasiyası
    def clean_email_address(self):
        email = self.cleaned_data.get('email_address')
        if email:
            email = email.lower().strip()
        return email

    # Shipping email validasiyası
    def clean_shipping_email(self):
        email = self.cleaned_data.get('shipping_email')
        if email:
            email = email.lower().strip()
        return email

    # Ümumi validasiya
    def clean(self):
        cleaned_data = super().clean()
        
        # Fərqli ünvan checkbox-ı işarələnibsə, shipping field-lərini yoxla
        different_shipping = cleaned_data.get('different_shipping')
        if different_shipping:
            shipping_first_name = cleaned_data.get('shipping_first_name')
            shipping_last_name = cleaned_data.get('shipping_last_name')
            shipping_email = cleaned_data.get('shipping_email')
            shipping_phone_number = cleaned_data.get('shipping_phone_number') 
            shipping_address = cleaned_data.get('shipping_address')
            shipping_city = cleaned_data.get('shipping_city')
            
            if not shipping_first_name:
                self.add_error('shipping_first_name', 'Bu sahə tələb olunur')
            
            if not shipping_last_name:
                self.add_error('shipping_last_name', 'Bu sahə tələb olunur')
            
            if not shipping_email:
                self.add_error('shipping_email', 'Bu sahə tələb olunur')
            
            if not shipping_phone_number:
                ('shipping_phone_number', 'Bu sahə tələb olunur')
            
            if not shipping_address:
                self.add_error('shipping_address', 'Bu sahə tələb olunur')
            
            if not shipping_city:
                self.add_error('shipping_city', 'Bu sahə tələb olunur')
        
        return cleaned_data