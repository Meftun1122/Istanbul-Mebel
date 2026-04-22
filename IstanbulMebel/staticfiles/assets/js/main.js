/**
 * Template Name: iPortfolio
 * Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
 * Updated: Jun 29 2024 with Bootstrap v5.3.3
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 * 
 * DÜZƏLDİLMİŞ VERSİYA - TAM AJAX DƏSTƏYİ (Səhifə yenilənmir)
 * FİKS: Profil ad və soyad dərhal dəyişir
 * FİKS: Telefon nömrəsi dərhal dəyişir
 * FİKS: BÜTÜN ALERTLAR SİLİNDİ
 */

(function () {
  "use strict";

  // ========== HEADER TOGGLE ==========
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header')?.classList.toggle('header-show');
    headerToggleBtn?.classList.toggle('bi-list');
    headerToggleBtn?.classList.toggle('bi-x');
  }

  if (headerToggleBtn) {
    headerToggleBtn.addEventListener('click', headerToggle);
  }

  // ========== HIDE MOBILE NAV ON HASH LINKS ==========
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });
  });

  // ========== TOGGLE MOBILE NAV DROPDOWNS ==========
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling?.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  // ========== PRELOADER ==========
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  // ========== SCROLL TOP BUTTON ==========
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }

  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  // ========== AOS INIT ==========
  function aosInit() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }
  window.addEventListener('load', aosInit);

  // ========== TYPED.JS INIT ==========
  const selectTyped = document.querySelector('.typed');
  if (selectTyped && typeof Typed !== 'undefined') {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings ? typed_strings.split(',') : [];
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  // ========== PURE COUNTER INIT ==========
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  // ========== SKILLS ANIMATION ==========
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  if (skillsAnimation.length > 0 && typeof Waypoint !== 'undefined') {
    skillsAnimation.forEach((item) => {
      new Waypoint({
        element: item,
        offset: '80%',
        handler: function () {
          let progress = item.querySelectorAll('.progress .progress-bar');
          progress.forEach(el => {
            el.style.width = el.getAttribute('aria-valuenow') + '%';
          });
        }
      });
    });
  }

  // ========== GLIGHTBOX INIT ==========
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '.glightbox'
    });
  }

  // ========== ISOTOPE LAYOUT ==========
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    if (typeof imagesLoaded === 'undefined' || typeof Isotope === 'undefined') return;

    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active')?.classList.remove('filter-active');
        this.classList.add('filter-active');
        if (initIsotope) {
          initIsotope.arrange({
            filter: this.getAttribute('data-filter')
          });
        }
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });
  });

  // ========== SWIPER INIT ==========
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;

    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let configElement = swiperElement.querySelector(".swiper-config");
      if (!configElement) return;

      try {
        let config = JSON.parse(configElement.innerHTML.trim());
        new Swiper(swiperElement, config);
      } catch (e) {
        console.error('Swiper config error:', e);
      }
    });
  }
  window.addEventListener("load", initSwiper);

  // ========== CORRECT SCROLLING FOR HASH LINKS ==========
  window.addEventListener('load', function () {
    if (window.location.hash) {
      let section = document.querySelector(window.location.hash);
      if (section) {
        setTimeout(() => {
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop || 0),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  // ========== NAVMENU SCROLLSPY ==========
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  // ========== ACCOUNT PAGE TABS ==========
  function initAccountTabs() {
    const tabs = document.querySelectorAll('.sidebar-tab[data-tab], .sidebar-menu li[data-tab]');
    const contents = document.querySelectorAll('.tab-content');
    
    if (tabs.length === 0) return;
    
    console.log('🏷️ Account tabs found:', tabs.length);
    
    function switchTab(tabId) {
      tabs.forEach(tab => tab.classList.remove('active'));
      contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      
      let selectedTab = document.querySelector(`.sidebar-tab[data-tab="${tabId}"]`);
      if (!selectedTab) {
        selectedTab = document.querySelector(`.sidebar-menu li[data-tab="${tabId}"]`);
      }
      if (selectedTab) selectedTab.classList.add('active');
      
      let contentToShow = document.getElementById(tabId + '-tab');
      if (!contentToShow) contentToShow = document.getElementById(tabId);
      if (contentToShow) {
        contentToShow.classList.add('active');
        contentToShow.style.display = 'block';
      }
      
      try {
        const url = new URL(window.location);
        url.searchParams.set('tab', tabId);
        history.replaceState({ tab: tabId }, '', url);
      } catch(e) {}
    }
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const tabId = this.getAttribute('data-tab');
        if (tabId && !this.classList.contains('logout')) {
          switchTab(tabId);
        }
      });
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    let urlTab = urlParams.get('tab');
    if (urlTab && ['wishlist', 'carts', 'profile'].includes(urlTab)) {
      switchTab(urlTab);
    } else {
      const activeTab = document.querySelector('.sidebar-tab.active, .sidebar-menu li.active');
      if (activeTab && activeTab.getAttribute('data-tab')) {
        switchTab(activeTab.getAttribute('data-tab'));
      } else {
        if (document.getElementById('wishlist-tab')) switchTab('wishlist');
      }
    }
  }

  // ========== ACCOUNT AJAX FUNCTIONS ==========
  function initAccountAjax() {
    // ========== ACCOUNT SƏHİFƏSİNİ YOXLA ==========
    const isAccountPage = window.location.pathname.includes('/account/') || 
                          window.location.pathname.includes('/users/account/') ||
                          document.querySelector('.account-sidebar') !== null;
    
    if (isAccountPage) {
      console.log('✅ initAccountAjax: Account page detected - ACTIVATING full AJAX support');
    } else {
      console.log('initAccountAjax: Non-account page, limited AJAX only');
      return;
    }
    
    // ========== CSS ANİMASİYALARI ==========
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes notificationSlideOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    // ========== CSRF TOKEN ==========
    function getCSRFToken() {
      const token = document.querySelector('[name=csrfmiddlewaretoken]');
      if (token) return token.value;
      const metaToken = document.querySelector('meta[name="csrf-token"]');
      if (metaToken) return metaToken.getAttribute('content');
      const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
      return cookie ? cookie.split('=')[1] : '';
    }

    // ========== BİLDİRİŞ SİSTEMİ ==========
    let notificationTimeout = null;
    function showNotification(message, type = 'success') {
      const old = document.querySelector('.custom-notification');
      if (old) old.remove();
      
      if (notificationTimeout) clearTimeout(notificationTimeout);
      
      const notif = document.createElement('div');
      notif.className = `custom-notification notification-${type}`;
      notif.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 14px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        border-radius: 12px;
        z-index: 1000000;
        font-size: 14px;
        font-weight: 500;
        font-family: system-ui, sans-serif;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        animation: slideInUp 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      `;
      notif.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i><span>${message}</span>`;
      document.body.appendChild(notif);
      
      notificationTimeout = setTimeout(() => {
        if (notif && notif.remove) {
          notif.style.animation = 'notificationSlideOut 0.3s ease';
          setTimeout(() => notif.remove(), 300);
        }
      }, 3000);
    }

    // ========== AJAX SORĞUSU ==========
    async function sendAjaxRequest(action, data = {}) {
      const formData = new FormData();
      const csrfToken = getCSRFToken();
      
      if (csrfToken) {
        formData.append('csrfmiddlewaretoken', csrfToken);
      }
      
      formData.append(action, 'true');
      
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      
      try {
        const response = await fetch(window.location.href, {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        const result = await response.json();
        console.log(`📦 ${action} response:`, result);
        return result;
      } catch (error) {
        console.error(`❌ ${action} error:`, error);
        return { status: 'error', message: 'Network error!' };
      }
    }

    // ========== BADGE VƏ CART TOTAL YENİLƏ ==========
    function updateSidebarBadges(cartCount, wishlistCount) {
      if (cartCount !== undefined) {
        const cartBadges = document.querySelectorAll('.sidebar-tab[data-tab="carts"] .menu-badge, .sidebar-menu li[data-tab="carts"] .menu-badge, .cart-count');
        cartBadges.forEach(badge => {
          badge.textContent = cartCount;
          badge.style.display = cartCount === 0 ? 'none' : 'inline-block';
        });
      }
      
      if (wishlistCount !== undefined) {
        const wishlistBadges = document.querySelectorAll('.sidebar-tab[data-tab="wishlist"] .menu-badge, .sidebar-menu li[data-tab="wishlist"] .menu-badge, .wishlist-count');
        wishlistBadges.forEach(badge => {
          badge.textContent = wishlistCount;
          badge.style.display = wishlistCount === 0 ? 'none' : 'inline-block';
        });
      }
    }

    function updateCartTotal() {
      let total = 0;
      const rows = document.querySelectorAll('#cart-table-body tr');
      
      rows.forEach(row => {
        if (row.style.display !== 'none' && !row.querySelector('.empty-state')) {
          const totalPriceEl = row.querySelector('.total-price');
          if (totalPriceEl) {
            const priceText = totalPriceEl.textContent.replace(/[^0-9.-]/g, '');
            total += parseFloat(priceText) || 0;
          }
        }
      });
      
      const cartSubtotal = document.getElementById('cart-subtotal');
      if (cartSubtotal) cartSubtotal.textContent = `Total: $${total.toFixed(2)}`;
      
      const tfootTotal = document.querySelector('.cart-table tfoot td strong');
      if (tfootTotal) tfootTotal.textContent = `Total: $${total.toFixed(2)}`;
      
      return total;
    }

    // ========== BÜTÜN AD ELEMENTLƏRİNİ YENİLƏ ==========
    function updateAllNameElements(firstName, lastName) {
      console.log('🔄 updateAllNameElements called with:', { firstName, lastName });
      
      const fullName = `${firstName} ${lastName}`.trim();
      
      const selectors = [
        '.sidebar-user-name', '.sidebar-menu .user-name', '.account-sidebar .user-name',
        '.profile-sidebar .user-name', '.sidebar .user-name', '.profile-name',
        '.account-name', '.user-name', '.full-name', '.profile-fullname',
        '.user-fullname', '.display-name', '.welcome-text', '.greeting',
        '.user-greeting', '.navbar-user-name', '.header-user-name', '.nav-user-name',
        '.topbar-user-name', '#user-name', '#profile-name', '#sidebar-user-name',
        '#account-user-name', '#display-name', '[data-user-name]', '[data-profile-name]',
        'span.user-name', 'div.user-name', 'strong.user-name', '.account-username',
        '.dashboard-user-name', '.profile-header-name', '.card-title.user-name'
      ];
      
      let updatedCount = 0;
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && el.textContent !== fullName && fullName) {
            el.textContent = fullName;
            updatedCount++;
          }
        });
      });
      
      console.log(`✅ Updated ${updatedCount} name elements to "${fullName}"`);
    }

    // ========== PROFİL YENİLƏMƏ ==========
    window.updateProfileInfoAJAX = async function(submitBtn, event) {
      if (event && event.preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      console.log('🟢 updateProfileInfoAJAX: STARTING - Page will NOT reload');
      
      const firstNameInput = document.querySelector('#first_name, [name="first_name"], #id_first_name');
      const lastNameInput = document.querySelector('#last_name, [name="last_name"], #id_last_name');
      const phoneInput = document.querySelector('#phone, [name="phone"], #id_phone');
      
      const firstName = firstNameInput?.value || '';
      const lastName = lastNameInput?.value || '';
      const phone = phoneInput?.value || '';
      const birthdate = document.querySelector('#birthdate, [name="birthdate"], #id_birthdate, input[type="date"]')?.value || '';
      
      let gender = '';
      const genderRadio = document.querySelector('input[name="gender"]:checked');
      if (genderRadio) {
        gender = genderRadio.value;
      } else {
        gender = document.querySelector('#gender, [name="gender"], select[name="gender"]')?.value || '';
      }
      
      const receiveOffers = document.querySelector('#receive_offers, [name="receive_offers"]')?.checked || false;
      const subscribeNewsletter = document.querySelector('#subscribe_newsletter, [name="subscribe_newsletter"]')?.checked || false;
      
      console.log('📤 Sending profile data:', { firstName, lastName, phone, birthdate, gender });
      
      const btn = submitBtn || event?.target?.closest('button[type="submit"]');
      const originalHtml = btn?.innerHTML || 'Update';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yenilənir...';
      }
      
      const result = await sendAjaxRequest('update_profile', {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        birthdate: birthdate,
        gender: gender,
        receive_offers: receiveOffers ? 'on' : '',
        subscribe_newsletter: subscribeNewsletter ? 'on' : ''
      });
      
      console.log('📥 Server response:', JSON.stringify(result, null, 2));
      
      if (result.status === 'success') {
        let newFirstName = firstName;
        let newLastName = lastName;
        let newPhone = phone;
        
        if (result.user && result.user.first_name) {
          newFirstName = result.user.first_name;
          newLastName = result.user.last_name || '';
        } else if (result.data && result.data.user) {
          newFirstName = result.data.user.first_name || '';
          newLastName = result.data.user.last_name || '';
        } else if (result.profile && result.profile.first_name) {
          newFirstName = result.profile.first_name;
          newLastName = result.profile.last_name || '';
        } else if (result.first_name) {
          newFirstName = result.first_name;
          newLastName = result.last_name || '';
        }
        
        if (result.profile?.phone) newPhone = result.profile.phone;
        else if (result.phone) newPhone = result.phone;
        else if (result.data?.profile?.phone) newPhone = result.data.profile.phone;
        else if (result.user?.phone) newPhone = result.user.phone;
        
        console.log('📝 Extracted data:', { newFirstName, newLastName, newPhone });
        
        if (firstNameInput && firstNameInput.value !== newFirstName) {
          firstNameInput.value = newFirstName;
        }
        if (lastNameInput && lastNameInput.value !== newLastName) {
          lastNameInput.value = newLastName;
        }
        if (phoneInput && phoneInput.value !== newPhone && newPhone) {
          phoneInput.value = newPhone;
          console.log('✅ Phone input updated to:', newPhone);
        }
        
        if (newPhone) {
          const phoneDisplaySelectors = [
            '.user-phone', '.profile-phone', '.phone-number', 
            '.contact-phone', '.sidebar-phone', '#user-phone'
          ];
          phoneDisplaySelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
              if (el && el.textContent !== newPhone) {
                el.textContent = newPhone;
              }
            });
          });
        }
        
        if (newFirstName || newLastName) {
          updateAllNameElements(newFirstName, newLastName);
        }
        
        let birthdateValue = '';
        if (result.profile?.birthdate) birthdateValue = result.profile.birthdate;
        else if (result.birthdate) birthdateValue = result.birthdate;
        else if (result.data?.profile?.birthdate) birthdateValue = result.data.profile.birthdate;
        
        if (birthdateValue) {
          document.querySelectorAll('#birthdate, [name="birthdate"], #id_birthdate, input[type="date"]').forEach(el => {
            if (el) el.value = birthdateValue;
          });
        }
        
        let genderValue = '';
        if (result.profile?.gender) genderValue = result.profile.gender;
        else if (result.gender) genderValue = result.gender;
        else if (result.data?.profile?.gender) genderValue = result.data.profile.gender;
        
        if (genderValue) {
          document.querySelectorAll(`input[name="gender"][value="${genderValue}"]`).forEach(el => {
            if (el) el.checked = true;
          });
        }
        
        if (result.profile) {
          const offersCheckbox = document.querySelector('#receive_offers, [name="receive_offers"]');
          if (offersCheckbox && result.profile.receive_offers !== undefined) {
            offersCheckbox.checked = result.profile.receive_offers === true;
          }
          
          const newsletterCheckbox = document.querySelector('#subscribe_newsletter, [name="subscribe_newsletter"]');
          if (newsletterCheckbox && result.profile.subscribe_newsletter !== undefined) {
            newsletterCheckbox.checked = result.profile.subscribe_newsletter === true;
          }
        }
        
        try {
          localStorage.setItem('user_first_name', newFirstName);
          localStorage.setItem('user_last_name', newLastName);
          localStorage.setItem('user_phone', newPhone);
        } catch(e) {}
        
        showNotification(result.message || '✅ Profil məlumatları yeniləndi!', 'success');
        console.log('✅✅✅ PROFILE UPDATED WITHOUT PAGE REFRESH!');
        
      } else {
        console.error('❌ Server error:', result);
        showNotification(result.message || '❌ Xəta baş verdi!', 'error');
      }
      
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    };

    // ========== PROFİL FORMU ==========
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      console.log('✅ Profile form found - attaching AJAX handler');
      
      const newProfileForm = profileForm.cloneNode(true);
      profileForm.parentNode?.replaceChild(newProfileForm, profileForm);
      
      newProfileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('📝 Profile form submitted - PREVENTING page reload');
        const submitBtn = this.querySelector('button[type="submit"], .update-profile-btn, #update-profile-btn');
        await window.updateProfileInfoAJAX(submitBtn, e);
      });
      console.log('✅ Profile form handler attached');
    } else {
      console.warn('⚠️ Profile form not found! Make sure form has id="profile-form"');
    }
    
    // ========== PROFİL BUTTONLARI ==========
    const profileBtns = document.querySelectorAll('#update-profile-btn, .update-profile-btn, .btn-save-profile, .save-profile-btn, [data-action="update-profile"]');
    profileBtns.forEach(btn => {
      if (!btn.dataset._ajaxAttached) {
        btn.dataset._ajaxAttached = 'true';
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await window.updateProfileInfoAJAX(newBtn, e);
        });
        console.log('✅ Profile button attached');
      }
    });

    // ========== PROFİL ŞƏKİL YÜKLƏ ==========
    const fileInput = document.getElementById('profile_image_input');
    if (fileInput) {
      const newFileInput = fileInput.cloneNode(true);
      fileInput.parentNode?.replaceChild(newFileInput, fileInput);
      
      newFileInput.addEventListener('change', async function(e) {
        const file = this.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          showNotification('Zəhmət olmasa şəkil faylı seçin', 'error');
          this.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          showNotification('Fayl ölçüsü 5MB-dan kiçik olmalıdır', 'error');
          this.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
          const mainPreview = document.getElementById('profile-image-preview');
          const sidebarImage = document.getElementById('sidebar-profile-image');
          if (mainPreview) mainPreview.src = e.target.result;
          if (sidebarImage) sidebarImage.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('profile_image', file);
        formData.append('update_profile_image', '1');
        formData.append('csrfmiddlewaretoken', getCSRFToken());

        try {
          const response = await fetch(window.location.href, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
          });
          const data = await response.json();
          if (data.status === 'success') {
            showNotification(data.message, 'success');
            if (data.image_url) {
              const newUrl = data.image_url + '?t=' + Date.now();
              const mainPreview = document.getElementById('profile-image-preview');
              const sidebarImage = document.getElementById('sidebar-profile-image');
              if (mainPreview) mainPreview.src = newUrl;
              if (sidebarImage) sidebarImage.src = newUrl;
            }
          } else {
            showNotification(data.message || 'Xəta baş verdi', 'error');
          }
        } catch (err) {
          console.error(err);
          showNotification('Server xətası!', 'error');
        }
      });
    }

    // ========== PROFİL ŞƏKİL SİL - ALERT SİLİNDİ ==========
    window.confirmDeleteImage = async function() {
      // ALERT SİLİNDİ - birbaşa silir
      const result = await sendAjaxRequest('delete_profile_image', {});
      
      if (result.status === 'success') {
        showNotification(result.message, 'success');
        const defaultImg = '/static/images/default-avatar.png';
        const mainPreview = document.getElementById('profile-image-preview');
        const sidebarImage = document.getElementById('sidebar-profile-image');
        if (mainPreview) mainPreview.src = defaultImg;
        if (sidebarImage) sidebarImage.src = defaultImg;
      } else {
        showNotification(result.message || 'Xəta baş verdi', 'error');
      }
    };

    // ========== LocalStorage-dan məlumatları yüklə ==========
    try {
      const savedFirstName = localStorage.getItem('user_first_name');
      const savedLastName = localStorage.getItem('user_last_name');
      const savedPhone = localStorage.getItem('user_phone');
      if (savedFirstName || savedLastName) {
        setTimeout(() => {
          updateAllNameElements(savedFirstName || '', savedLastName || '');
        }, 500);
      }
      if (savedPhone) {
        setTimeout(() => {
          const phoneInput = document.querySelector('#phone, [name="phone"], #id_phone');
          if (phoneInput && !phoneInput.value) phoneInput.value = savedPhone;
        }, 500);
      }
    } catch(e) {}

    // ========== SƏBƏT VƏ WİSHİST FUNKSİYALARI - ALERTLAR SİLİNDİ ==========
    
    // CART-dən silmə - ALERT SİLİNDİ
    window.removeFromCart = async function(productId, element, skipConfirm = false) {
      const row = element?.closest('tr');
      const originalHtml = element?.innerHTML;
      if (element) {
        element.disabled = true;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      }
      
      const result = await sendAjaxRequest('remove_from_cart', { product_id: productId });
      
      if (result.status === 'success') {
        if (row) {
          row.style.transition = 'opacity 0.3s';
          row.style.opacity = '0';
          setTimeout(() => {
            row.remove();
            updateSidebarBadges(result.cart_count, result.wishlist_count);
            updateCartTotal();
            const tbody = document.getElementById('cart-table-body');
            if (tbody && tbody.children.length === 0) {
              const emptyState = document.querySelector('#carts-tab .empty-state');
              if (emptyState) emptyState.style.display = 'block';
            }
            showNotification('✅ Məhsul səbətdən silindi!', 'success');
          }, 200);
        }
      } else {
        showNotification(result.message || '❌ Xəta baş verdi!', 'error');
        if (element) {
          element.disabled = false;
          element.innerHTML = originalHtml;
        }
      }
    };

    // Wishlist-dən silmə - ALERT SİLİNDİ
    window.removeFromWishlist = async function(productId, element) {
      const row = element?.closest('tr');
      const originalHtml = element?.innerHTML;
      if (element) {
        element.disabled = true;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      }
      
      const result = await sendAjaxRequest('remove_from_wishlist', { product_id: productId });
      
      if (result.status === 'success') {
        if (row) {
          row.style.transition = 'opacity 0.3s';
          row.style.opacity = '0';
          setTimeout(() => {
            row.remove();
            updateSidebarBadges(result.cart_count, result.wishlist_count);
            const tbody = document.getElementById('wishlist-table-body');
            if (tbody && tbody.children.length === 0) {
              const emptyState = document.querySelector('#wishlist-tab .empty-state');
              if (emptyState) emptyState.style.display = 'block';
            }
            showNotification('🗑️ Wishlist-dən silindi!', 'success');
          }, 200);
        }
      } else {
        showNotification(result.message || '❌ Xəta baş verdi!', 'error');
        if (element) {
          element.disabled = false;
          element.innerHTML = originalHtml;
        }
      }
    };

    window.updateQuantity = async function(btn, change, productId) {
      console.log('🟢 updateQuantity called:', { productId, change });
      
      const row = btn?.closest('tr');
      if (!row) return;
      
      const qtySpan = row.querySelector('.qty-value, .quantity-value');
      if (!qtySpan) return;
      
      let currentQty = parseInt(qtySpan.textContent) || 1;
      let newQty = currentQty + change;
      
      if (newQty <= 0) {
        await window.removeFromCart(productId, btn, true);
        return;
      }
      
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      const result = await sendAjaxRequest('update_cart_quantity', {
        product_id: productId,
        quantity: newQty
      });
      
      if (result.status === 'success') {
        qtySpan.textContent = newQty;
        
        const priceSpan = row.querySelector('.price, .unit-price');
        const totalSpan = row.querySelector('.total-price, .item-total');
        
        if (priceSpan && totalSpan) {
          let price = parseFloat(priceSpan.textContent.replace(/[^0-9.-]/g, ''));
          if (isNaN(price)) price = 0;
          totalSpan.textContent = `$${(price * newQty).toFixed(2)}`;
        }
        
        updateCartTotal();
        updateSidebarBadges(result.cart_count, result.wishlist_count);
        showNotification(`📦 Miqdar: ${newQty}`, 'success');
      } else {
        showNotification(result.message || '❌ Xəta baş verdi!', 'error');
        qtySpan.textContent = currentQty;
      }
      
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    };

    window.addToCart = async function(productId, element) {
      const btn = element;
      const originalHtml = btn?.innerHTML;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      }
      
      const result = await sendAjaxRequest('add_to_cart', { product_id: productId });
      
      if (result.status === 'success') {
        const row = btn?.closest('tr');
        if (row && row.closest('#wishlist-table-body')) {
          row.style.transition = 'opacity 0.3s';
          row.style.opacity = '0';
          setTimeout(() => {
            row.remove();
            updateSidebarBadges(result.cart_count, result.wishlist_count);
            const tbody = document.getElementById('wishlist-table-body');
            if (tbody && tbody.children.length === 0) {
              const emptyState = document.querySelector('#wishlist-tab .empty-state');
              if (emptyState) emptyState.style.display = 'block';
            }
          }, 200);
        }
        updateSidebarBadges(result.cart_count, result.wishlist_count);
        showNotification('✅ Səbətə əlavə edildi!', 'success');
      } else {
        showNotification(result.message || '❌ Xəta baş verdi!', 'error');
      }
      
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    };

    setTimeout(() => {
      if (typeof window.updateCartTotal === 'function') window.updateCartTotal();
    }, 200);
  }

  // ========== SEARCH TOGGLE ==========
  const toggle = document.getElementById("searchToggle");
  const box = document.getElementById("searchBox");

  if (toggle && box) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      box.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrapper")) {
        box.classList.remove("active");
      }
    });
  }

  // ========== LANGUAGE TOGGLE ==========
  const langToggle = document.getElementById('langToggle');
  const langMenu = document.getElementById('langMenu');

  if (langToggle && langMenu) {
    langToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      langMenu.classList.toggle('show');
    });

    document.addEventListener('click', function (e) {
      if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.remove('show');
      }
    });
  }

  // ========== PRODUCT SWIPER ==========
  if (typeof Swiper !== 'undefined') {
    const swiperElement = document.querySelector('.swiper:not(.init-swiper)');
    if (swiperElement) {
      try {
        new Swiper('.swiper:not(.init-swiper)', {
          loop: true,
          speed: 600,
          slidesPerView: 'auto',
          spaceBetween: 20,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 10 },
            768: { slidesPerView: 2, spaceBetween: 15 },
            1024: { slidesPerView: 'auto', spaceBetween: 20 },
          },
        });
      } catch (e) {
        console.error('Swiper init error:', e);
      }
    }
  }

  // ========== ANİMASİYALI TƏK LIGHTBOX SİSTEMİ ==========
  function createAnimatedLightbox() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes lightboxFadeIn { 0% { opacity: 0; backdrop-filter: blur(0px); } 100% { opacity: 1; backdrop-filter: blur(5px); } }
      @keyframes lightboxFadeOut { 0% { opacity: 1; backdrop-filter: blur(5px); } 100% { opacity: 0; backdrop-filter: blur(0px); } }
      @keyframes imageZoomIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes imageZoomOut { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.7); opacity: 0; } }
    `;
    document.head.appendChild(style);

    const lightboxHTML = `
      <div id="unifiedLightbox" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000000;display:none;justify-content:center;align-items:center;">
        <div id="lightboxContent" style="position:relative;max-width:90%;max-height:90%;">
          <img id="lightboxImage" src="" style="max-width:100%;max-height:90vh;object-fit:contain;border-radius:8px;">
          <button id="closeLightboxBtn" style="position:absolute;top:-45px;right:-45px;width:40px;height:40px;background:rgba(0,0,0,0.5);border:none;border-radius:50%;color:white;font-size:30px;cursor:pointer;">×</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    const lightbox = document.getElementById('unifiedLightbox');
    const closeBtn = document.getElementById('closeLightboxBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => window.closeLightbox());
    }

    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) window.closeLightbox();
      });
    }

    window.openLightbox = function(imageSrc) {
      const img = document.getElementById('lightboxImage');
      const lightbox = document.getElementById('unifiedLightbox');
      if (!img || !lightbox) return;
      img.src = imageSrc;
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function() {
      const lightbox = document.getElementById('unifiedLightbox');
      if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    };
  }

  function setupLightboxHandlers() {
    document.querySelectorAll('.product-img, .product-image img, .portfolio-item img, .card img').forEach(img => {
      if (!img.closest('.glightbox') && !img.closest('.view-btn')) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) {
          e.preventDefault();
          if (typeof window.openLightbox === 'function') window.openLightbox(this.src);
        });
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && typeof window.closeLightbox === 'function') {
      window.closeLightbox();
    }
  });

  createAnimatedLightbox();
  setupLightboxHandlers();

  // ========== İNİT ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAccountTabs();
      initAccountAjax();
    });
  } else {
    initAccountTabs();
    initAccountAjax();
  }

})();

