from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.urls import reverse
from django.utils.html import format_html
from django.db.models import Count
from django.urls.exceptions import NoReverseMatch
from django.contrib import messages
from .models import *


# ========== ADMIN SITE HEADER ==========
admin.site.site_header = 'İstanbul Mebel Admin Panel'
admin.site.site_title = 'İstanbul Mebel'
admin.site.index_title = 'İdarəetmə Paneli'


# ======================================================== #
#                    USER ADMIN                             #
# ======================================================== #

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """
    Custom User Admin Panel
    """
    # List display
    list_display = [
        'user_id',
        'email_display',
        'username',
        'first_name',
        'user_status',
        'date_joined_display',
        'profile_link'
    ]
    
    list_display_links = ['email_display', 'username']
    
    # Search fields
    search_fields = ['email', 'username', 'first_name', 'last_name']
    
    # Filters
    list_filter = [
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined'
    ]
    
    # Date hierarchy
    date_hierarchy = 'date_joined'
    
    # Pagination
    list_per_page = 25
    
    # Fieldsets
    fieldsets = (
        ('📧 ACCOUNT INFORMATION', {
            'fields': ('email', 'username'),
            'classes': ('wide',)
        }),
        
        ('👤 PERSONAL INFORMATION', {
            'fields': (('first_name', 'last_name'),),
            'classes': ('wide',)
        }),
        
        ('🔐 PERMISSIONS', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('wide', 'collapse')
        }),
        
        ('📅 IMPORTANT DATES', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('wide', 'collapse')
        }),
    )
    
    # Add form fieldsets
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    # Readonly fields
    readonly_fields = ['last_login', 'date_joined']
    
    # Custom methods
    def user_id(self, obj):
        return format_html(
            '<span style="color: #149ddd; font-weight: 600;">#{}</span>',
            obj.id
        )
    user_id.short_description = 'ID'
    user_id.admin_order_field = 'id'
    
    def email_display(self, obj):
        if obj.is_active:
            return format_html(
                '<a href="mailto:{}" style="color: #28a745;">{}</a>',
                obj.email,
                obj.email
            )
        return format_html(
            '<a href="mailto:{}" style="color: #dc3545;">{}</a>',
            obj.email,
            obj.email
        )
    email_display.short_description = 'Email'
    email_display.admin_order_field = 'email'
    
    def first_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return '-'
    first_name.short_description = 'Full Name'
    
    def user_status(self, obj):
        if obj.is_superuser:
            return format_html(
                '<span style="background-color: #ffc107; color: #333; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600;">SUPERUSER</span>'
            )
        elif obj.is_staff:
            return format_html(
                '<span style="background-color: #17a2b8; color: white; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600;">STAFF</span>'
            )
        elif obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600;">ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600;">INACTIVE</span>'
        )
    user_status.short_description = 'Status'
    user_status.admin_order_field = 'is_active'
    
    def date_joined_display(self, obj):
        return format_html(
            '<span title="{}">{}</span><br><small style="color: #999;">{}</small>',
            obj.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
            obj.date_joined.strftime('%d.%m.%Y'),
            obj.date_joined.strftime('%H:%M')
        )
    date_joined_display.short_description = 'Joined'
    date_joined_display.admin_order_field = 'date_joined'
    
    def profile_link(self, obj):
        try:
            if hasattr(obj, 'user_profile'):
                try:
                    url = reverse('admin:users_userprofile_change', args=[obj.user_profile.id])
                except NoReverseMatch:
                    url = f"/admin/Users/userprofile/{obj.user_profile.id}/change/"
                return format_html(
                    '<a class="button" href="{}" style="background: #149ddd; color: white; padding: 3px 8px; border-radius: 4px; text-decoration: none;">👤 View Profile</a>',
                    url
                )
        except:
            pass
        return format_html(
            '<span style="color: #999;">No profile</span>'
        )
    profile_link.short_description = 'Profile'
    
    # Actions
    actions = ['activate_users', 'deactivate_users']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users were successfully activated.')
    activate_users.short_description = "✅ Activate selected users"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users were successfully deactivated.')
    deactivate_users.short_description = "❌ Deactivate selected users"
    
    # Inlines
    inlines = []
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


