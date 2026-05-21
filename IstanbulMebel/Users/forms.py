from django import forms
from django.contrib.auth.forms import AuthenticationForm, PasswordResetForm, SetPasswordForm
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from .models import *



User = get_user_model()
# ============================================= #
#            Register Form Start                #
# ============================================= #
class UserRegisterForm(forms.Form):
    GENDER_CHOICES = [
        (1, 'Kisi'),
        (2, 'Qadin'),
        (3, 'Diger'),
    ]

    first_name = forms.CharField(label='First Name:', widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Name',
    }))
    last_name = forms.CharField(label='Last Name:', widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Surname',
    }))
    email = forms.EmailField(label='Email Address:', widget=forms.EmailInput(attrs={
        'class': 'form-control',
        'placeholder': 'Your Email Address',
    }))
    current_password = forms.CharField(label='Password:', widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Current password',
    }))
    confirm_password = forms.CharField(label='Confirm Password:', widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Confirm password',
    }))
    gender = forms.ChoiceField(choices=GENDER_CHOICES, widget=forms.RadioSelect)
    birthdate = forms.DateField(label='Birth date', required=False, widget=forms.DateInput(attrs={
        'type': 'date',
        'class': 'form-control'
    }))
    phone = forms.CharField(label='Phone Number:', required=False, widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': '+994 XX XXX XX XX',
    }))
    # ✅ DÜZƏLDİLDİ - required=False, initial=True
    receive_offers = forms.BooleanField(required=False, initial=False, widget=forms.CheckboxInput(attrs={
        'class': 'form-check-input'
    }))
    
    # ✅ DÜZƏLDİLDİ - required=False, initial=True
    subscribe_newsletter = forms.BooleanField(required=False, initial=True, widget=forms.CheckboxInput(attrs={
        'class': 'form-check-input'
    }))

    # 🔹 Email yoxlaması
    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError('Email is already taken')
        return email

    # 🔹 Şifrə yoxlaması
    def clean(self):
        cleaned_data = super().clean()
        current_password = cleaned_data.get('current_password')
        confirm_password = cleaned_data.get('confirm_password')

        if current_password and confirm_password and current_password != confirm_password:
            raise forms.ValidationError('Passwords are not the same!')

        return cleaned_data




