from django import forms
from .models import ReviewModel
from django.utils.translation import gettext_lazy as _

class ReviewForm(forms.ModelForm):
    """
    Məhsul rəyləri üçün form (əsas comment-lər)
    """
    class Meta:
        model = ReviewModel
        fields = ['name', 'surname', 'text', 'rating']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control name-input first-name',
                'placeholder': _('Ad'),
                'id': 'id_name'
            }),
            'surname': forms.TextInput(attrs={
                'class': 'form-control name-input last-name',
                'placeholder': _('Soyad'),
                'id': 'id_surname'
            }),
            'text': forms.Textarea(attrs={
                'class': 'form-control comment-input',
                'placeholder': _('Rəyinizi burada yazın...'),
                'id': 'id_text',
                'rows': 4
            }),
            'rating': forms.RadioSelect(choices=[(i, f'{i} Ulduz') for i in range(1, 6)]),
        }
        labels = {
            'name': _('Ad'),
            'surname': _('Soyad'),
            'text': _('Rəyiniz'),
            'rating': _('Qiymətləndirmə'),
        }
        error_messages = {
            'name': {
                'required': _('Ad daxil edilməlidir'),
                'max_length': _('Ad çox uzundur (maksimum 100 simvol)'),
            },
            'surname': {
                'required': _('Soyad daxil edilməlidir'),
                'max_length': _('Soyad çox uzundur (maksimum 100 simvol)'),
            },
            'text': {
                'required': _('Rəy mətni daxil edilməlidir'),
            },
            'rating': {
                'required': _('Qiymətləndirmə seçilməlidir'),
            },
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Rating sahəsi üçün əlavə siniflər
        self.fields['rating'].widget.attrs.update({
            'class': 'star-rating-input'
        })
        
        # Placeholder-lar
        self.fields['name'].widget.attrs['placeholder'] = _('Adınızı daxil edin')
        self.fields['surname'].widget.attrs['placeholder'] = _('Soyadınızı daxil edin')
        self.fields['text'].widget.attrs['placeholder'] = _('Rəyinizi yazın...')

    def clean_rating(self):
        rating = self.cleaned_data.get('rating')
        if rating and (rating < 1 or rating > 5):
            raise forms.ValidationError(_('Qiymətləndirmə 1-5 arasında olmalıdır!'))
        return rating

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if name and len(name) < 2:
            raise forms.ValidationError(_('Ad çox qısadır (minimum 2 simvol)'))
        return name

    def clean_surname(self):
        surname = self.cleaned_data.get('surname')
        if surname and len(surname) < 2:
            raise forms.ValidationError(_('Soyad çox qısadır (minimum 2 simvol)'))
        return surname


class ReplyForm(forms.Form):
    """
    Reply-lər üçün form (rating tələb olunmur)
    """
    name = forms.CharField(max_length=100, required=False, widget=forms.TextInput(attrs={
        'class': 'form-control reply-name-input',
        'placeholder': _('Adınız (istəyə bağlı)'),
        'id': 'id_reply_name'
    }),label=_('Ad'))
    # Soyad sahəsi isteğe bağlı oldu, beləliklə istifadəçi yalnız adını daxil edə bilər və ya hər ikisini daxil edə bilər.
    surname = forms.CharField(max_length=100, required=False, widget=forms.TextInput(attrs={
        'class': 'form-control reply-surname-input',
        'placeholder': _('Soyadınız (istəyə bağlı)'),
        'id': 'id_reply_surname'
    }),label=_('Soyad'))
    # Rəy mətni
    text = forms.CharField(widget=forms.Textarea(attrs={
        'class': 'form-control reply-text-input',
        'placeholder': _('Cavabınızı yazın...'),
        'id': 'id_reply_text',
        'rows': 3
    }),label=_('Cavab Mətni'),error_messages={'required': _('Cavab mətni daxil edilməlidir'),})
    # Rating reply-lər üçün tələb olunmur, beləliklə bu sahə formdan çıxarıldı
    parent_id = forms.IntegerField(widget=forms.HiddenInput(attrs={
        'id': 'id_parent_id',
        'class': 'parent-id-input'
    }))
    # Reply-lərin kimə cavab verdiyini saxlamaq üçün əlavə sahə (istəyə bağlı)
    reply_to_name = forms.CharField(max_length=200, required=False, widget=forms.HiddenInput(attrs={
        'id': 'id_reply_to_name'
    }))

    def clean_text(self):
        text = self.cleaned_data.get('text')
        if text and len(text) < 2:
            raise forms.ValidationError(_('Cavab çox qısadır (minimum 2 simvol)'))
        return text

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not name:
            return _('İstifadəçi')
        return name


class ReviewFilterForm(forms.Form):
    """
    Rəyləri filtrləmək üçün form
    """
    SORT_CHOICES = [
        ('newest', _('Ən Yenilər')),
        ('oldest', _('Ən Köhnələr')),
        ('highest', _('Ən Yüksək Reytinq')),
        ('lowest', _('Ən Aşağı Reytinq')),
    ]
    # RATING_CHOICES-da boş seçim əlavə edildi, beləliklə istifadəçi bütün reytinqləri görə bilər
    RATING_CHOICES = [('', _('Bütün Reytinqlər'))] + [(i, f'{i} Ulduz') for i in range(1, 6)]
    sort = forms.ChoiceField(choices=SORT_CHOICES, required=False, initial='newest', widget=forms.Select(attrs={
        'class': 'form-select sort-select',
        'id': 'id_sort'
    }),label=_('Sırala'))
    # RATING_CHOICES-da boş seçim əlavə edildi, beləliklə istifadəçi bütün reytinqləri görə bilər
    rating = forms.ChoiceField(choices=RATING_CHOICES, required=False, widget=forms.Select(attrs={
        'class': 'form-select rating-select',
        'id': 'id_filter_rating'
    }),label=_('Reytinqə görə filtrele'))
    # Axtarış sahəsi əlavə edildi
    search = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'class': 'form-control search-input',
        'placeholder': _('Rəylərdə axtar...'),
        'id': 'id_search'
    }),label=_('Axtar'))
    # Yalnız aktiv rəyləri göstərmək üçün checkbox əlavə edildi
    is_active = forms.BooleanField(required=False, initial=True, widget=forms.CheckboxInput(attrs={
        'class': 'form-check-input',
        'id': 'id_is_active'
    }),label=_('Yalnız aktivləri göstər'))