# ======================================================== #
#                   USER PROFILE ADMIN                      #
# ======================================================== #

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    User Profile Admin Panel
    """
    list_display = [
        'profile_id',
        'user_info',
        'gender_display',
        'birthdate_display',
        'phone_display',
        'offers_status',
        'newsletter_status'
    ]
    
    list_display_links = ['profile_id', 'user_info']
    
    search_fields = [
        'user__email', 
        'user__username', 
        'user__first_name', 
        'user__last_name',
        'phone'
    ]
    
    list_filter = [
        'gender',
        'receive_offers',
        'subscribe_newsletter',
        'created'
    ]
    
    date_hierarchy = 'created'
    
    list_per_page = 25
    
    fieldsets = (
        ('👤 USER INFORMATION', {
            'fields': ('user',),
            'classes': ('wide',)
        }),
        
        ('📋 PERSONAL DETAILS', {
            'fields': (('gender', 'birthdate'), 'phone'),
            'classes': ('wide',)
        }),
        
        ('📧 PREFERENCES', {
            'fields': (('receive_offers', 'subscribe_newsletter'),),
            'classes': ('wide',)
        }),
    )
    
    readonly_fields = ['created', 'updated']
    
    # Custom methods
    def profile_id(self, obj):
        return format_html(
            '<span style="color: #28a745; font-weight: 600;">#{}</span>',
            obj.id
        )
    profile_id.short_description = 'ID'
    profile_id.admin_order_field = 'id'
    
    def user_info(self, obj):
        try:
            try:
                url = reverse('admin:users_user_change', args=[obj.user.id])
            except NoReverseMatch:
                url = f"/admin/Users/user/{obj.user.id}/change/"
            return format_html(
                '<a href="{}" style="font-weight: 600;">{} {}</a><br><small style="color: #666;">{}</small>',
                url,
                obj.user.first_name,
                obj.user.last_name,
                obj.user.email
            )
        except:
            return format_html(
                '<span style="font-weight: 600;">{} {}</span><br><small style="color: #666;">{}</small>',
                obj.user.first_name,
                obj.user.last_name,
                obj.user.email
            )
    user_info.short_description = 'User'
    user_info.admin_order_field = 'user__email'
    
    def gender_display(self, obj):
        gender_dict = dict(self.model.GENDER_CHOICES)
        gender_name = gender_dict.get(obj.gender, 'Unknown')
        
        colors = {1: '#149ddd', 2: '#ff6b6b', 3: '#28a745'}
        color = colors.get(obj.gender, '#999')
        
        return format_html(
            '<span style="color: {}; font-weight: 600;">{}</span>',
            color,
            gender_name
        )
    gender_display.short_description = 'Gender'
    gender_display.admin_order_field = 'gender'
    
    def birthdate_display(self, obj):
        if not obj.birthdate:
            return format_html('<span style="color: #999;">—</span>')
        
        age = self.calculate_age(obj.birthdate)
        return format_html(
            '<span title="{}">{}</span><br><small style="color: #999;">{} years</small>',
            obj.birthdate.strftime('%d.%m.%Y'),
            obj.birthdate.strftime('%d.%m.%Y'),
            age
        )
    birthdate_display.short_description = 'Birth Date'
    birthdate_display.admin_order_field = 'birthdate'
    
    def phone_display(self, obj):
        if not obj.phone:
            return format_html('<span style="color: #999;">—</span>')
        return format_html(
            '<a href="tel:{}" style="color: #149ddd;">{}</a>',
            obj.phone,
            obj.phone
        )
    phone_display.short_description = 'Phone'
    
    def offers_status(self, obj):
        if obj.receive_offers:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 20px; font-size: 11px;">✅ YES</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 8px; border-radius: 20px; font-size: 11px;">❌ NO</span>'
        )
    offers_status.short_description = 'Offers'
    offers_status.admin_order_field = 'receive_offers'
    
    def newsletter_status(self, obj):
        if obj.subscribe_newsletter:
            return format_html(
                '<span style="background-color: #17a2b8; color: white; padding: 3px 8px; border-radius: 20px; font-size: 11px;">📧 YES</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 8px; border-radius: 20px; font-size: 11px;">❌ NO</span>'
        )
    newsletter_status.short_description = 'Newsletter'
    newsletter_status.admin_order_field = 'subscribe_newsletter'
    
    def calculate_age(self, birthdate):
        from datetime import date
        today = date.today()
        return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    
    # Actions
    actions = ['enable_offers', 'disable_offers', 'enable_newsletter', 'disable_newsletter']
    
    def enable_offers(self, request, queryset):
        updated = queryset.update(receive_offers=True)
        self.message_user(request, f'{updated} profiles updated - offers enabled.')
    enable_offers.short_description = "📢 Enable offers for selected"
    
    def disable_offers(self, request, queryset):
        updated = queryset.update(receive_offers=False)
        self.message_user(request, f'{updated} profiles updated - offers disabled.')
    disable_offers.short_description = "🔕 Disable offers for selected"
    
    def enable_newsletter(self, request, queryset):
        updated = queryset.update(subscribe_newsletter=True)
        self.message_user(request, f'{updated} profiles updated - newsletter enabled.')
    enable_newsletter.short_description = "📧 Enable newsletter for selected"
    
    def disable_newsletter(self, request, queryset):
        updated = queryset.update(subscribe_newsletter=False)
        self.message_user(request, f'{updated} profiles updated - newsletter disabled.')
    disable_newsletter.short_description = "📭 Disable newsletter for selected"


# ======================================================== #
#                   USER PROFILE INLINE                     #
# ======================================================== #

class UserProfileInline(admin.StackedInline):
    """
    User Profile Inline for User Admin
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    
    fieldsets = (
        (None, {
            'fields': (('gender', 'birthdate'), 'phone', ('receive_offers', 'subscribe_newsletter')),
        }),
    )


