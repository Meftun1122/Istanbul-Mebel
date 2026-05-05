from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.urls import reverse
from django.utils.html import format_html
from django.db.models import Count
from django.urls.exceptions import NoReverseMatch
from django.contrib import messages
from datetime import date
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
    list_display = [
        'user_id',
        'email_display',
        'username',
        'full_name',
        'user_status',
        'date_joined_display',
        'profile_link'
    ]
    
    list_display_links = ['email_display', 'username']
    
    search_fields = ['email', 'username', 'first_name', 'last_name']
    
    list_filter = [
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined'
    ]
    
    date_hierarchy = 'date_joined'
    list_per_page = 25
    
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
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['last_login', 'date_joined']
    
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
    
    def full_name(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return '-'
    full_name.short_description = 'Full Name'
    
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
            if hasattr(obj, 'user_profile') and obj.user_profile:
                url = reverse('admin:users_userprofile_change', args=[obj.user_profile.id])
                return format_html(
                    '<a class="button" href="{}" style="background: #149ddd; color: white; padding: 3px 8px; border-radius: 4px; text-decoration: none;">👤 View Profile</a>',
                    url
                )
        except (NoReverseMatch, AttributeError):
            pass
        return format_html('<span style="color: #999;">No profile</span>')
    profile_link.short_description = 'Profile'
    
    actions = ['activate_users', 'deactivate_users']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users were successfully activated.')
    activate_users.short_description = "✅ Activate selected users"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users were successfully deactivated.')
    deactivate_users.short_description = "❌ Deactivate selected users"
    
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
    
    def profile_id(self, obj):
        return format_html(
            '<span style="color: #28a745; font-weight: 600;">#{}</span>',
            obj.id
        )
    profile_id.short_description = 'ID'
    profile_id.admin_order_field = 'id'
    
    def user_info(self, obj):
        try:
            url = reverse('admin:users_user_change', args=[obj.user.id])
            return format_html(
                '<a href="{}" style="font-weight: 600;">{} {}</a><br><small style="color: #666;">{}</small>',
                url,
                obj.user.first_name,
                obj.user.last_name,
                obj.user.email
            )
        except NoReverseMatch:
            return format_html(
                '<span style="font-weight: 600;">{} {}</span><br><small style="color: #666;">{}</small>',
                obj.user.first_name,
                obj.user.last_name,
                obj.user.email
            )
    user_info.short_description = 'User'
    user_info.admin_order_field = 'user__email'
    
    def gender_display(self, obj):
        gender_dict = dict(UserProfile.GENDER_CHOICES)
        gender_name = gender_dict.get(obj.gender, 'Unknown')
        colors = {1: '#149ddd', 2: '#ff6b6b', 3: '#28a745'}
        color = colors.get(obj.gender, '#999')
        return format_html('<span style="color: {}; font-weight: 600;">{}</span>', color, gender_name)
    gender_display.short_description = 'Gender'
    gender_display.admin_order_field = 'gender'
    
    def birthdate_display(self, obj):
        if not obj.birthdate:
            return format_html('<span style="color: #999;">—</span>')
        age = self._calculate_age(obj.birthdate)
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
        return format_html('<a href="tel:{}" style="color: #149ddd;">{}</a>', obj.phone, obj.phone)
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
    
    def _calculate_age(self, birthdate):
        today = date.today()
        return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    
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
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    
    fieldsets = (
        (None, {
            'fields': (('gender', 'birthdate'), 'phone', ('receive_offers', 'subscribe_newsletter')),
        }),
    )


# Inline-ı əlavə et
CustomUserAdmin.inlines = [UserProfileInline]


# ======================================================== #
#                    CONTACT LOCATIONS                      #
# ======================================================== #

@admin.register(ContactLocationsModel)
class ContactLocationsModelAdmin(admin.ModelAdmin):
    list_display = ['address_preview', 'contact_info', 'status_badge', 'created_at']
    list_filter = ['is_active', 'created']
    search_fields = ['address', 'call_us', 'email_us', 'location']
    readonly_fields = ['created', 'updated']
    list_per_page = 20
    
    fieldsets = (
        ('📍 ÜNVAN MƏLUMATLARI', {
            'fields': ['address', 'location'],
            'classes': ['wide'],
        }),
        ('📞 ƏLAQƏ MƏLUMATLARI', {
            'fields': [('call_us', 'email_us')],
            'classes': ['wide'],
        }),
        ('⚙️ STATUS', {
            'fields': ['is_active', 'user'],
            'classes': ['collapse'],
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def address_preview(self, obj):
        if obj.address:
            short_addr = obj.address[:50] + '...' if len(obj.address) > 50 else obj.address
            return format_html(
                '<span style="display: flex; align-items: center; gap: 5px;">'
                '<span style="font-weight: 500;">{}</span></span>',
                short_addr
            )
        return '-'
    address_preview.short_description = '📍 Ünvan'
    address_preview.admin_order_field = 'address'
    
    def contact_info(self, obj):
        info = []
        if obj.call_us:
            info.append(f'<span>{obj.call_us}</span>')
        if obj.email_us:
            info.append(f'<span>{obj.email_us}</span>')
        return format_html('<br>'.join(info)) if info else '-'
    contact_info.short_description = '📞 Əlaqə'
    
    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 30px;">AKTİV</span>'
            )
        return format_html(
            '<span style="background: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 30px;">DEAKTİV</span>'
        )
    status_badge.short_description = '⚡ Status'
    status_badge.admin_order_field = 'is_active'
    
    def created_at(self, obj):
        return format_html(
            '<span style="white-space: nowrap;">{}<br>{}</span>',
            obj.created.strftime('%d.%m.%Y'),
            obj.created.strftime('%H:%M')
        )
    created_at.short_description = '⏱️ Tarix'
    
    def make_active(self, request, queryset):
        if queryset.count() > 1:
            self.message_user(request, 'Yalnız bir məlumat aktiv ola bilər!', level='WARNING')
            return
        obj = queryset.first()
        if obj:
            ContactLocationsModel.objects.filter(is_active=True).update(is_active=False)
            obj.is_active = True
            obj.save()
            self.message_user(request, f'✅ "{obj.address[:30]}..." aktiv edildi.')
    make_active.short_description = '📌 Seçilmişi AKTİV et'
    
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'⏸️ {updated} məlumat deaktiv edildi.')
    make_inactive.short_description = '⏸️ Seçilmişləri DEAKTİV et'
    
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


# ======================================================== #
#                      CONTACT US                          #
# ======================================================== #

@admin.register(ContactUsModel)
class ContactUsModelAdmin(admin.ModelAdmin):
    list_display = ['full_name_display', 'email_display', 'subject_badge', 'status_badge', 'user_badge', 'created_date_badge']
    list_display_links = ['full_name_display']
    list_filter = ['is_read', 'created']
    search_fields = ['first_name', 'last_name', 'email_address', 'subject']
    readonly_fields = ['created', 'updated']
    list_per_page = 25
    date_hierarchy = 'created'
    
    fieldsets = (
        ('👤 ŞƏXSİ MƏLUMATLAR', {
            'fields': [('first_name', 'last_name'), 'email_address'],
            'classes': ['wide'],
        }),
        ('📝 MESAJ MƏLUMATLARI', {
            'fields': ['subject', 'message'],
            'classes': ['wide'],
        }),
        ('⚙️ STATUS VƏ METADATA', {
            'fields': ['is_read', 'user', 'created', 'updated'],
            'classes': ['collapse'],
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def full_name_display(self, obj):
        return format_html(
            '<div><strong>{} {}</strong><br><small>ID: {}</small></div>',
            obj.first_name, obj.last_name, obj.id
        )
    full_name_display.short_description = '👤 Ad Soyad'
    full_name_display.admin_order_field = 'first_name'
    
    def email_display(self, obj):
        return format_html('<a href="mailto:{}">{}</a>', obj.email_address, obj.email_address)
    email_display.short_description = '📧 E-poçt'
    
    def subject_badge(self, obj):
        subject = obj.subject[:30] + '...' if len(obj.subject) > 30 else obj.subject
        return format_html(
            '<span style="background: #eee; padding: 4px 10px; border-radius: 30px;">{}</span>',
            subject
        )
    subject_badge.short_description = '🏷️ Mövzu'
    
    def status_badge(self, obj):
        if obj.is_read:
            return format_html(
                '<span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 30px;">OXUNDU</span>'
            )
        return format_html(
            '<span style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 30px;">GÖZLƏNİLİR</span>'
        )
    status_badge.short_description = '📫 Status'
    status_badge.admin_order_field = 'is_read'
    
    def user_badge(self, obj):
        if obj.user:
            return format_html('@{}', obj.user.username)
        return 'Qonaq'
    user_badge.short_description = '👥 İstifadəçi'
    
    def created_date_badge(self, obj):
        return format_html('{}<br><small>{}</small>', obj.created.strftime('%d.%m.%Y'), obj.created.strftime('%H:%M'))
    created_date_badge.short_description = '📅 Tarix'
    created_date_badge.admin_order_field = 'created'
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} mesaj oxundu olaraq işarələndi.')
    mark_as_read.short_description = "Seçilmişləri oxundu işarələ"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} mesaj oxunmamış olaraq işarələndi.')
    mark_as_unread.short_description = "Seçilmişləri oxunmamış işarələ"
    
    def save_model(self, request, obj, form, change):
        if not obj.user and request.user.is_authenticated:
            obj.user = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['total_messages'] = ContactUsModel.objects.count()
        extra_context['unread_messages'] = ContactUsModel.objects.filter(is_read=False).count()
        return super().changelist_view(request, extra_context)