console.log('✅ main.js tam yükləndi - TAM AJAX DƏSTƏYİ (Səhifə yenilənmir) - BÜTÜN ALERTLAR SİLİNDİ');




// Testimonial məlumatları
const tmsData = [
    {
        text: "Maecen aliquam, risus at semper. Proin iaculis purus consequat sem cure dignissim.",
        name: "Saul Goodman",
        title: "Ceo & Founder"
    },
    {
        text: "Ən yaxşı xidmət! Donec porttitora entum suscipit rhoncus. Çox tövsiyə edirəm.",
        name: "Kim Wexler",
        title: "Lead Attorney"
    },
    {
        text: "Accusantium quam, ultricies eget id, aliquam eget nibh et. Mükəmməl komanda!",
        name: "Mike Ehrmantraut",
        title: "Security Consultant"
    },
    {
        text: "Bu şirkətlə işləmək böyük zövq idi. Nəticələr gözləntilərimdən də yaxşı oldu.",
        name: "Jesse Pinkman",
        title: "Product Manager"
    }
];

// HTML strukturunu yaradan funksiya
function renderTestimonial(container) {
    // HTML strukturunu yarat
    container.innerHTML = `
        <div class="tms-container">
            <div class="tms-header">
                <h2 class="tms-title">Testimonials</h2>
                <p class="tms-description">
                    Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus. 
                    Accusantium quam, ultricies eget id, aliquam eget nibh et.
                </p>
            </div>
            
            <div class="tms-divider"></div>
            
            <div class="tms-wrapper">
                <div class="tms-card" id="tmsCard">
                    <div class="tms-quote">“</div>
                    <p class="tms-review-text" id="tmsReviewText"></p>
                    <h4 class="tms-customer-name" id="tmsCustomerName"></h4>
                    <p class="tms-customer-title" id="tmsCustomerTitle"></p>
                </div>
                
                <div class="tms-dots" id="tmsDots"></div>
            </div>
        </div>
    `;
    
    // Elementləri seç
    const reviewTextEl = document.getElementById('tmsReviewText');
    const customerNameEl = document.getElementById('tmsCustomerName');
    const customerTitleEl = document.getElementById('tmsCustomerTitle');
    const dotsContainer = document.getElementById('tmsDots');
    const card = document.getElementById('tmsCard');
    
    let currentIndex = 0;
    let isAnimating = false;
    let autoSlideInterval;
    
    // Nöqtələri yarat
    function createDots() {
        dotsContainer.innerHTML = '';
        tmsData.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'tms-dot';
            if (index === currentIndex) dot.classList.add('tms-dot-active');
            dot.setAttribute('data-index', index);
            dot.addEventListener('click', () => {
                if (index !== currentIndex) {
                    changeTestimonialWithAnimation(index);
                    resetAutoSlide();
                }
            });
            dotsContainer.appendChild(dot);
        });
    }
    
    // Aktiv nöqtəni yenilə
    function updateActiveDot() {
        const dots = document.querySelectorAll('.tms-dot');
        dots.forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add('tms-dot-active');
            } else {
                dot.classList.remove('tms-dot-active');
            }
        });
    }
    
    // Animasiya ilə rəyi dəyiş
    function changeTestimonialWithAnimation(newIndex) {
        if (isAnimating) return;
        if (newIndex === currentIndex) return;
        
        isAnimating = true;
        card.classList.add('tms-card-exit');
        
        setTimeout(() => {
            currentIndex = newIndex;
            reviewTextEl.textContent = tmsData[currentIndex].text;
            customerNameEl.textContent = tmsData[currentIndex].name;
            customerTitleEl.textContent = tmsData[currentIndex].title;
            
            updateActiveDot();
            
            card.classList.remove('tms-card-exit');
            card.classList.add('tms-card-enter');
            
            setTimeout(() => {
                card.classList.remove('tms-card-enter');
                isAnimating = false;
            }, 400);
        }, 250);
    }
    
    // Avtomatik slider
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % tmsData.length;
            changeTestimonialWithAnimation(nextIndex);
        }, 5000);
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    // İlk məlumatları göstər
    function init() {
        createDots();
        reviewTextEl.textContent = tmsData[0].text;
        customerNameEl.textContent = tmsData[0].name;
        customerTitleEl.textContent = tmsData[0].title;
        startAutoSlide();
    }
    
    init();
}

// Səhifə yükləndikdə komponenti yerləşdir
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('testimonial-root');
    if (root) {
        renderTestimonial(root);
    }
});