# Inline-ı UserAdmin-ə əlavə edin
CustomUserAdmin.inlines = [UserProfileInline]






# ========== CUSTOM ADMIN MİXINS ==========
class ReadOnlyAdminMixin:
    """Oxunmuş mesajları qeyd etmək üçün mixin"""
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f"{queryset.count()} mesaj oxundu olaraq işarələndi.")
    mark_as_read.short_description = "Seçilmişləri oxundu işarələ"

    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f"{queryset.count()} mesaj oxunmamış olaraq işarələndi.")
    mark_as_unread.short_description = "Seçilmişləri oxunmamış işarələ"


# ========== CONTACT LOCATIONS MODEL ADMIN ==========
@admin.register(ContactLocationsModel)
class ContactLocationsModelAdmin(admin.ModelAdmin):
    """
    Şirkət əlaqə məlumatları - SADƏCƏ 1 DƏFƏ DOLDURULACAQ
    """
    # List görünüşü
    list_display = [
        'address_preview',
        'contact_info',
        'status_badge',
        'created_at'
    ]
    
    list_filter = [
        'is_active',
        'created'
    ]
    
    search_fields = [
        'address',
        'call_us',
        'email_us',
        'location'
    ]
    
    fieldsets = [
        (
            '📍 ÜNVAN MƏLUMATLARI',
            {
                'fields': [
                    'address',
                    'location',
                ],
                'classes': ['wide'],
                'description': 'Şirkətin ünvan və lokasiya məlumatları'
            }
        ),
        (
            '📞 ƏLAQƏ MƏLUMATLARI',
            {
                'fields': [
                    ('call_us', 'email_us'),
                ],
                'classes': ['wide'],
                'description': 'Telefon və email məlumatları'
            }
        ),
        (
            '⚙️ STATUS',
            {
                'fields': [
                    'is_active',
                    'user',
                ],
                'classes': ['collapse'],
                'description': 'Aktivlik statusu'
            }
        ),
    ]
    
    readonly_fields = ['created', 'updated']
    list_per_page = 20
    
    actions = ['make_active', 'make_inactive']
    
    class Media:
        css = {
            'all': ('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',)
        }
    
    # ===== CUSTOM METHODS =====
    def address_preview(self, obj):
        """Ünvan önizləməsi"""
        if obj.address:
            return format_html(
                '<span style="display: flex; align-items: center; gap: 5px;">'
                '<i class="fas fa-map-marker-alt" style="color: #dc3545;"></i>'
                '<span style="font-weight: 500;">{}</span>'
                '</span>',
                obj.address[:50] + '...' if len(obj.address) > 50 else obj.address
            )
        return '-'
    address_preview.short_description = '📍 Ünvan'
    address_preview.admin_order_field = 'address'
    
    def contact_info(self, obj):
        """Əlaqə məlumatları"""
        info = []
        if obj.call_us:
            info.append(
                f'<span style="display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">'
                f'<i class="fas fa-phone-alt" style="color: #28a745; width: 16px;"></i>'
                f'<span style="font-weight: 500;">{obj.call_us}</span>'
                f'</span>'
            )
        if obj.email_us:
            info.append(
                f'<span style="display: flex; align-items: center; gap: 5px;">'
                f'<i class="fas fa-envelope" style="color: #007bff; width: 16px;"></i>'
                f'<span style="font-weight: 500;">{obj.email_us}</span>'
                f'</span>'
            )
        return format_html(''.join(info)) if info else '-'
    contact_info.short_description = '📞 Əlaqə'
    
    def status_badge(self, obj):
        """Status badge"""
        if obj.is_active:
            return format_html(
                '<span style="background: #d4edda; color: #155724; padding: 4px 12px; '
                'border-radius: 30px; font-size: 11px; font-weight: 600; display: inline-block; '
                'box-shadow: 0 2px 5px rgba(0,0,0,0.05);">'
                '<i class="fas fa-check-circle" style="margin-right: 3px;"></i> AKTİV'
                '</span>'
            )
        return format_html(
            '<span style="background: #f8d7da; color: #721c24; padding: 4px 12px; '
            'border-radius: 30px; font-size: 11px; font-weight: 600; display: inline-block; '
            'box-shadow: 0 2px 5px rgba(0,0,0,0.05);">'
            '<i class="fas fa-times-circle" style="margin-right: 3px;"></i> DEAKTİV'
            '</span>'
        )
    status_badge.short_description = '⚡ Status'
    status_badge.admin_order_field = 'is_active'
    
    def created_at(self, obj):
        """Yaradılma tarixi"""
        return format_html(
            '<span style="font-size: 11px; color: #666; white-space: nowrap;">'
            '<i class="far fa-calendar-alt" style="margin-right: 3px;"></i> {}<br>'
            '<i class="far fa-clock" style="margin-right: 3px;"></i> {}'
            '</span>',
            obj.created.strftime('%d.%m.%Y'),
            obj.created.strftime('%H:%M')
        )
    created_at.short_description = '⏱️ Tarix'
    
    # ===== ACTIONS =====
    def make_active(self, request, queryset):
        if queryset.count() > 1:
            self.message_user(request, 'Yalnız bir məlumat aktiv ola bilər!', level='WARNING')
            return
        
        obj = queryset.first()
        if obj:
            obj.is_active = True
            obj.save()
            self.message_user(request, f'✅ "{obj.address[:30]}..." aktiv edildi.')
    make_active.short_description = '📌 Seçilmişi AKTİV et'
    
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'⏸️ {updated} məlumat deaktiv edildi.')
    make_inactive.short_description = '⏸️ Seçilmişləri DEAKTİV et'
    
    # ===== OVERRIDE =====
    def save_model(self, request, obj, form, change):
        if not obj.user and request.user.is_authenticated:
            obj.user = request.user
        super().save_model(request, obj, form, change)
    
    def changelist_view(self, request, extra_context=None):
        active_count = ContactLocationsModel.objects.filter(is_active=True).count()
        
        if active_count > 1:
            messages.warning(request, '⚠️ Birdən çox aktiv məlumat var! Yalnız bir aktiv olmalıdır.')
        elif active_count == 0:
            messages.warning(request, '⚠️ Aktiv məlumat yoxdur! İstifadəçilərə göstərmək üçün birini aktiv edin.')
        
        return super().changelist_view(request, extra_context)