# ============================================= #
#               Login Form Start                #
# ============================================= #
class LoginForm(AuthenticationForm):
    username = forms.EmailField(widget=forms.EmailInput(attrs={
        'placeholder': 'Your email',
        'class': 'form-control'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': 'Your Password',
        'class': 'form-control'
    }))
    remember_me = forms.BooleanField(required=False, initial=True, widget=forms.CheckboxInput(attrs={
        'class': 'form-check-input'
    }))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'Email Address'
        self.fields['username'].error_messages = {'required': 'Email daxil edilməyib!'}
        self.fields['password'].error_messages = {'required': 'Şifrə daxil edilməyib!'}

    def clean_username(self):
        username = self.cleaned_data.get('username')
        
        print(f"clean_username - input: {username}")
        
        if not username:
            raise forms.ValidationError("Email daxil edilməyib!")
        
        username = username.lower().strip()
        print(f"clean_username - after strip: {username}")
        
        try:
            validate_email(username)
        except ValidationError:
            raise forms.ValidationError("Düzgün email formatı daxil edin! (example@domain.com)")
        
        # Email-ə görə user-i tap
        try:
            user = User.objects.get(email=username)
            print(f"clean_username - user found: {user.email}")
            return username
        except User.DoesNotExist:
            print(f"clean_username - user NOT found: {username}")
            raise forms.ValidationError("Bu email ilə qeydiyyatdan keçmiş istifadəçi tapılmadı!")

    def clean_password(self):
        password = self.cleaned_data.get('password')
        
        print(f"clean_password - input length: {len(password) if password else 0}")
        
        if not password:
            raise forms.ValidationError("Şifrə daxil edilməyib!")
        
        if len(password) < 3:
            raise forms.ValidationError("Şifrə çox qısadır!")
        
        return password

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        
        print("="*50)
        print("LOGIN FORM CLEAN METHOD")
        print(f"Email: {username}")
        print(f"Password length: {len(password) if password else 0}")
        
        if username and password:
            try:
                # USERNAME_FIELD = 'email' olduğu üçün email ilə axtar
                user = User.objects.get(email=username)
                
                print(f"User found in database: {user.email}")
                print(f"User is active: {user.is_active}")
                print(f"User password hash: {user.password}")
                
                # İstifadəçi aktivdirmi?
                if not user.is_active:
                    print("User is NOT active!")
                    self.add_error('username', "Hesabınız aktiv deyil! Email ünvanınızı təsdiqləyin.")
                    raise forms.ValidationError("Hesabınız aktiv deyil!")
                
                # Şifrəni yoxla
                if not user.check_password(password):
                    print("Password is INCORRECT!")
                    self.add_error('password', "Şifrə yanlışdır!")
                    raise forms.ValidationError("Email və ya şifrə yanlışdır!")
                
                print("Password is CORRECT!")
                
                # AuthenticationForm üçün user-i set et
                self.user_cache = user
                
            except User.DoesNotExist:
                print(f"User with email {username} NOT FOUND in database!")
                self.add_error('username', "Bu email ilə istifadəçi tapılmadı!")
                raise forms.ValidationError("Email və ya şifrə yanlışdır!")
        
        return cleaned_data

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        
        print("="*50)
        print(f"LOGIN DEBUG - Email: {username}")
        print(f"LOGIN DEBUG - Password length: {len(password) if password else 0}")
        
        # Bütün user-ləri göstər
        print("\nBütün user-lər:")
        for u in User.objects.all():
            print(f"  - {u.email} (active: {u.is_active})")
        
        # Email ilə axtar
        try:
            user = User.objects.get(email=username)
            print(f"\nUser tapıldı: {user.email}")
            print(f"Active: {user.is_active}")
            print(f"Password hash: {user.password}")
            
            if user.check_password(password):
                print("✓ Şifrə DOĞRUDUR!")
            else:
                print("✗ Şifrə YANLIŞDIR!")
                
        except User.DoesNotExist:
            print(f"\n✗ User tapılmadı: {username}")
        
        print("="*50)
        
        return cleaned_data
    def get_user(self):
        return self.user_cache


# ============================================= #
#          Password Reset Forms                 #
# ============================================= #
class CustomPasswordResetForm(PasswordResetForm):
    email = forms.EmailField(
        label="Email Address",
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email'
        })
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            email = email.lower().strip()
            
            # Email formatını yoxla
            try:
                validate_email(email)
            except ValidationError:
                raise forms.ValidationError("Düzgün email formatı daxil edin!")
            
            # User-in mövcudluğunu yoxla
            if not User.objects.filter(email=email).exists():
                raise forms.ValidationError("Bu email ilə qeydiyyatdan keçmiş istifadəçi tapılmadı!")
        return email


class CustomSetPasswordForm(SetPasswordForm):
    new_password1 = forms.CharField(
        required=True,
        label='New Password',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'New password'
        })
    )
    
    new_password2 = forms.CharField(
        required=True,
        label='Confirm New Password',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm new password'
        })
    )

    def clean_new_password1(self):
        password = self.cleaned_data.get('new_password1')
        
        if not password:
            raise forms.ValidationError("Yeni şifrə daxil edilməyib!")
        
        if len(password) < 8:
            raise forms.ValidationError("Şifrə ən az 8 simvol olmalıdır!")
        
        return password

    def clean_new_password2(self):
        password1 = self.cleaned_data.get("new_password1")
        password2 = self.cleaned_data.get("new_password2")

        if password1 and password2:
            if password1 != password2:
                raise forms.ValidationError("Şifrələr eyni deyil!")
        
        return password2




# ============================================= #
#           UserProfile Update Form             #
# ============================================= #
class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['gender', 'birthdate', 'phone', 'receive_offers', 'subscribe_newsletter']
        widgets = {
            'gender': forms.Select(attrs={'class': 'form-control'}),
            'birthdate': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+994 XX XXX XX XX'}),
            'receive_offers': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'subscribe_newsletter': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }




