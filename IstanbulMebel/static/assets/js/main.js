/**
* Template Name: iPortfolio
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
* 
* Təkmilləşdirilmiş versiya - ANİMASİYALI TƏK LIGHTBOX SİSTEMİ
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

})();

// ========== SEARCH TOGGLE ==========
document.addEventListener("DOMContentLoaded", () => {
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
});

// ========== LANGUAGE TOGGLE ==========
document.addEventListener("DOMContentLoaded", () => {
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
});

// ========== PRODUCT SWIPER ==========
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Swiper === 'undefined') return;

  const swiperElement = document.querySelector('.swiper:not(.init-swiper)');
  if (!swiperElement) return;

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
        dynamicBullets: false,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        1024: {
          slidesPerView: 'auto',
          spaceBetween: 20,
        },
      },
    });
  } catch (e) {
    console.error('Swiper init error:', e);
  }
});

// ========== WISHLIST BUTTONS - YALNIZ ANİMASİYA, FORM BLOKLANMIR ==========
document.addEventListener('DOMContentLoaded', function () {
  const wishlistButtons = document.querySelectorAll('.btn-wishlist');

  wishlistButtons.forEach((button) => {
    button.addEventListener('click', function (e) {
      // 🔴 e.preventDefault() SİLİNDİ - form normal submit olur
      // 🔴 e.stopPropagation() SİLİNDİ

      // Sadəcə animasiya əlavə edirik
      this.style.transform = 'scale(0.9)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);

      // Form normal submit olacaq - heç bir bloklama yox
      console.log('❤️ Wishlist button clicked - form will submit');
    });
  });

  if (wishlistButtons.length > 0) {
    console.log(`✅ ${wishlistButtons.length} wishlist buttons ready - form submission enabled`);
  }
});

// ========== ADD TO CART BUTTONS - YALNIZ ANİMASİYA, FORM BLOKLANMIR ==========
document.addEventListener('DOMContentLoaded', function () {
  const addToCartBtns = document.querySelectorAll('.btn-add-cart');

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      // 🔴 e.preventDefault() SİLİNDİ - form normal submit olur
      // 🔴 e.stopPropagation() SİLİNDİ

      // Animasiya
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);

      // "Added!" mesajı (isteğe bağlı) - form submit olacağı üçün çox qısa olacaq
      // Bu səbəbdən bu hissəni də silə bilərik və ya qısa saxlayırıq

      console.log('🛒 Add to cart clicked - form will submit');
    });
  });
});

// ========== DROPDOWN MENUS ==========
document.addEventListener('DOMContentLoaded', function () {
  const wishlistToggle = document.getElementById('wishlistToggle');
  const cartToggle = document.getElementById('cartToggle');
  const wishlistMenu = document.getElementById('wishlistMenu');
  const cartMenu = document.getElementById('cartMenu');

  if (wishlistToggle && cartToggle && wishlistMenu && cartMenu) {
    wishlistToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();

      cartMenu.classList.remove('active');
      wishlistMenu.classList.toggle('active');
    });

    cartToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();

      wishlistMenu.classList.remove('active');
      cartMenu.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.dropdown-container')) {
        wishlistMenu.classList.remove('active');
        cartMenu.classList.remove('active');
      }
    });

    wishlistMenu.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    cartMenu.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        wishlistMenu.classList.remove('active');
        cartMenu.classList.remove('active');
      }
    });
  }
});

// ========== PRICE RANGE SLIDER ==========
document.addEventListener('DOMContentLoaded', function () {
  const sliderLeft = document.getElementById('slider-left');
  const sliderRight = document.getElementById('slider-right');
  const minPrice = document.getElementById('min-price');
  const maxPrice = document.getElementById('max-price');
  const leftThumb = document.getElementById('left-thumb');
  const rightThumb = document.getElementById('right-thumb');
  const progressBar = document.getElementById('slider-progress');
  const applyBtn = document.getElementById('apply-price');
  const resetBtn = document.getElementById('reset-price');

  if (!sliderLeft || !sliderRight) return;

  const MIN_GAP = 100;
  const MAX_VALUE = 10000;

  function updatePriceRange() {
    let leftVal = parseInt(sliderLeft.value);
    let rightVal = parseInt(sliderRight.value);

    if (rightVal - leftVal < MIN_GAP) {
      rightVal = leftVal + MIN_GAP;
      sliderRight.value = rightVal;
    }

    if (minPrice) minPrice.value = leftVal;
    if (maxPrice) maxPrice.value = rightVal;

    if (leftThumb && rightThumb && progressBar) {
      const percentLeft = (leftVal / MAX_VALUE) * 100;
      const percentRight = (rightVal / MAX_VALUE) * 100;

      leftThumb.style.left = `calc(${percentLeft}% - 10px)`;
      rightThumb.style.left = `calc(${percentRight}% - 10px)`;
      progressBar.style.left = `${percentLeft}%`;
      progressBar.style.width = `${percentRight - percentLeft}%`;
    }
  }

  sliderLeft.addEventListener('input', updatePriceRange);
  sliderRight.addEventListener('input', updatePriceRange);

  if (minPrice) {
    minPrice.addEventListener('input', function () {
      let val = parseInt(this.value) || 0;
      let rightVal = parseInt(sliderRight.value);
      val = Math.max(0, Math.min(rightVal - MIN_GAP, MAX_VALUE));
      this.value = val;
      sliderLeft.value = val;
      updatePriceRange();
    });
  }

  if (maxPrice) {
    maxPrice.addEventListener('input', function () {
      let val = parseInt(this.value) || MAX_VALUE;
      let leftVal = parseInt(sliderLeft.value);
      val = Math.min(MAX_VALUE, Math.max(leftVal + MIN_GAP, val));
      this.value = val;
      sliderRight.value = val;
      updatePriceRange();
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const min = sliderLeft.value;
      const max = sliderRight.value;
      const url = new URL(window.location.href);
      url.searchParams.set('min_price', min);
      url.searchParams.set('max_price', max);
      window.location.href = url.toString();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function (e) {
      e.preventDefault();
      sliderLeft.value = 0;
      sliderRight.value = MAX_VALUE;
      if (minPrice) minPrice.value = 0;
      if (maxPrice) maxPrice.value = MAX_VALUE;
      updatePriceRange();

      const url = new URL(window.location.href);
      url.searchParams.delete('min_price');
      url.searchParams.delete('max_price');
      window.location.href = url.toString();
    });
  }

  // URL-dən parametrləri oxu
  const urlParams = new URLSearchParams(window.location.search);
  const minParam = urlParams.get('min_price');
  const maxParam = urlParams.get('max_price');

  if (minParam && maxParam) {
    sliderLeft.value = Math.min(parseInt(minParam), MAX_VALUE);
    sliderRight.value = Math.max(parseInt(maxParam), 0);
    updatePriceRange();
  }
});

// ========== ANİMASİYALI TƏK LIGHTBOX SİSTEMİ ==========
(function () {
  'use strict';

  // Köhnə lightbox elementlərini sil
  document.addEventListener('DOMContentLoaded', function () {
    // Köhnə overlay-ləri sil
    const oldOverlays = ['imageOverlay', 'simpleImageOverlay', 'lightboxModal'];
    oldOverlays.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    // Yeni animasiyalı lightbox yarat
    createAnimatedLightbox();

    // Event handler-ları əlavə et
    setupLightboxHandlers();
  });

  // Animasiyalı lightbox yarat
  function createAnimatedLightbox() {
    // CSS animasiyaları əlavə et
    const style = document.createElement('style');
    style.textContent = `
            @keyframes lightboxFadeIn {
                0% { opacity: 0; backdrop-filter: blur(0px); }
                100% { opacity: 1; backdrop-filter: blur(5px); }
            }
            
            @keyframes lightboxFadeOut {
                0% { opacity: 1; backdrop-filter: blur(5px); }
                100% { opacity: 0; backdrop-filter: blur(0px); }
            }
            
            @keyframes imageZoomIn {
                0% { transform: scale(0.7); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes imageZoomOut {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.7); opacity: 0; }
            }
            
            @keyframes closeBtnRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(90deg); }
            }
            
            .lightbox-animation-in {
                animation: lightboxFadeIn 0.4s ease forwards !important;
            }
            
            .lightbox-animation-out {
                animation: lightboxFadeOut 0.3s ease forwards !important;
            }
            
            .image-animation-in {
                animation: imageZoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
            }
            
            .image-animation-out {
                animation: imageZoomOut 0.3s ease forwards !important;
            }
            
            .close-btn-animation {
                animation: closeBtnRotate 0.3s ease !important;
            }
        `;
    document.head.appendChild(style);

    const lightboxHTML = `
            <div id="unifiedLightbox" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0);
                z-index: 1000000;
                display: none;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(0px);
                opacity: 0;
                transition: none;
            ">
                <div style="
                    position: relative;
                    max-width: 90%;
                    max-height: 90%;
                    transform: scale(0.7);
                    opacity: 0;
                    transition: none;
                " id="lightboxContent">
                    <img id="lightboxImage" src="" alt="Expanded image" style="
                        max-width: 100%;
                        max-height: 90vh;
                        object-fit: contain;
                        border-radius: 8px;
                        box-shadow: 0 0 30px rgba(0,0,0,0.5);
                    ">
                    <button id="closeLightboxBtn" style="
                        position: absolute;
                        top: -45px;
                        right: -45px;
                        width: 50px;
                        height: 50px;
                        background: rgba(255,255,255,0.2);
                        border: 2px solid white;
                        border-radius: 50%;
                        color: white;
                        font-size: 30px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s;
                        outline: none;
                        z-index: 1000001;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 0 20px rgba(0,0,0,0.3);
                    ">×</button>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Elementləri tap
    const lightbox = document.getElementById('unifiedLightbox');
    const content = document.getElementById('lightboxContent');
    const closeBtn = document.getElementById('closeLightboxBtn');
    const img = document.getElementById('lightboxImage');

    if (!lightbox || !content || !closeBtn || !img) return;

    // Close button event
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Animasiya əlavə et
      this.classList.add('close-btn-animation');
      setTimeout(() => {
        this.classList.remove('close-btn-animation');
      }, 300);

      closeLightbox();
    });

    // Close button hover effektləri
    closeBtn.addEventListener('mouseenter', function () {
      this.style.background = 'rgba(255,77,77,0.4)';
      this.style.borderColor = '#ff4d4d';
      this.style.color = '#ff4d4d';
      this.style.transform = 'scale(1.1) rotate(90deg)';
    });

    closeBtn.addEventListener('mouseleave', function () {
      this.style.background = 'rgba(255,255,255,0.2)';
      this.style.borderColor = 'white';
      this.style.color = 'white';
      this.style.transform = 'scale(1) rotate(0deg)';
    });

    // Lightbox click (background)
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Lightbox-u açmaq üçün funksiya
    window.openLightbox = function (imageSrc) {
      if (!imageSrc) return;

      img.src = imageSrc;
      lightbox.style.display = 'flex';

      // Animasiya üçün class-ları sıfırla
      lightbox.classList.remove('lightbox-animation-out');
      content.classList.remove('image-animation-out');

      // Animasiya ilə göstər
      setTimeout(() => {
        lightbox.classList.add('lightbox-animation-in');
        content.classList.add('image-animation-in');
      }, 10);

      document.body.style.overflow = 'hidden';
    };

    // Lightbox-u bağlamaq üçün funksiya
    window.closeLightbox = function () {
      // Animasiya class-larını dəyiş
      lightbox.classList.remove('lightbox-animation-in');
      lightbox.classList.add('lightbox-animation-out');

      content.classList.remove('image-animation-in');
      content.classList.add('image-animation-out');

      // Animasiya bitdikdən sonra gizlət
      setTimeout(() => {
        lightbox.style.display = 'none';
        // Class-ları təmizlə
        lightbox.classList.remove('lightbox-animation-out');
        content.classList.remove('image-animation-out');

        // Şəkli təmizlə (yaddaş optimizasiyası)
        img.src = '';
      }, 300);

      document.body.style.overflow = 'auto';
    };
  }

  // Handler-ları əlavə et
  function setupLightboxHandlers() {
    // View butonları
    document.querySelectorAll('.view-btn, .quick-view, [data-lightbox]').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const card = this.closest('.product-card, .portfolio-item, .card');
        if (!card) return;

        const img = card.querySelector('img');
        if (!img) return;

        if (typeof window.openLightbox === 'function') {
          window.openLightbox(img.src);
        }
      });
    });

    // Şəkillər
    document.querySelectorAll('.product-img, .product-image img, .portfolio-item img, .card img').forEach(img => {
      // Müəyyən class-ları olanları filter et
      if (img.closest('.view-btn')) return;
      if (img.closest('.quick-view')) return;
      if (img.closest('.glightbox')) return;

      img.style.cursor = 'pointer';

      img.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (typeof window.openLightbox === 'function') {
          window.openLightbox(this.src);
        }
      });
    });
  }

  // ESC düyməsi
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const lightbox = document.getElementById('unifiedLightbox');
      if (lightbox && lightbox.style.display === 'flex' && typeof window.closeLightbox === 'function') {
        window.closeLightbox();
      }
    }
  });

})();

console.log('✅ main.js tam yükləndi - ANİMASİYALI TƏK LIGHTBOX SİSTEMİ');
console.log('🎨 Lightbox animasiyaları: Fade In + Zoom In');
console.log('✅ Wishlist və Add to Cart buttonları form submit etməyə icazə verir');



// ========== DROPDOWN SCROLL CONTROL ==========
document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ Dropdown scroll control loaded');

  const wishlistContainer = document.querySelector('#wishlistDropdown .dropdown-items-container');
  const cartContainer = document.querySelector('#cartDropdown .dropdown-items-container');

  function checkScroll(container) {
    if (container) {
      const itemCount = container.children.length;

      if (itemCount > 3) {
        container.style.maxHeight = '300px';
        container.style.overflowY = 'auto';
        console.log(`📦 ${itemCount} məhsul - scroll aktiv`);
      } else {
        container.style.maxHeight = 'none';
        container.style.overflowY = 'visible';
        console.log(`📦 ${itemCount} məhsul - scroll deaktiv`);
      }
    }
  }

  checkScroll(wishlistContainer);
  checkScroll(cartContainer);
});









// ========== CONTACT SUCCESS PAGE - COUNTDOWN TIMER ==========
document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ Contact success page loaded');

  // Elementləri tap
  const secondsElement = document.getElementById('seconds');
  const redirectInfo = document.getElementById('redirectInfo');

  // Redirect delay-i al (HTML-dən və ya default 5)
  let seconds = parseInt(secondsElement?.textContent) || 5;
  const redirectUrl = '/'; // Ana səhifə URL-i

  console.log(`⏱️ Countdown started: ${seconds} seconds`);

  // Element yoxdursa, funksiyanı dayandır
  if (!secondsElement) {
    console.error('❌ Seconds element not found!');
    return;
  }

  // Geri sayım intervalı
  const countdown = setInterval(function () {
    seconds--;
    secondsElement.textContent = seconds;

    console.log(`⏳ ${seconds} seconds remaining`);

    if (seconds <= 0) {
      clearInterval(countdown);
      console.log('🔄 Redirecting to homepage...');
      window.location.href = redirectUrl;
    }
  }, 1000);

  // Manual yönləndirməni dayandır (linkə klik edəndə)
  if (redirectInfo) {
    redirectInfo.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        console.log('🔗 Manual redirect clicked - stopping countdown');
        clearInterval(countdown);
      }
    });
  }

  // Səhifə bağlananda intervalı təmizlə
  window.addEventListener('beforeunload', function () {
    clearInterval(countdown);
  });
});

// ========== ANIMASYON DƏSTƏYİ ==========
// Əgər səhifə background tab-da açılıbsa, animasiyaları dayandır
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    console.log('👻 Page hidden - animations paused');
    // Əgər CSS-də animasiyaları dayandırmaq istəsəniz
    document.body.style.animationPlayState = 'paused';
  } else {
    console.log('👀 Page visible - animations resumed');
    document.body.style.animationPlayState = 'running';
  }
});

// ========== PERFORMANCE OPTIMIZATION ==========
// Əgər istifadəçi cihazı yavaşdırsa, animasiyaları sadələşdir
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  console.log('🐢 Reduced motion preferred - simplifying animations');
  document.documentElement.style.setProperty('--animation-duration', '0.1s');
}

// Console-da gözəl mesaj
console.log('%c✨ Mesajınız uğurla göndərildi! ✨',
  'color: #28a745; font-size: 16px; font-weight: bold; padding: 5px;');









// contactus SUCCESS
document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.querySelector('.php-email-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      // Ajax ilə göndərmək istəyirsinizsə, e.preventDefault() əlavə edin
      // console.log('Form submitted');

      // Loading animasiyasını göstər
      const loading = this.querySelector('.loading');
      if (loading) {
        loading.style.display = 'block';
      }

      // Form normal submit olur
      return true;
    });
  }
});






// ========== UNIVERSAL NAVBAR SEARCH - BÜTÜN SƏHİFƏLƏRDƏ İŞLƏYİR ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Universal navbar search loaded - Works on ALL pages');
    
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchForm = document.getElementById('searchForm');
    
    if (!searchInput || !searchButton) {
        console.warn('Search elements not found on this page');
        return;
    }
    
    // Axtarış nəticələri üçün container yarat (əgər yoxdursa)
    let resultsContainer = document.getElementById('searchResultsContainer');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResultsContainer';
        resultsContainer.className = 'search-results-container';
        resultsContainer.style.display = 'none';
        
        // Səhifənin uyğun yerinə əlavə et (hero section-dan sonra və ya content-dən əvvəl)
        const heroSection = document.querySelector('#hero, .hero, .banner, .page-header, header + *');
        if (heroSection) {
            heroSection.parentNode.insertBefore(resultsContainer, heroSection.nextSibling);
        } else {
            const mainContent = document.querySelector('main, .main-content, #content, .container:first-of-type');
            if (mainContent) {
                mainContent.parentNode.insertBefore(resultsContainer, mainContent);
            } else {
                document.body.insertBefore(resultsContainer, document.body.firstChild);
            }
        }
        console.log('Search results container created');
    }
    
    // Cari səhifənin tipini təyin et
    function getCurrentPageType() {
        const path = window.location.pathname;
        const url = window.location.href;
        
        if (path.includes('account') || path.includes('profile') || path.includes('my-account')) return 'account';
        if (path.includes('cart') || path.includes('basket')) return 'cart';
        if (path.includes('wishlist')) return 'wishlist';
        if (path.includes('checkout')) return 'checkout';
        if (path.includes('order')) return 'order';
        if (path.includes('blog') || path.includes('article')) return 'blog';
        if (path.includes('product') || path.includes('shop') || path.includes('category')) return 'product';
        if (path.includes('about')) return 'about';
        if (path.includes('contact')) return 'contact';
        
        return 'home'; // default
    }
    
    // Səhifəyə uyğun axtarılacaq elementlər
    function getSearchableItems() {
        const pageType = getCurrentPageType();
        let items = [];
        
        switch(pageType) {
            case 'account':
                // Account səhifəsində - wishlist və cart məhsulları
                items = [
                    ...document.querySelectorAll('.wishlist-table tbody tr, .cart-table tbody tr, .wishlist-item, .cart-item'),
                    ...document.querySelectorAll('.product-cell, [class*="product"]')
                ];
                break;
                
            case 'cart':
                // Cart səhifəsində - səbət məhsulları
                items = document.querySelectorAll('.cart-row, .cart-item, .cart-product');
                break;
                
            case 'wishlist':
                // Wishlist səhifəsində - wishlist məhsulları
                items = document.querySelectorAll('.wishlist-row, .wishlist-item, .wishlist-product');
                break;
                
            case 'checkout':
                // Checkout səhifəsində - sifariş məhsulları
                items = document.querySelectorAll('.order-item, .checkout-product, .cart-summary .product');
                break;
                
            case 'blog':
                // Blog səhifəsində - blog yazıları
                items = document.querySelectorAll('.blog-post, .post, .article, .blog-card');
                break;
                
            case 'product':
            case 'home':
            default:
                // Məhsul siyahısı səhifələrində və ana səhifədə
                items = [
                    ...document.querySelectorAll('.product-card, .portfolio-item, .service-item, .testimonial-item, .team-member'),
                    ...document.querySelectorAll('.card, .item, .box, [class*="product-"]'),
                    ...document.querySelectorAll('.col-lg-3, .col-md-4, .col-sm-6')
                ];
                break;
        }
        
        // Təkrarları sil və görünən elementləri qaytar
        return [...new Set(items)].filter(item => item.offsetParent !== null);
    }
    
    // Elementin mətnini al
    function getElementText(element) {
        return element.textContent || element.innerText || '';
    }
    
    // ========== GÜCLƏNDİRİLMİŞ ŞƏKİL TAPMA FUNKSİYASI ==========
    function getElementImage(element) {
        console.log('🔍 Searching for image in element:', element.className);
        
        // 1. Elementin özündə bütün img etiketlərini axtar
        const allImages = element.querySelectorAll('img');
        for (let img of allImages) {
            if (img && img.src && isValidImage(img.src)) {
                console.log('✅ Found image in element:', img.src);
                return img.src;
            }
        }
        
        // 2. Data attribute-larda şəkil axtar (genişləndirilmiş siyahı)
        const dataAttributes = [
            'data-image', 'data-src', 'data-img', 'data-original', 
            'data-lazy', 'data-srcset', 'data-zoom', 'data-large',
            'data-main-image', 'data-thumb', 'data-url', 'data-src-original',
            'data-original-src', 'data-echo', 'data-lazy-src'
        ];
        
        for (const attr of dataAttributes) {
            const value = element.getAttribute(attr);
            if (value && isValidImage(value)) {
                console.log(`✅ Found image in ${attr}:`, value);
                return value;
            }
        }
        
        // 3. Style background image axtar (müxtəlif formatlar)
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            // Müxtəlif URL formatlarını yoxla
            const patterns = [
                /url\(["']?([^"']*)["']?\)/,
                /url\(([^)]+)\)/,
                /image-set\(["']?([^"']*)["']?\)/
            ];
            
            for (const pattern of patterns) {
                const match = bgImage.match(pattern);
                if (match && match[1] && isValidImage(match[1])) {
                    console.log('✅ Found background image:', match[1]);
                    return match[1];
                }
            }
        }
        
        // 4. Bütün parent elementlərdə axtar (5 səviyyə yuxarı)
        let currentElement = element;
        for (let level = 1; level <= 5; level++) {
            currentElement = currentElement.parentElement;
            if (!currentElement) break;
            
            // Parent-də img axtar
            const parentImages = currentElement.querySelectorAll('img');
            for (let img of parentImages) {
                if (img && img.src && isValidImage(img.src)) {
                    console.log(`✅ Found image in parent level ${level}:`, img.src);
                    return img.src;
                }
            }
            
            // Parent-in data attribute-larını yoxla
            for (const attr of dataAttributes) {
                const value = currentElement.getAttribute(attr);
                if (value && isValidImage(value)) {
                    console.log(`✅ Found image in parent ${attr} at level ${level}:`, value);
                    return value;
                }
            }
            
            // Parent-in background image-ni yoxla
            const parentStyle = window.getComputedStyle(currentElement);
            const parentBg = parentStyle.backgroundImage;
            if (parentBg && parentBg !== 'none') {
                const match = parentBg.match(/url\(["']?([^"']*)["']?\)/);
                if (match && match[1] && isValidImage(match[1])) {
                    console.log(`✅ Found background image in parent level ${level}:`, match[1]);
                    return match[1];
                }
            }
        }
        
        // 5. Sibling elementlərdə axtar
        if (element.parentElement) {
            const siblings = element.parentElement.children;
            for (let sibling of siblings) {
                if (sibling === element) continue;
                
                const siblingImages = sibling.querySelectorAll('img');
                for (let img of siblingImages) {
                    if (img && img.src && isValidImage(img.src)) {
                        console.log('✅ Found image in sibling:', img.src);
                        return img.src;
                    }
                }
            }
        }
        
        // 6. Elementin ID və ya class-ından şəkil URL-i yaratmağa çalış
        const possibleIds = [
            element.id,
            element.dataset.id,
            element.dataset.productId,
            element.dataset.itemId,
            element.dataset.product,
            element.dataset.key
        ].filter(id => id && id.match(/\d+/));
        
        if (possibleIds.length > 0) {
            const productId = possibleIds[0];
            console.log('⚠️ Attempting to construct image URL from ID:', productId);
            
            // Müxtəlif URL formatlarını yoxla
            const baseUrls = [
                '/media/products/',
                '/uploads/products/',
                '/images/products/',
                '/static/images/products/',
                '/media/',
                '/uploads/',
                '/images/'
            ];
            
            for (const baseUrl of baseUrls) {
                const constructedUrl = `${baseUrl}${productId}.jpg`;
                console.log('Trying constructed URL:', constructedUrl);
                return constructedUrl; // Bu URL-i qaytar, onerror handler işləyəcək
            }
        }
        
        console.log('❌ No image found for element');
        return null;
    }
    
    // ========== ŞƏKİL URL VALİDASİYASI ==========
    function isValidImage(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Data URI-ləri yoxla
        if (url.startsWith('data:image')) {
            return true;
        }
        
        // Boş və ya etibarsız URL-ləri filtrlə
        const invalidPatterns = [
            'placeholder', 'dummy', 'blank', 'no-image', 'default',
            'randomuser', 'thumbnail', 'grey', 'gray', 'temp',
            'loading', 'spinner', 'ajax', 'base64', 'svg',
            '1x1', 'transparent', 'empty', 'null', 'undefined'
        ];
        
        const lowerUrl = url.toLowerCase();
        
        // Geçərli URL formatları
        const validProtocols = ['http://', 'https://', '/media/', '/uploads/', '/images/', '/static/'];
        const hasValidProtocol = validProtocols.some(protocol => lowerUrl.startsWith(protocol));
        
        if (!hasValidProtocol) return false;
        
        // Invalid pattern-ləri yoxla
        for (const pattern of invalidPatterns) {
            if (lowerUrl.includes(pattern)) {
                console.log('⚠️ Invalid image URL (contains ' + pattern + '):', url);
                return false;
            }
        }
        
        return true;
    }
    
    // ========== ŞƏKİL ERROR HANDLER ==========
    window.handleImageError = function(img) {
        console.log('⚠️ Image failed to load:', img.src);
        
        // Artıq cəhd edilibsə, dayan
        if (img.getAttribute('data-retry-count') > 2) {
            img.style.display = 'none';
            const wrapper = img.closest('.result-image-wrapper');
            if (wrapper) {
                const icon = wrapper.querySelector('.result-icon');
                if (icon) icon.style.display = 'flex';
            }
            return;
        }
        
        // Cəhd sayını artır
        const retryCount = parseInt(img.getAttribute('data-retry-count') || '0');
        img.setAttribute('data-retry-count', retryCount + 1);
        
        // Yedək URL variantları
        const originalSrc = img.src;
        const possibleBackups = [
            originalSrc.replace('.jpg', '.png'),
            originalSrc.replace('.png', '.jpg'),
            originalSrc.replace('.jpeg', '.jpg'),
            originalSrc.replace('.jpg', '.jpeg'),
            originalSrc.replace('/products/', '/images/'),
            originalSrc.replace('/images/', '/products/'),
            originalSrc.replace('/media/', '/static/images/'),
            originalSrc.replace('/uploads/', '/media/')
        ];
        
        // Təkrarları sil
        const uniqueBackups = [...new Set(possibleBackups)];
        
        for (const backup of uniqueBackups) {
            if (backup !== originalSrc && !img.hasAttribute('data-tried-' + backup)) {
                console.log('Trying backup URL:', backup);
                img.setAttribute('data-tried-' + backup, 'true');
                img.src = backup;
                return;
            }
        }
        
        // Heç bir yedək işləmədisə, ikon göstər
        img.style.display = 'none';
        const wrapper = img.closest('.result-image-wrapper');
        if (wrapper) {
            const icon = wrapper.querySelector('.result-icon');
            if (icon) icon.style.display = 'flex';
        }
    };
    
    // Elementin linkini tap
    function getElementLink(element) {
        // 1. Birbaşa link axtar
        const link = element.querySelector('a');
        if (link && link.href) return link.href;
        
        // 2. Element özü linkdirsə
        if (element.tagName === 'A' && element.href) return element.href;
        
        // 3. Parent link axtar
        const parentLink = element.closest('a');
        if (parentLink && parentLink.href) return parentLink.href;
        
        // 4. Data attribute-da link axtar
        const linkData = element.dataset.url || element.dataset.link || element.dataset.href;
        if (linkData) return linkData;
        
        return '#';
    }
    
    // Elementin başlığını tap
    function getElementTitle(element) {
        const titleSelectors = [
            '.card-title', 'h3', 'h4', '.title', '.product-title', '.service-title',
            '.testimonial-name', '.name', '.product-name', '.item-title', 'h2', 'h5',
            '.product-info h4', '.product-info .name', '.product-details h3',
            '.urun-adi', '.product-name', '[class*="title"]', '[class*="name"]'
        ];
        
        for (const selector of titleSelectors) {
            const titleEl = element.querySelector(selector);
            if (titleEl && titleEl.textContent.trim()) {
                return titleEl.textContent.trim();
            }
        }
        
        if (element.tagName.match(/^H[1-6]$/)) {
            return element.textContent.trim();
        }
        
        const text = getElementText(element);
        return text.substring(0, 50).trim() || 'Məhsul';
    }
    
    // Elementin qiymətini tap
    function getElementPrice(element) {
        const priceSelectors = [
            '.current-price', '.price', '.product-price', '.special-price',
            '.sale-price', '.price-value', '.item-price', '[class*="price"]',
            '.product-price .amount', '.woocommerce-Price-amount',
            '.fiyat', '.urun-fiyat', '.satis-fiyat', '.indirimli-fiyat'
        ];
        
        for (const selector of priceSelectors) {
            const priceEl = element.querySelector(selector);
            if (priceEl) {
                const priceText = priceEl.textContent.trim();
                if (priceText && priceText.match(/[\d\.,]/)) {
                    return priceText;
                }
            }
        }
        return null;
    }
    
    // Element tipini təyin et
    function getItemType(element) {
        if (element.classList.contains('product-card')) return 'Məhsul';
        if (element.classList.contains('service-item')) return 'Xidmət';
        if (element.classList.contains('testimonial-item')) return 'Rəy';
        if (element.classList.contains('portfolio-item')) return 'Portfel';
        if (element.classList.contains('blog-post')) return 'Blog';
        if (element.classList.contains('team-member')) return 'Komanda';
        if (element.classList.contains('cart-row')) return 'Səbət';
        if (element.classList.contains('wishlist-row')) return 'İstək siyahısı';
        
        if (element.closest('.products, .shop, .urunler')) return 'Məhsul';
        if (element.closest('.services, .hizmetler')) return 'Xidmət';
        if (element.closest('.blog, .yazilar')) return 'Blog';
        
        return 'Digər';
    }
    
    // Axtarış funksiyası
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!resultsContainer) return;
        
        // Axtarış termini 2 simvoldan azdırsa, nəticələri gizlət
        if (searchTerm === '' || searchTerm.length < 2) {
            resultsContainer.style.display = 'none';
            
            // Bütün bölmələri göstər (əgər gizlədilmişdisə)
            document.querySelectorAll('section, .section, [class*="section"]').forEach(el => {
                if (el.id !== 'searchResultsContainer') {
                    el.style.display = '';
                }
            });
            return;
        }
        
        console.log(`🔍 Searching for: "${searchTerm}" on ${getCurrentPageType()} page`);
        
        // Səhifəyə uyğun elementləri tap
        const items = getSearchableItems();
        console.log(`📦 Found ${items.length} searchable items`);
        
        // Bütün bölmələri gizlət
        document.querySelectorAll('section, .section, [class*="section"]').forEach(el => {
            if (el.id !== 'searchResultsContainer' && !el.classList.contains('search-container')) {
                el.style.display = 'none';
            }
        });
        
        // Nəticələri filtrlə
        const results = [];
        const processedIds = new Set();
        
        items.forEach(item => {
            const itemText = getElementText(item).toLowerCase();
            const itemTitle = getElementTitle(item).toLowerCase();
            
            if (itemText.includes(searchTerm) || itemTitle.includes(searchTerm)) {
                // Təkrarları önləmək üçün
                const itemId = item.id || item.dataset.id || Math.random().toString(36).substring(2, 9);
                if (processedIds.has(itemId)) return;
                processedIds.add(itemId);
                
                const image = getElementImage(item);
                console.log(`Item "${itemTitle}" image:`, image ? '✅' : '❌');
                
                results.push({
                    element: item,
                    title: getElementTitle(item),
                    text: getElementText(item).substring(0, 150),
                    image: image,
                    link: getElementLink(item),
                    price: getElementPrice(item),
                    type: getItemType(item)
                });
                
                // Highlight effekti
                item.style.transition = 'all 0.3s';
                item.style.boxShadow = '0 0 0 3px #124c97';
                item.style.transform = 'scale(1.02)';
                
                setTimeout(() => {
                    item.style.boxShadow = '';
                    item.style.transform = '';
                }, 500);
            }
        });
        
        console.log(`✅ Found ${results.length} results`);
        
        // Nəticələri göstər
        displayResults(results, searchTerm);
    }
    
    // Nəticələri göstər
    function displayResults(results, searchTerm) {
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>"${searchTerm}" üçün heç nə tapılmadı</h3>
                    <p>Bu səhifədə axtardığınız məlumat yoxdur</p>
                    <button class="clear-search-btn" onclick="window.clearUniversalSearch()">
                        <i class="fas fa-times"></i> Axtarışı təmizlə
                    </button>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }
        
        // Nəticələri qrupla
        const grouped = {};
        results.forEach(result => {
            if (!grouped[result.type]) {
                grouped[result.type] = [];
            }
            grouped[result.type].push(result);
        });
        
        // HTML yarat
        let html = `
            <div class="search-header">
                <h2><i class="fas fa-search"></i> "${searchTerm}" üçün nəticələr</h2>
                <span class="result-count">${results.length} tapıldı</span>
                <button class="close-results" onclick="window.clearUniversalSearch()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="results-grid">
        `;
        
        for (const [type, items] of Object.entries(grouped)) {
            html += `<div class="result-category"><h3>${type} (${items.length})</h3></div>`;
            
            items.forEach(item => {
                const highlightedTitle = highlightText(item.title, searchTerm);
                const highlightedText = highlightText(item.text.substring(0, 80), searchTerm);
                
                html += `
                    <div class="result-card" onclick="window.location.href='${item.link}'">
                        <div class="result-image-wrapper">
                            ${item.image ? 
                                `<img src="${item.image}" class="result-image" alt="${item.title}" 
                                      onerror="handleImageError(this)" 
                                      onload="this.style.display='block'; this.parentNode.classList.add('has-image');"
                                      data-retry-count="0">` : 
                                ''
                            }
                            <div class="result-icon" style="${item.image ? 'display: none;' : 'display: flex;'}">
                                <i class="fas fa-box"></i>
                            </div>
                        </div>
                        <div class="result-info">
                            <h4><a href="${item.link}">${highlightedTitle}</a></h4>
                            <p>${highlightedText}...</p>
                            ${item.price ? `<div class="result-price">${item.price}</div>` : ''}
                            <span class="result-badge">${item.type}</span>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        html += `
            <div class="search-footer">
                <button class="clear-search-btn" onclick="window.clearUniversalSearch()">
                    <i class="fas fa-undo"></i> Axtarışı təmizlə
                </button>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Mətndə axtarılan sözü vurğula
    function highlightText(text, searchTerm) {
        if (!text) return '';
        try {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<mark class="search-highlight">$1</mark>');
        } catch (e) {
            return text;
        }
    }
    
    // Axtarışı təmizlə - GLOBAL FUNKSİYA
    window.clearUniversalSearch = function() {
        searchInput.value = '';
        searchInput.focus();
        
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        
        // Bütün bölmələri göstər
        document.querySelectorAll('section, .section, [class*="section"]').forEach(el => {
            if (el.id !== 'searchResultsContainer') {
                el.style.display = '';
            }
        });
    };
    
    // Event listener-lar
    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    // Debounce ilə real-time axtarış
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch();
        }, 400);
    });
    
    // ESC düyməsi ilə axtarışı təmizlə
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchInput === document.activeElement) {
            window.clearUniversalSearch();
        }
    });
    
    // Səhifə yüklənəndə URL-də search parametri varsa
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('q');
    if (searchParam) {
        searchInput.value = searchParam;
        performSearch();
    }
    
    console.log(`✅ Universal navbar search ready on ${getCurrentPageType()} page`);
});