# ========== CONTACT US MODEL ADMIN - DÜZƏLDİLMİŞ VERSİYA ==========
@admin.register(ContactUsModel)
class ContactUsModelAdmin(admin.ModelAdmin, ReadOnlyAdminMixin):
    """
    İstifadəçilərin göndərdiyi mesajlar
    """
    # list_display-dən MESAJ SİLİNDİ!
    list_display = [
        'full_name_display',
        'email_display',
        'subject_badge',
        'status_badge',
        'user_badge',
        'created_date_badge'
    ]
    
    list_display_links = ['full_name_display']
    
    list_filter = [
        'is_read',
        'created'
    ]
    
    search_fields = [
        'first_name',
        'last_name',
        'email_address',
        'subject'
    ]
    
    fieldsets = [
        (
            '👤 ŞƏXSİ MƏLUMATLAR',
            {
                'fields': [
                    ('first_name', 'last_name'),
                    'email_address',
                ],
                'classes': ['wide'],
            }
        ),
        (
            '📝 MESAJ MƏLUMATLARI',
            {
                'fields': [
                    'subject',
                    'message',
                ],
                'classes': ['wide'],
            }
        ),
        (
            '⚙️ STATUS VƏ METADATA',
            {
                'fields': [
                    'is_read',
                    'user',
                    'created',
                    'updated'
                ],
                'classes': ['collapse'],
            }
        ),
    ]
    
    readonly_fields = ['created', 'updated', 'message_full']
    list_per_page = 25
    date_hierarchy = 'created'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    class Media:
        css = {
            'all': ('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',)
        }
    
    # ===== CUSTOM METHODS - YENİ DİZAYN =====
    def full_name_display(self, obj):
        """Avatar olmadan sadə ad soyad - AÇIQ RƏNG"""
        return format_html(
            '<div style="display: flex; flex-direction: column;">'
            '<span style="font-weight: 500; color: #f8f9fa;">{} {}</span>'  # AÇIQ RƏNG
            '<span style="font-size: 10px; color: #adb5bd;">ID: {}</span>'  # AÇIQ BOZ
            '</div>',
            obj.first_name,
            obj.last_name,
            obj.id
        )
    full_name_display.short_description = '👤 Ad Soyad'
    full_name_display.admin_order_field = 'first_name'
    
    def email_display(self, obj):
        """Email - AÇIQ RƏNG"""
        return format_html(
            '<span style="display: flex; align-items: center; gap: 5px;">'
            '<i class="fas fa-envelope" style="color: #74b9ff;"></i>'  # AÇIQ MAVİ
            '<span style="color: #f8f9fa;">{}</span>'  # AÇIQ AĞ
            '</span>',
            obj.email_address
        )
    email_display.short_description = '📧 E-poçt'
    
    def subject_badge(self, obj):
        """Mövzu badge"""
        subject = obj.subject[:30] + '...' if len(obj.subject) > 30 else obj.subject
        return format_html(
            '<span style="background: #2d3b5a; color: #a5d8ff; padding: 4px 10px; '  # TÜND FON, AÇIQ YAZI
            'border-radius: 30px; font-size: 11px; font-weight: 500; display: inline-block; '
            'max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'
            '<i class="fas fa-tag" style="margin-right: 3px; font-size: 9px;"></i> {}'
            '</span>',
            subject
        )
    subject_badge.short_description = '🏷️ Mövzu'
    
    def status_badge(self, obj):
        """Oxunma statusu - AÇIQ RƏNGLƏR"""
        if obj.is_read:
            return format_html(
                '<span style="background: #1e3a5f; color: #b7e4c7; padding: 4px 12px; '  # TÜND FON, AÇIQ YAŞIL
                'border-radius: 30px; font-size: 11px; font-weight: 600; display: inline-block; '
                'box-shadow: 0 2px 5px rgba(0,0,0,0.1);">'
                '<i class="fas fa-check-circle" style="margin-right: 3px;"></i> OXUNDU'
                '</span>'
            )
        return format_html(
            '<span style="background: #4a1e2c; color: #ffb3b3; padding: 4px 14px; '  # TÜND FON, AÇIQ QIRMIZI
            'border-radius: 30px; font-size: 11px; font-weight: 600; display: inline-block; '
            'box-shadow: 0 2px 8px rgba(255, 179, 179, 0.2); animation: pulse 2s infinite;">'
            '<i class="fas fa-envelope" style="margin-right: 3px;"></i> GÖZLƏNİLİR'
            '</span>'
        )
    status_badge.short_description = '📫 Status'
    status_badge.admin_order_field = 'is_read'
    
    def user_badge(self, obj):
        """İstifadəçi badge - AÇIQ RƏNGLƏR"""
        if obj.user:
            return format_html(
                '<span style="display: flex; align-items: center; gap: 5px; background: #2d3b5a; '  # TÜND FON
                'padding: 4px 10px; border-radius: 30px;">'
                '<i class="fas fa-user-check" style="color: #90d26d;"></i>'  # AÇIQ YAŞIL
                '<span style="color: #e0e0e0; font-weight: 500;">@{}</span>'  # AÇIQ BOZ
                '</span>',
                obj.user.username
            )
        return format_html(
            '<span style="display: flex; align-items: center; gap: 5px; background: #3a3a4a; '  # TÜND FON
            'padding: 4px 10px; border-radius: 30px;">'
            '<i class="fas fa-user-slash" style="color: #b0b0b0;"></i>'  # AÇIQ BOZ
            '<span style="color: #cccccc;">Qonaq</span>'  # AÇIQ BOZ
            '</span>'
        )
    user_badge.short_description = '👥 İstifadəçi'
    
    def created_date_badge(self, obj):
        """Tarix badge - AÇIQ RƏNGLƏR"""
        today = obj.created.date()
        now = obj.created
        
        if today == now.date():
            day = 'Bugün'
        elif (now.date() - today).days == 1:
            day = 'Dünən'
        else:
            day = obj.created.strftime('%d.%m.%Y')
        
        return format_html(
            '<span style="display: flex; align-items: center; gap: 5px; background: #2d3b5a; '  # TÜND FON
            'padding: 4px 10px; border-radius: 30px; white-space: nowrap;">'
            '<i class="far fa-calendar-alt" style="color: #b0b0b0;"></i>'  # AÇIQ BOZ
            '<span style="color: #e0e0e0;">{}</span>'  # AÇIQ BOZ
            '<span style="color: #a0a0a0; font-size: 10px;">{}</span>'  # AÇIQ BOZ
            '</span>',
            day,
            obj.created.strftime('%H:%M')
        )
    created_date_badge.short_description = '📅 Tarix'
    created_date_badge.admin_order_field = 'created'
    
    def message_full(self, obj):
        """Tam mesaj"""
        return format_html(
            '<div style="background: #1e2a3a; padding: 20px; border-radius: 12px; '  # TÜND FON
            'border-left: 4px solid #74b9ff; margin: 10px 0;">'  # AÇIQ MAVİ BORDER
            '<p style="margin: 0; color: #f0f0f0; line-height: 1.6; white-space: pre-wrap;">{}</p>'  # AÇIQ YAZI
            '</div>',
            obj.message
        )
    message_full.short_description = 'Mesaj'
    
    # ===== OVERRIDE =====
    def save_model(self, request, obj, form, change):
        if not obj.user and request.user.is_authenticated:
            obj.user = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        total = ContactUsModel.objects.count()
        unread = ContactUsModel.objects.filter(is_read=False).count()
        
        extra_context['total_messages'] = total
        extra_context['unread_messages'] = unread
        
        # Pulse animasiyası və əlavə stillər
        extra_context['admin_css'] = format_html(
            '<style>'
            '@keyframes pulse {{'
            '0% {{ opacity: 1; transform: scale(1); }}'
            '50% {{ opacity: 0.9; transform: scale(1.02); }}'
            '100% {{ opacity: 1; transform: scale(1); }}'
            '}}'
            '.field-full_name_display {{ white-space: nowrap; }}'
            '.field-subject_badge {{ max-width: 200px; }}'
            '/* Ümumi admin panel fonu üçün */'
            'body {{ background-color: #0a0e1a !important; }}'
            '#content {{ background-color: #0f1322 !important; }}'
            '.module {{ background-color: #1a1f2f !important; }}'
            '</style>'
        )
        
        return super().changelist_view(request, extra_context)


