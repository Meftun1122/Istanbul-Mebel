/**
 * iPortfolio Template - TAM DÜZƏLDİLMİŞ VERSİYA (VALYUTA FİKSİ + LIGHTBOX)
 * 
 * XÜSUSİYYƏTLƏR:
 * 1. BÜTÜN şəkillərə klik etdikdə lightbox açılır
 * 2. Səbətdə miqdar artırıb azaltdıqda ümumi məbləğ DÜZGÜN hesablanır
 * 3. Bütün TL (₺) dəyərləri avtomatik olaraq Manat (₼) ilə əvəz olunur
 * 4. NAVBAR fixed offset düzəldilib
 * 5. AJAX ilə səbət və wishlist əməliyyatları (Profil hissəsi SİLİNDİ)
 */

(function() {
  "use strict";

  // ============================================================
  // FIX: Navbar fixed olduğu üçün scroll offset
  // ============================================================
  function getHeaderOffset() {
    if (window.innerWidth <= 1199) {
      return 60;
    }
    return 300;
  }

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
    navmenu.addEventListener('click', function(e) {
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
        handler: function() {
          let progress = item.querySelectorAll('.progress .progress-bar');
          progress.forEach(el => {
            el.style.width = el.getAttribute('aria-valuenow') + '%';
          });
        }
      });
    });
  }

  // ========== ISOTOPE LAYOUT ==========
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    if (typeof imagesLoaded === 'undefined' || typeof Isotope === 'undefined') return;

    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
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

    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let configElement = swiperElement.querySelector(".swiper-config");
      if (!configElement) return;

      try {
        let config = JSON.parse(configElement.innerHTML.trim());
        new Swiper(swiperElement, config);
      } catch(e) {
        console.error('Swiper config error:', e);
      }
    });
  }
  window.addEventListener("load", initSwiper);

  // ========== FIXED: CORRECT SCROLLING FOR HASH LINKS ==========
  window.addEventListener('load', function() {
    if (window.location.hash) {
      let section = document.querySelector(window.location.hash);
      if (section) {
        setTimeout(() => {
          let offset = getHeaderOffset();
          window.scrollTo({
            top: section.offsetTop - offset,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  // ========== FIXED: NAVMENU SCROLLSPY with offset ==========
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    let offset = getHeaderOffset();
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + offset;
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
    const isAccountPage = window.location.pathname.includes('/account/') || 
                          window.location.pathname.includes('/users/account/') ||
                          document.querySelector('.account-sidebar') !== null;
    
    if (!isAccountPage) return;
    
    // CSS Animations
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
        .price, .total-price, .cart-subtotal, #cart-subtotal {
          transition: all 0.2s ease;
        }
      `;
      document.head.appendChild(style);
    }
    
    function getCSRFToken() {
      const token = document.querySelector('[name=csrfmiddlewaretoken]');
      if (token) return token.value;
      const metaToken = document.querySelector('meta[name="csrf-token"]');
      if (metaToken) return metaToken.getAttribute('content');
      const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
      return cookie ? cookie.split('=')[1] : '';
    }

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

    async function sendAjaxRequest(action, data = {}) {
      const formData = new FormData();
      const csrfToken = getCSRFToken();
      if (csrfToken) formData.append('csrfmiddlewaretoken', csrfToken);
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
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const result = await response.json();
        return result;
      } catch(error) {
        console.error(`❌ ${action} error:`, error);
        return { status: 'error', message: 'Network error!' };
      }
    }

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

    // ========== KRİTİK: QİYMƏT TƏMİZLƏMƏ FUNKSİYASI - TL-ni MANAT-a ÇEVİRİR ==========
    function cleanPrice(priceText) {
      if (!priceText) return 0;
      if (typeof priceText === 'number') return priceText;
      
      let cleaned = priceText.toString();
      
      // BÜTÜN valyuta simvollarını təmizlə: $, ₼, €, £, ₺, ₽, ¥
      cleaned = cleaned.replace(/[$₼€£₺₽¥]/g, '');
      
      // Boşluqları təmizlə
      cleaned = cleaned.replace(/\s/g, '');
      
      // Vergül və nöqtə ilə işləmə (1.234,56 və 1,234.56 formatları üçün)
      if (cleaned.includes(',') && cleaned.includes('.')) {
        // 1,234.56 formatı: vergül minlik ayırıcıdır, təmizlə
        cleaned = cleaned.replace(/,/g, '');
      } else if (cleaned.includes(',') && !cleaned.includes('.')) {
        // Yalnız vergül var
        const parts = cleaned.split(',');
        if (parts.length === 2 && parts[1].length === 2) {
          // Ondalık ayırıcı kimi vergül (1234,56 -> 1234.56)
          cleaned = parts[0] + '.' + parts[1];
        } else {
          // Minlik ayırıcı kimi vergül (1,234 -> 1234)
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      
      // Qalan qeyri-rəqəm simvolları təmizlə (nöqtə və minusdan başqa)
      cleaned = cleaned.replace(/[^0-9.-]/g, '');
      
      // Birdən çox nöqtə varsa düzəlt
      const dotParts = cleaned.split('.');
      if (dotParts.length > 2) {
        cleaned = dotParts[0] + '.' + dotParts.slice(1).join('');
      }
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }

    // ========== QİYMƏT FORMATLA - MANAT (₼) İLƏ ==========
    function formatPrice(price) {
      return `₼${price.toFixed(2)}`;
    }

    // ========== SƏBƏTDƏKİ BÜTÜN TL DƏYƏRLƏRİNİ MANATA ÇEVİR ==========
    function convertAllTLtoAZN() {
      // Bütün .price elementlərini yoxla
      document.querySelectorAll('.price, .total-price, .cart-subtotal, #cart-subtotal, .product-price, .item-price').forEach(el => {
        let text = el.textContent;
        if (text && text.includes('₺')) {
          // TL-ni Manata çevir (sadəcə simvolu dəyiş)
          let newText = text.replace(/₺/g, '₼');
          el.textContent = newText;
          console.log('💰 Valyuta çevrildi:', text, '→', newText);
        }
      });
    }

    // ========== ÜMUMİ SƏBƏT CƏMİNİ YENİLƏ ==========
    function updateCartTotal() {
      let total = 0;
      const rows = document.querySelectorAll('#cart-table-body tr.cart-item');
      
      rows.forEach(row => {
        if (row.style.display !== 'none') {
          // Əvvəlcə .total-price-dan oxu
          let totalPriceEl = row.querySelector('.total-price');
          if (totalPriceEl) {
            let price = cleanPrice(totalPriceEl.textContent);
            if (!isNaN(price) && price > 0) {
              total += price;
            } else {
              // Əgər total-price yoxdursa, unitPrice * quantity hesabla
              const priceSpan = row.querySelector('.price');
              const qtySpan = row.querySelector('.qty-value');
              if (priceSpan && qtySpan) {
                let unitPrice = cleanPrice(priceSpan.textContent);
                let qty = parseInt(qtySpan.textContent) || 1;
                if (unitPrice > 0) {
                  let rowTotal = unitPrice * qty;
                  total += rowTotal;
                  // total-price-ı yenilə
                  if (totalPriceEl) totalPriceEl.textContent = formatPrice(rowTotal);
                }
              }
            }
          }
        }
      });
      
      // Subtotal elementini yenilə
      const subtotalElement = document.querySelector('#cart-subtotal, .cart-subtotal, tfoot #cart-subtotal');
      if (subtotalElement) {
        subtotalElement.innerHTML = `<strong>Cəmi: ${formatPrice(total)}</strong>`;
      }
      
      // Başqa yerlərdəki total elementləri
      document.querySelectorAll('.cart-grand-total, .total-amount, #cart-total').forEach(el => {
        el.textContent = formatPrice(total);
      });
      
      console.log(`💰 Ümumi səbət cəmi: ${formatPrice(total)}`);
      return total;
    }

    // ========== PROFİL HİSSƏSİ TAMAMİLƏ SİLİNDİ ==========
    // updateAllNameElements, updateProfileInfoAJAX, profileForm, profileBtns, fileInput, confirmDeleteImage - SİLİNDİ

    window.removeFromCart = async function(productId, element, skipConfirm = false) {
      if (!skipConfirm && !confirm('Məhsulu səbətdən silmək istədiyinizə əminsiniz?')) return;
      
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

    window.removeFromWishlist = async function(productId, element) {
      if (!confirm('Wishlist-dən silmək istədiyinizə əminsiniz?')) return;
      
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

    // ========== KRİTİK: MİQDAR YENİLƏMƏ - DÜZGÜN HESABLAMA ==========
    window.updateQuantity = async function(btn, change, productId) {
      const row = btn?.closest('tr.cart-item');
      if (!row) {
        console.error('❌ Sətir tapılmadı!');
        showNotification('Xəta: Sətir tapılmadı!', 'error');
        return;
      }
      
      const qtySpan = row.querySelector('.qty-value');
      if (!qtySpan) {
        console.error('❌ Miqdar elementi tapılmadı!');
        showNotification('Xəta: Miqdar elementi tapılmadı!', 'error');
        return;
      }
      
      // ========== VAHİD QİYMƏTİ TAP ==========
      let unitPrice = 0;
      const priceSpan = row.querySelector('.price');
      
      if (priceSpan) {
        // Əvvəlcə data-price atributunu yoxla
        if (priceSpan.dataset.price) {
          unitPrice = cleanPrice(priceSpan.dataset.price);
        } else {
          unitPrice = cleanPrice(priceSpan.textContent);
        }
      }
      
      // Əgər unitPrice hələ tapılmayıbsa, total-price-dan geriyə hesabla
      if (unitPrice <= 0) {
        const totalSpan = row.querySelector('.total-price');
        let currentQty = parseInt(qtySpan.textContent) || 1;
        if (totalSpan && currentQty > 0) {
          const totalValue = cleanPrice(totalSpan.textContent);
          unitPrice = totalValue / currentQty;
        }
      }
      
      if (unitPrice <= 0) {
        console.error('❌ Vahid qiymət tapılmadı!');
        showNotification('Xəta: Qiymət məlumatı tapılmadı!', 'error');
        return;
      }
      
      // Vahid qiyməti row-da saxla
      row.dataset.unitPrice = unitPrice;
      
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
        // Miqdarı yenilə
        qtySpan.textContent = newQty;
        
        // 🔥 KRİTİK: Vahid qiymət * yeni miqdar
        const newTotal = unitPrice * newQty;
        
        // Cəmi yenilə
        const totalSpan = row.querySelector('.total-price');
        if (totalSpan) {
          totalSpan.textContent = formatPrice(newTotal);
        }
        
        // Ümumi səbət cəmini yenilə
        updateCartTotal();
        updateSidebarBadges(result.cart_count, result.wishlist_count);
        
        showNotification(`✅ Miqdar: ${newQty} | Cəmi: ${formatPrice(newTotal)}`, 'success');
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
          setTimeout(() => { row.remove(); }, 200);
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
    
    // Səhifə yükləndikdə TL-ni Manata çevir
    setTimeout(() => {
      convertAllTLtoAZN();
      updateCartTotal();
    }, 500);
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
      if (!e.target.closest(".search-wrapper")) box.classList.remove("active");
    });
  }

  // ========== LANGUAGE TOGGLE ==========
  const langToggle = document.getElementById('langToggle');
  const langMenu = document.getElementById('langMenu');
  if (langToggle && langMenu) {
    langToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      langMenu.classList.toggle('show');
    });
    document.addEventListener('click', function(e) {
      if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) langMenu.classList.remove('show');
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
          autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
          pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
          breakpoints: { 320: { slidesPerView: 1, spaceBetween: 10 }, 768: { slidesPerView: 2, spaceBetween: 15 }, 1024: { slidesPerView: 'auto', spaceBetween: 20 } }
        });
      } catch(e) { console.error('Swiper init error:', e); }
    }
  }

  // ============================================================
  // BÜTÜN ŞƏKİLLƏR ÜÇÜN LIGHTBOX SİSTEMİ - ŞƏFFAF ARXA PLAN + ZOOM
  // ============================================================
  (function() {
    if (document.getElementById('unifiedLightbox')) return;
    
    const lightboxStyles = document.createElement('style');
    lightboxStyles.textContent = `
      @keyframes lightboxFadeIn {
        0% { opacity: 0; backdrop-filter: blur(0px); }
        100% { opacity: 1; backdrop-filter: blur(12px); }
      }
      @keyframes lightboxFadeOut {
        0% { opacity: 1; backdrop-filter: blur(12px); }
        100% { opacity: 0; backdrop-filter: blur(0px); }
      }
      @keyframes lightboxZoomIn {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes lightboxZoomOut {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0; }
      }
      
      #unifiedLightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: none;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }
      
      #lightboxContent {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        cursor: default;
      }
      
      #lightboxImage {
        max-width: 90vw;
        max-height: 85vh;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        display: block;
      }
      
      #closeLightboxBtn {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        color: white;
        font-size: 28px;
        font-weight: 300;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      #closeLightboxBtn:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: scale(1.1) rotate(90deg);
      }
      
      @media (max-width: 768px) {
        #closeLightboxBtn {
          top: -40px;
          right: -10px;
          width: 36px;
          height: 36px;
          font-size: 24px;
        }
        #lightboxImage {
          border-radius: 8px;
        }
      }
      
      body.lightbox-open {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(lightboxStyles);

    const lightboxHTML = `
      <div id="unifiedLightbox">
        <div id="lightboxContent">
          <img id="lightboxImage" src="" alt="Böyük şəkil">
          <button id="closeLightboxBtn" title="Bağla (Esc)">✕</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    const lightbox = document.getElementById('unifiedLightbox');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxImage = document.getElementById('lightboxImage');
    const closeBtn = document.getElementById('closeLightboxBtn');
    
    let isAnimating = false;
    
    function closeLightbox() {
      if (isAnimating || !lightbox || lightbox.style.display !== 'flex') return;
      isAnimating = true;
      
      lightbox.style.animation = 'lightboxFadeOut 0.25s ease forwards';
      if (lightboxContent) lightboxContent.style.animation = 'lightboxZoomOut 0.25s ease forwards';
      
      setTimeout(() => {
        lightbox.style.display = 'none';
        lightbox.style.animation = '';
        if (lightboxContent) lightboxContent.style.animation = '';
        lightboxImage.src = '';
        document.body.classList.remove('lightbox-open');
        isAnimating = false;
      }, 250);
    }
    
    function openLightbox(imageSrc) {
      if (!imageSrc || isAnimating) return;
      if (lightbox.style.display === 'flex' && lightboxImage.src === imageSrc) return;
      
      lightboxImage.src = imageSrc;
      lightbox.style.display = 'flex';
      lightbox.style.animation = 'lightboxFadeIn 0.3s ease forwards';
      if (lightboxContent) lightboxContent.style.animation = 'lightboxZoomIn 0.35s cubic-bezier(0.34, 1.2, 0.64, 1) forwards';
      document.body.classList.add('lightbox-open');
      
      setTimeout(() => {
        lightbox.style.animation = '';
        if (lightboxContent) lightboxContent.style.animation = '';
      }, 350);
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
      });
    }
    
    if (lightbox) {
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
      });
    }
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox && lightbox.style.display === 'flex') {
        closeLightbox();
      }
    });
    
    // ===== BÜTÜN ŞƏKİLLƏRƏ KLİK EVENTİ ƏLAVƏ ET =====
    function attachClickToAllImages() {
      const allImages = document.querySelectorAll('img');
      
      allImages.forEach(img => {
        if (img.dataset.lbAttached === 'true') return;
        if (img.closest('#unifiedLightbox')) return;
        
        let src = img.src;
        if (!src || src === '') {
          src = img.getAttribute('data-src') || img.getAttribute('data-image');
        }
        
        if (src && src !== '' && !src.includes('data:image') && !src.includes('placeholder') && !src.includes('blank')) {
          img.dataset.lbAttached = 'true';
          img.style.cursor = 'pointer';
          
          const newImg = img.cloneNode(true);
          if (img.parentNode) {
            img.parentNode.replaceChild(newImg, img);
          }
          
          newImg.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            let imageSrc = this.src;
            if (!imageSrc || imageSrc === '') {
              imageSrc = this.getAttribute('data-src') || this.getAttribute('data-image') || this.href;
            }
            if (imageSrc && imageSrc !== '' && !imageSrc.includes('data:image')) {
              openLightbox(imageSrc);
            }
          });
        }
      });
    }
    
    const lightboxObserver = new MutationObserver(() => {
      attachClickToAllImages();
    });
    lightboxObserver.observe(document.body, { childList: true, subtree: true });
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachClickToAllImages);
    } else {
      attachClickToAllImages();
    }
    
    setInterval(() => {
      attachClickToAllImages();
    }, 2000);
    
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    
    console.log('✅ LIGHTBOX SİSTEMİ AKTİVDİR - BÜTÜN ŞƏKİLLƏR ÜÇÜN İŞLƏYİR!');
  })();

  // ========== TESTİMONİAL SLİDER ==========
  const tmsData = [
    { text: "Maecen aliquam, risus at semper. Proin iaculis purus consequat sem cure dignissim.", name: "Saul Goodman", title: "Ceo & Founder" },
    { text: "Ən yaxşı xidmət! Donec porttitora entum suscipit rhoncus. Çox tövsiyə edirəm.", name: "Kim Wexler", title: "Lead Attorney" },
    { text: "Accusantium quam, ultricies eget id, aliquam eget nibh et. Mükəmməl komanda!", name: "Mike Ehrmantraut", title: "Security Consultant" },
    { text: "Bu şirkətlə işləmək böyük zövq idi. Nəticələr gözləntilərimdən də yaxşı oldu.", name: "Jesse Pinkman", title: "Product Manager" }
  ];

  function renderTestimonial(container) {
    container.innerHTML = `
      <div class="tms-container">
        <div class="tms-header">
          <h2 class="tms-title">Testimonials</h2>
          <p class="tms-description">Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus. Accusantium quam, ultricies eget id, aliquam eget nibh et.</p>
        </div>
        <div class="tms-divider"></div>
        <div class="tms-wrapper">
          <div class="tms-card" id="tmsCard">
            <div class="tms-quote">"</div>
            <p class="tms-review-text" id="tmsReviewText"></p>
            <h4 class="tms-customer-name" id="tmsCustomerName"></h4>
            <p class="tms-customer-title" id="tmsCustomerTitle"></p>
          </div>
          <div class="tms-dots" id="tmsDots"></div>
        </div>
      </div>
    `;
    
    const reviewTextEl = document.getElementById('tmsReviewText');
    const customerNameEl = document.getElementById('tmsCustomerName');
    const customerTitleEl = document.getElementById('tmsCustomerTitle');
    const dotsContainer = document.getElementById('tmsDots');
    const card = document.getElementById('tmsCard');
    let currentIndex = 0;
    let isAnimating = false;
    let autoSlideInterval;
    
    function createDots() {
      dotsContainer.innerHTML = '';
      tmsData.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'tms-dot';
        if (index === currentIndex) dot.classList.add('tms-dot-active');
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', () => { if (index !== currentIndex) { changeTestimonialWithAnimation(index); resetAutoSlide(); } });
        dotsContainer.appendChild(dot);
      });
    }
    
    function updateActiveDot() {
      const dots = document.querySelectorAll('.tms-dot');
      dots.forEach((dot, i) => { if (i === currentIndex) dot.classList.add('tms-dot-active'); else dot.classList.remove('tms-dot-active'); });
    }
    
    function changeTestimonialWithAnimation(newIndex) {
      if (isAnimating || newIndex === currentIndex) return;
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
        setTimeout(() => { card.classList.remove('tms-card-enter'); isAnimating = false; }, 400);
      }, 250);
    }
    
    function startAutoSlide() { autoSlideInterval = setInterval(() => { const nextIndex = (currentIndex + 1) % tmsData.length; changeTestimonialWithAnimation(nextIndex); }, 5000); }
    function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }
    
    createDots();
    reviewTextEl.textContent = tmsData[0].text;
    customerNameEl.textContent = tmsData[0].name;
    customerTitleEl.textContent = tmsData[0].title;
    startAutoSlide();
  }

  // ========== İNİT ==========
  function init() {
    initAccountTabs();
    initAccountAjax();
    
    const testimonialRoot = document.getElementById('testimonial-root');
    if (testimonialRoot) renderTestimonial(testimonialRoot);
    
    console.log('✅ BÜTÜN SİSTEM AKTİVDİR - TL avtomatik MANAT-a çevrilir!');
    console.log('✅ Profil hissəsi SİLİNDİ - yalnız səbət və wishlist işləyir!');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

console.log('✅ main.js ');