class ContactUsForm(forms.ModelForm):
    """
    Contact Us form - YALNIZ ContactUsModel üçün
    ContactLocationsModel ilə heç bir əlaqəsi YOXDUR!
    """
    
    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Adınız',
            'id': 'first_name'  
        }),
        error_messages={
            'required': 'Ad daxil edilməyib'
        }
    )
    
    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Soyadınız',
            'id': 'last_name',
        }),
        error_messages={
            'required': 'Soyad daxil edilməyib'  # DÜZƏLİŞ: daha düzgün mesaj
        }
    )
    
    email_address = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Email ünvanınız',
            'id': 'email_address'
        }),
        error_messages={
            'required': 'Email ünvanı daxil edilməyib',
            'invalid': 'Düzgün email formatı daxil edin'
        }
    )
    
    subject = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Mövzu',
            'id': 'subject'
        }),
        error_messages={
            'required': 'Mövzu daxil edilməyib'
        }
    )
    
    message = forms.CharField(
        required=True,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Mesajınız',
            'rows': 5,
            'id': 'message'
        }),
        error_messages={
            'required': 'Mesaj daxil edilməyib'
        }
    )

    class Meta:
        model = ContactUsModel
        # DÜZƏLİŞ: 'last_name' əlavə edildi
        fields = ['first_name', 'last_name', 'email_address', 'subject', 'message', 'user']
        widgets = {
            'user': forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Bütün field-lərə 'form-control' class-ı əlavə et
        for field_name, field in self.fields.items():
            if field_name != 'user':
                if 'class' not in field.widget.attrs:
                    field.widget.attrs['class'] = 'form-control'
        
        # ƏLAVƏ: Custom placeholder-ları qoru
        # (əgər placeholder varsa, onu silmə)
        
        # ƏLAVƏ: Required ulduzları avtomatik əlavə etmək üçün
        for field_name in ['first_name', 'last_name', 'email_address', 'subject', 'message']:
            self.fields[field_name].label_suffix = ' *'  # Label-ə * əlavə et

    def clean_email_address(self):
        """Email validasiyası"""
        email = self.cleaned_data.get('email_address')
        if email:
            email = email.lower().strip()
            
            try:
                validate_email(email)
            except ValidationError:
                raise forms.ValidationError('Düzgün email formatı daxil edin')
        
        return email

    def clean_first_name(self):
        """Ad validasiyası"""
        first_name = self.cleaned_data.get('first_name')
        if first_name:
            first_name = first_name.strip()
            
            if len(first_name) < 2:  # DÜZƏLİŞ: 3 deyil, 2 simvol kifayətdir
                raise forms.ValidationError('Ad ən az 2 simvol olmalıdır')
            
            if not first_name.replace(' ', '').isalpha():
                raise forms.ValidationError('Ad yalnız hərflərdən ibarət olmalıdır')
        
        return first_name

    def clean_last_name(self):
        """Soyad validasiyası - ƏLAVƏ EDİLDİ"""
        last_name = self.cleaned_data.get('last_name')
        if last_name:
            last_name = last_name.strip()
            
            if len(last_name) < 2:
                raise forms.ValidationError('Soyad ən az 2 simvol olmalıdır')
            
            if not last_name.replace(' ', '').isalpha():
                raise forms.ValidationError('Soyad yalnız hərflərdən ibarət olmalıdır')
        
        return last_name

    def clean_subject(self):
        """Mövzu validasiyası"""
        subject = self.cleaned_data.get('subject')
        if subject:
            subject = subject.strip()
            
            if len(subject) < 3:
                raise forms.ValidationError('Mövzu ən az 3 simvol olmalıdır')
        
        return subject

    def clean_message(self):
        """Mesaj validasiyası"""
        message = self.cleaned_data.get('message')
        if message:
            message = message.strip()
            
            if len(message) < 10:
                raise forms.ValidationError('Mesaj ən az 10 simvol olmalıdır')
        
        return message

    def clean(self):
        """Ümumi validasiya"""
        cleaned_data = super().clean()
        
        # ƏLAVƏ: Əgər həm ad, həm soyad varsa, birlikdə yoxla
        first_name = cleaned_data.get('first_name')
        last_name = cleaned_data.get('last_name')
        
        if first_name and last_name:
            full_name = f"{first_name} {last_name}"
            if len(full_name.replace(' ', '')) < 3:
                raise forms.ValidationError('Ad və soyad birlikdə ən az 3 simvol olmalıdır')
        
        return cleaned_data