class QuickReviewForm(forms.ModelForm):
    """
    Sadə və sürətli rəy formu (AJAX üçün optimallaşdırılmış)
    """
    class Meta:
        model = ReviewModel
        fields = ['name', 'surname', 'text', 'rating']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'quick-name-input',
                'placeholder': _('Ad'),
                'data-required': 'true'
            }),
            'surname': forms.TextInput(attrs={
                'class': 'quick-surname-input',
                'placeholder': _('Soyad'),
                'data-required': 'true'
            }),
            'text': forms.Textarea(attrs={
                'class': 'quick-text-input',
                'placeholder': _('Rəyiniz...'),
                'rows': 2
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get('name')
        surname = cleaned_data.get('surname')
        text = cleaned_data.get('text')
        rating = cleaned_data.get('rating')

        errors = {}
        
        if not name:
            errors['name'] = _('Ad tələb olunur')
        if not surname:
            errors['surname'] = _('Soyad tələb olunur')
        if not text:
            errors['text'] = _('Rəy mətni tələb olunur')
        if not rating:
            errors['rating'] = _('Qiymətləndirmə tələb olunur')

        if errors:
            raise forms.ValidationError(errors)
        
        return cleaned_data


class BulkReviewActionForm(forms.Form):
    """
    Admin panel üçün toplu əməliyyatlar formu
    """
    ACTION_CHOICES = [
        ('activate', _('Seçilənləri aktiv et')),
        ('deactivate', _('Seçilənləri deaktiv et')),
        ('delete', _('Seçilənləri sil')),
    ]
    action = forms.ChoiceField(choices=ACTION_CHOICES, required=True,widget=forms.Select(attrs={'class': 'form-select'}))
    review_ids = forms.CharField(widget=forms.HiddenInput(),required=False)


class ReviewStatsForm(forms.Form):
    """
    Rəy statistikası üçün form
    """
    date_from = forms.DateField(required=False, widget=forms.DateInput(attrs={
        'type': 'date',
        'class': 'form-control'
    }),label=_('Başlanğıc Tarix'))
    
    date_to = forms.DateField(required=False, widget=forms.DateInput(attrs={
        'type': 'date',
        'class': 'form-control'
    }),label=_('Bitiş Tarix'))
    product = forms.ModelChoiceField(queryset=None, required=False, widget=forms.Select(attrs={'class': 'form-select'}),
        label=_('Məhsula görə filtrele')
    )
    
    def __init__(self, *args, **kwargs):
        product_queryset = kwargs.pop('product_queryset', None)
        super().__init__(*args, **kwargs)
        if product_queryset is not None:
            self.fields['product'].queryset = product_queryset
