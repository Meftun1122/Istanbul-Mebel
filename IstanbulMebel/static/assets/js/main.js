/**
 * iPortfolio Template - TAM DÜZƏLDİLMİŞ VERSİYA (VALYUTA FİKSİ + LIGHTBOX + AXTARIŞ)
 * 
 * XÜSUSİYYƏTLƏR:
 * 1. BÜTÜN şəkillərə klik etdikdə lightbox açılır
 * 2. Səbətdə miqdar artırıb azaltdıqda ümumi məbləğ DÜZGÜN hesablanır
 * 3. Bütün TL (₺) dəyərləri avtomatik olaraq Manat (₼) ilə əvəz olunur
 * 4. NAVBAR fixed offset düzəldilib
 * 5. AJAX ilə səbət və wishlist əməliyyatları (Profil hissəsi SİLİNDİ)
 * 6. GELİŞMİŞ AXTARIŞ SİSTEMİ - real vaxtda məhsul axtarışı
 */

(function() {
  "use strict";

  // ============================================================
  // GELİŞMİŞ AXTARIŞ SİSTEMİ
  // ============================================================
  
  // Axtarış elementlərini seç
  const searchInput = document.querySelector('.search__input');
  const searchButton = document.querySelector('.search__button');
  const searchForm = document.getElementById('searchForm');
  
  // Axtarış nəticələri üçün container yarat
  let searchResultsContainer = null;
  
  // Debounce timer
  let searchDebounceTimer = null;
  
  // Bütün məhsul elementlərini topla
  function getAllProductItems() {
    // Məhsul kartlarını seç (saytınızdakı məhsul kartlarının strukturuna uyğun)
    const productSelectors = [
      '.product-card', '.portfolio-item', '.shop-item', 
      '.product-item', '.card.product', '[class*="product-card"]',
      '.products-grid > div', '.product-list > div', '.row > .col'
    ];
    
    let products = [];
    productSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Artıq əlavə edilməyibsə
        if (!products.includes(el) && el.querySelector('img, .product-title, h3, h4')) {
          products.push(el);
        }
      });
    });
    
    return products;
  }
  
  // Məhsul məlumatlarını çıxar
  function extractProductData(productElement) {
    // Şəkil
    const img = productElement.querySelector('img');
    const imageUrl = img ? (img.src || img.getAttribute('data-src') || '') : '';
    
    // Başlıq
    const titleSelectors = ['.product-title', 'h3', 'h4', '.title', '.product-name', '.name', 'h5', '.card-title'];
    let title = '';
    for (const selector of titleSelectors) {
      const titleEl = productElement.querySelector(selector);
      if (titleEl && titleEl.textContent) {
        title = titleEl.textContent.trim();
        break;
      }
    }
    if (!title) title = 'Məhsul';
    
    // Qiymət
    const priceSelectors = ['.price', '.current-price', '.special-price', '.product-price', '.price-value'];
    let price = '';
    for (const selector of priceSelectors) {
      const priceEl = productElement.querySelector(selector);
      if (priceEl && priceEl.textContent) {
        price = priceEl.textContent.trim();
        break;
      }
    }
    
    // Link
    const link = productElement.querySelector('a') ? productElement.querySelector('a').href : '#';
    
    // Kateqoriya / Manufacturer
    const categorySelectors = ['.category', '.manufacturer', '.badge', '.product-category', '.brand'];
    let category = '';
    for (const selector of categorySelectors) {
      const catEl = productElement.querySelector(selector);
      if (catEl && catEl.textContent) {
        category = catEl.textContent.trim();
        break;
      }
    }
    
    // Təsvir
    const descSelectors = ['.description', '.product-description', 'p', '.short-desc'];
    let description = '';
    for (const selector of descSelectors) {
      const descEl = productElement.querySelector(selector);
      if (descEl && descEl.textContent && descEl.textContent.length > 10) {
        description = descEl.textContent.trim().substring(0, 120);
        break;
      }
    }
    
    return { element: productElement, imageUrl, title, price, link, category, description };
  }
  
  // Axtarış funksiyası
  function performSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const products = getAllProductItems();
    
    if (term === '') {
      // Axtarış boşdursa, bütün məhsulları göstər və nəticə container-nı gizlət
      products.forEach(product => {
        product.style.display = '';
      });
      if (searchResultsContainer) {
        searchResultsContainer.style.display = 'none';
      }
      return;
    }
    
    // Uyğun məhsulları tap
    const matchedProducts = [];
    products.forEach(product => {
      const data = extractProductData(product);
      const matches = data.title.toLowerCase().includes(term) || 
                      (data.category && data.category.toLowerCase().includes(term)) ||
                      (data.description && data.description.toLowerCase().includes(term));
      
      if (matches) {
        matchedProducts.push(data);
        product.style.display = '';
        // Highlight effekti
        product.classList.add('search-highlight-animation');
        setTimeout(() => {
          product.classList.remove('search-highlight-animation');
        }, 500);
      } else {
        product.style.display = 'none';
      }
    });
    
    // Nəticələri göstər
    showSearchResults(term, matchedProducts);
  }
  
  // Nəticələri göstər (gözəl dizayn)
  function showSearchResults(searchTerm, matchedProducts) {
    // Container yoxdursa yarat
    if (!searchResultsContainer) {
      searchResultsContainer = document.createElement('div');
      searchResultsContainer.className = 'search-results-overlay';
      document.body.appendChild(searchResultsContainer);
    }
    
    const resultsCount = matchedProducts.length;
    const symbol = getCurrencySymbol ? getCurrencySymbol() : '₼';
    
    if (resultsCount === 0) {
      searchResultsContainer.innerHTML = `
        <div class="search-results-container">
          <div class="search-results-header">
            <h3>Axtarış nəticələri</h3>
            <button class="search-results-close">&times;</button>
          </div>
          <div class="search-results-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <p>"${escapeHtml(searchTerm)}" üçün heç bir nəticə tapılmadı</p>
            <small>Fərqli açar sözlərlə cəhd edin</small>
          </div>
        </div>
      `;
    } else {
      let resultsHtml = `
        <div class="search-results-container">
          <div class="search-results-header">
            <h3>Axtarış nəticələri <span class="results-count">(${resultsCount})</span></h3>
            <button class="search-results-close">&times;</button>
          </div>
          <div class="search-results-grid">
      `;
      
      matchedProducts.forEach(product => {
        resultsHtml += `
          <div class="search-result-card" data-link="${product.link}">
            <div class="search-result-image">
              <img src="${product.imageUrl || '/static/images/no-image.png'}" alt="${escapeHtml(product.title)}" loading="lazy">
            </div>
            <div class="search-result-info">
              <h4 class="search-result-title">${highlightText(product.title, searchTerm)}</h4>
              ${product.category ? `<p class="search-result-category"><i class="fas fa-tag"></i> ${highlightText(product.category, searchTerm)}</p>` : ''}
              ${product.price ? `<p class="search-result-price">${symbol}${cleanPriceToDisplay(product.price)}</p>` : ''}
              ${product.description ? `<p class="search-result-desc">${highlightText(product.description, searchTerm)}</p>` : ''}
              <a href="${product.link}" class="search-result-link">Ətraflı <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        `;
      });
      
      resultsHtml += `
          </div>
        </div>
      `;
      
      searchResultsContainer.innerHTML = resultsHtml;
    }
    
    // Container-ı göstər
    searchResultsContainer.style.display = 'flex';
    document.body.classList.add('search-open');
    
    // Bağlama düyməsi
    const closeBtn = searchResultsContainer.querySelector('.search-results-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSearchResults);
    }
    
    // Container-ın arxa fonuna klik
    searchResultsContainer.addEventListener('click', function(e) {
      if (e.target === searchResultsContainer) {
        closeSearchResults();
      }
    });
    
    // ESC düyməsi
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchResultsContainer && searchResultsContainer.style.display === 'flex') {
        closeSearchResults();
      }
    });
    
    // Nəticə kartlarına klik
    document.querySelectorAll('.search-result-card').forEach(card => {
      card.addEventListener('click', function(e) {
        if (!e.target.closest('.search-result-link')) {
          const link = this.dataset.link;
          if (link && link !== '#') {
            window.location.href = link;
          }
        }
      });
    });
  }
  
  // Axtarış nəticələrini bağla
  function closeSearchResults() {
    if (searchResultsContainer) {
      searchResultsContainer.style.display = 'none';
      document.body.classList.remove('search-open');
    }
    
    // Bütün məhsulları yenidən göstər
    const products = getAllProductItems();
    products.forEach(product => {
      product.style.display = '';
    });
    
    // Input-u təmizlə
    if (searchInput) {
      searchInput.value = '';
    }
  }
  
  // Qiyməti təmizlə göstərmək üçün
  function cleanPriceToDisplay(priceText) {
    if (!priceText) return '0.00';
    let cleaned = priceText.replace(/[₼$€£₺₽¥]/g, '').replace(/[^0-9.,]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);
    return isNaN(price) ? '0.00' : price.toFixed(2);
  }
  
  // Mətndə axtarılan sözü vurğula
  function highlightText(text, searchTerm) {
    if (!text || !searchTerm) return escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="search-highlight-text">$1</mark>');
  }
  
  // Regex üçün escape
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // HTML escape
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`=\/]/g, function(s) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      };
      return map[s] || s;
    });
  }
  
  // Valyuta simvolunu al (əgər varsa)
  function getCurrencySymbol() {
    // Əvvəlki valyuta sistemindən istifadə et
    if (window.getCurrencySymbol) return window.getCurrencySymbol();
    const lang = document.documentElement.lang || 'az';
    switch(lang) {
      case 'az': return '₼';
      case 'en': return '$';
      case 'ru': return '₽';
      default: return '₼';
    }
  }
  
  // Axtarış sistemini başlat
  function initSearchSystem() {
    console.log('🔍 Axtarış sistemi başladıldı...');
    
    if (!searchInput) {
      console.warn('Axtarış input elementi tapılmadı!');
      return;
    }
    
    // Axtarış CSS-i əlavə et
    if (!document.querySelector('#search-system-styles')) {
      const style = document.createElement('style');
      style.id = 'search-system-styles';
      style.textContent = `
        /* Axtarış nəticələri overlay */
        .search-results-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          z-index: 1000000;
          display: none;
          justify-content: center;
          align-items: center;
          animation: searchFadeIn 0.3s ease;
        }
        
        @keyframes searchFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .search-results-container {
          width: 90%;
          max-width: 1200px;
          max-height: 85vh;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: searchSlideIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        
        @keyframes searchSlideIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .search-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          color: white;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .search-results-header h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 600;
        }
        
        .results-count {
          font-size: 0.9rem;
          color: #ff6b6b;
          margin-left: 8px;
        }
        
        .search-results-close {
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        
        .search-results-close:hover {
          background: rgba(255,255,255,0.2);
          transform: rotate(90deg);
        }
        
        .search-results-grid {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          background: #f8f9fa;
        }
        
        .search-result-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        
        .search-result-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .search-result-image {
          height: 180px;
          overflow: hidden;
          background: #f0f0f0;
        }
        
        .search-result-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        
        .search-result-card:hover .search-result-image img {
          transform: scale(1.05);
        }
        
        .search-result-info {
          padding: 16px;
          flex: 1;
        }
        
        .search-result-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #1a1a2e;
          line-height: 1.4;
        }
        
        .search-result-title mark {
          background: #ffd700;
          color: #1a1a2e;
          padding: 0 3px;
          border-radius: 4px;
        }
        
        .search-result-category {
          font-size: 0.75rem;
          color: #ff6b6b;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .search-result-category mark {
          background: #ffd700;
          padding: 0 3px;
          border-radius: 4px;
        }
        
        .search-result-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2ecc71;
          margin: 8px 0;
        }
        
        .search-result-desc {
          font-size: 0.8rem;
          color: #666;
          line-height: 1.5;
          margin: 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .search-result-desc mark {
          background: #ffd700;
          padding: 0 3px;
          border-radius: 4px;
        }
        
        .search-result-link {
          display: inline-block;
          margin-top: 10px;
          color: #3498db;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .search-result-link:hover {
          color: #2980b9;
          transform: translateX(5px);
        }
        
        .search-results-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #666;
        }
        
        .search-results-empty svg {
          margin-bottom: 20px;
          color: #ff6b6b;
        }
        
        .search-results-empty p {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }
        
        /* Axtarış highlight animasiyası */
        .search-highlight-animation {
          animation: searchHighlightPulse 0.5s ease;
        }
        
        @keyframes searchHighlightPulse {
          0% { background-color: rgba(255, 215, 0, 0); }
          50% { background-color: rgba(255, 215, 0, 0.3); }
          100% { background-color: rgba(255, 215, 0, 0); }
        }
        
        /* Scrollbar styling */
        .search-results-grid::-webkit-scrollbar {
          width: 8px;
        }
        
        .search-results-grid::-webkit-scrollbar-track {
          background: #e0e0e0;
          border-radius: 4px;
        }
        
        .search-results-grid::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        .search-results-grid::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        @media (max-width: 768px) {
          .search-results-grid {
            grid-template-columns: 1fr;
            padding: 16px;
          }
          .search-results-container {
            width: 95%;
            max-height: 90vh;
          }
          .search-results-header h3 {
            font-size: 1rem;
          }
        }
        
        body.search-open {
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Input eventi (real vaxt axtarış)
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        performSearch(this.value);
      }, 300);
    });
    
    // Enter düyməsi
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchDebounceTimer);
        performSearch(this.value);
      }
    });
    
    // Axtarış düyməsi
    if (searchButton) {
      searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch(searchInput.value);
      });
    }
    
    // Form submit
    if (searchForm) {
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch(searchInput.value);
      });
    }
    
    console.log('✅ Axtarış sistemi hazırdır!');
  }
  
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
    initSearchSystem(); // Axtarış sistemini başlat
    
    const testimonialRoot = document.getElementById('testimonial-root');
    if (testimonialRoot) renderTestimonial(testimonialRoot);
    
    console.log('✅ BÜTÜN SİSTEM AKTİVDİR - TL avtomatik MANAT-a çevrilir!');
    console.log('✅ Profil hissəsi SİLİNDİ - yalnız səbət və wishlist işləyir!');
    console.log('✅ AXTARIŞ SİSTEMİ AKTİVDİR - Real vaxtda məhsul axtarışı!');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

console.log('✅ main.js - AXTARIŞ SİSTEMİ ƏLAVƏ EDİLDİ');