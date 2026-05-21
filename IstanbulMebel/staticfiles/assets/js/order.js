// Helper: safe query
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('🚀 Master JavaScript loaded');

    initDropdowns();
    initAjaxForms();
    initCartQuantity();
    initProductQuantity();
    initImageFunctions();
    initSearchFunctions();
    initCheckoutFunctions();
    initPriceSlider();
    initPremiumBadges();
    initProductDetailBadge();

    console.log('✅ All systems ready');
}

// ------------------------
// Utilities for data normalizing
// ------------------------
function formatPrice(value) {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'string') {
        let cleaned = value.replace(/[$₼€£₺₽¥]/g, '');
        cleaned = cleaned.replace(/[^0-9.,]/g, '').replace(',', '.');
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}

function formatPriceAZN(value) {
    const num = typeof value === 'number' ? value : formatPrice(value);
    return `₼${num.toFixed(2)}`;
}

function convertAllDollarToManat() {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.childNodes && el.childNodes.length) {
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.includes('$')) {
                    node.textContent = node.textContent.replace(/\$/g, '₼');
                }
            });
        }
        if (el.value && typeof el.value === 'string' && el.value.includes('$')) {
            el.value = el.value.replace(/\$/g, '₼');
        }
        if (el.placeholder && el.placeholder.includes('$')) {
            el.placeholder = el.placeholder.replace(/\$/g, '₼');
        }
    });
}

function normalizeItem(item, forCart = true) {
    const title = item.title || item.name || item.product_title || item.productTitle || '';
    
    let image = item.image || item.product_image || item.image_url || item.product_image_url || '';
    if (image && image.startsWith('/')) image = window.location.origin + image;
    if (!image || image === '') image = 'https://via.placeholder.com/40?text=No+Image';

    let price = 0;
    if (item.price !== undefined && item.price !== null) price = formatPrice(item.price);
    else if (item.unit_price !== undefined && item.unit_price !== null) price = formatPrice(item.unit_price);
    else if (item.special_price !== undefined && item.special_price !== null) price = formatPrice(item.special_price);
    else if (item.old_price !== undefined && item.old_price !== null) price = formatPrice(item.old_price);
    else if (item.product_price !== undefined && item.product_price !== null) price = formatPrice(item.product_price);
    
    price = parseFloat(price) || 0;

    const quantity = parseInt(item.quantity) || 1;
    const id = item.id ?? item.product_id ?? item.productId ?? '';
    const totalPrice = price * quantity;

    return { 
        id, 
        title, 
        image, 
        price: price, 
        unit_price: price, 
        quantity,
        total_price: totalPrice
    };
}

// ------------------------
// Optimistic helpers
// ------------------------
function createDropdownListItem(item, forCart = true) {
    const li = document.createElement('li');
    li.className = 'dropdown-item';
    if (item.id) li.dataset.productId = item.id;
    if (item._optimistic) li.dataset.optimistic = 'true';

    const price = item.price || item.unit_price || 0;
    const priceFormatted = price.toFixed(2);
    const quantity = item.quantity || 1;
    const totalFormatted = (price * quantity).toFixed(2);
    
    let priceText = '';
    if (forCart) {
        priceText = `₼${priceFormatted} x ${quantity} = ₼${totalFormatted}`;
    } else {
        priceText = `₼${priceFormatted}`;
    }

    li.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.title)}"
             style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;"
             onerror="this.src='https://via.placeholder.com/40?text=No+Image'">
        <div class="item-details">
            <div class="item-title">${escapeHtml(item.title) || 'Məhsul'}</div>
            <div class="item-price" style="color: #fff; font-size: 12px;">${priceText}</div>
        </div>
    `;
    return li;
}

function updateDropdownEmptyState(dropdown, dropdownId) {
    const container = dropdown.querySelector('.dropdown-items-container');
    if (!container) return;
    
    const items = container.querySelectorAll('.dropdown-item:not(.empty-placeholder)');
    
    if (items.length === 0) {
        const hasEmptyPlaceholder = container.querySelector('.empty-placeholder');
        if (!hasEmptyPlaceholder) {
            container.innerHTML = '';
            if (dropdownId === 'cartDropdown') {
                container.innerHTML = `<li class="dropdown-item empty-placeholder" style="justify-content:center;color:#999;text-align:center;padding:20px;"><i class="fas fa-shopping-cart" style="font-size:24px;margin-bottom:8px;display:block;"></i><span>Səbət boşdur</span></li>`;
            } else {
                container.innerHTML = `<li class="dropdown-item empty-placeholder" style="justify-content:center;color:#999;text-align:center;padding:20px;"><i class="far fa-heart" style="font-size:24px;margin-bottom:8px;display:block;"></i><span>Wishlist boşdur</span></li>`;
            }
        }
    } else {
        const emptyPlaceholders = container.querySelectorAll('.empty-placeholder');
        emptyPlaceholders.forEach(el => el.remove());
    }
}

function insertOptimisticItemToDropdown(rawItem, dropdownId = 'cartDropdown') {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    let container = dropdown.querySelector('.dropdown-items-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'dropdown-items-container';
        const firstLi = dropdown.querySelector('li');
        if (firstLi) {
            firstLi.before(container);
        } else {
            dropdown.appendChild(container);
        }
    }

    const normalized = normalizeItem(rawItem, dropdownId.includes('cart'));
    normalized._optimistic = true;

    const emptyPlaceholders = container.querySelectorAll('.empty-placeholder');
    emptyPlaceholders.forEach(e => e.remove());

    if (normalized.id) {
        const existing = container.querySelector(`[data-product-id="${normalized.id}"]`);
        if (existing) {
            const priceEl = existing.querySelector('.item-price');
            if (priceEl) {
                let currentQty = 1;
                const currentText = priceEl.textContent;
                const qtyMatch = currentText.match(/x (\d+)/);
                if (qtyMatch) {
                    currentQty = parseInt(qtyMatch[1]);
                }
                
                const newQty = currentQty + normalized.quantity;
                const price = normalized.price || normalized.unit_price || 0;
                const total = price * newQty;
                
                if (dropdownId.includes('cart')) {
                    priceEl.textContent = `₼${price.toFixed(2)} x ${newQty} = ₼${total.toFixed(2)}`;
                }
                
                const headerCount = dropdown.querySelector('.header-count');
                if (headerCount) {
                    const curr = parseInt(headerCount.textContent) || 0;
                    headerCount.textContent = `${curr + normalized.quantity} məhsul`;
                }
                
                updateCartTotal();
            }
            return;
        }
    }

    const li = createDropdownListItem(normalized, dropdownId.includes('cart'));
    li.style.opacity = '0.95';
    li.style.background = 'rgba(255,255,255,0.05)';
    container.insertAdjacentElement('afterbegin', li);

    const headerCount = dropdown.querySelector('.header-count');
    if (headerCount) {
        const curr = parseInt(headerCount.textContent) || 0;
        headerCount.textContent = `${curr + normalized.quantity} məhsul`;
    }
    
    if (dropdownId.includes('cart')) {
        updateCartTotal();
    }
}

function updateCartTotal() {
    const cartDropdown = document.getElementById('cartDropdown');
    if (!cartDropdown) return;
    
    const container = cartDropdown.querySelector('.dropdown-items-container');
    if (!container) return;
    
    const items = container.querySelectorAll('.dropdown-item:not(.empty-placeholder)');
    let total = 0;
    
    items.forEach(item => {
        const priceEl = item.querySelector('.item-price');
        if (priceEl) {
            const text = priceEl.textContent;
            const totalMatch = text.match(/=\s*₼([\d.]+)/);
            if (totalMatch) {
                total += parseFloat(totalMatch[1]);
            } else {
                const priceMatch = text.match(/₼([\d.]+)/);
                const qtyMatch = text.match(/x (\d+)/);
                if (priceMatch && qtyMatch) {
                    total += parseFloat(priceMatch[1]) * parseInt(qtyMatch[1]);
                }
            }
        }
    });
    
    const totalAmount = cartDropdown.querySelector('.total-amount');
    if (totalAmount) {
        totalAmount.textContent = `₼${total.toFixed(2)}`;
    }
}

function removeOptimisticItemsFromDropdown(productId, dropdownId = 'cartDropdown') {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    const container = dropdown.querySelector('.dropdown-items-container');
    if (!container) return;
    
    const optimisticItems = container.querySelectorAll(`[data-product-id="${productId}"][data-optimistic="true"]`);
    optimisticItems.forEach(el => el.remove());

    if (dropdownId === 'cartDropdown') {
        updateCartTotal();
    }
    
    updateDropdownEmptyState(dropdown, dropdownId);
}

// ------------------------
// Dropdown system
// ------------------------
function initDropdowns() {
    console.log('✅ Dropdown system loaded');

    const wishlistBtn = document.getElementById('wishlistBtn');
    const cartBtn = document.getElementById('cartBtn');
    const wishlistDropdown = document.getElementById('wishlistDropdown');
    const cartDropdown = document.getElementById('cartDropdown');

    if (!wishlistBtn || !cartBtn || !wishlistDropdown || !cartDropdown) {
        console.warn('Dropdown elements not found');
        return;
    }

    wishlistBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        cartDropdown.classList.remove('show');
        wishlistDropdown.classList.toggle('show');
        if (wishlistDropdown.classList.contains('show')) refreshWishlistDropdown();
    });

    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        wishlistDropdown.classList.remove('show');
        cartDropdown.classList.toggle('show');
        if (cartDropdown.classList.contains('show')) refreshCartDropdown();
    });

    document.addEventListener('click', function(e) {
        if (!wishlistBtn.contains(e.target) && !wishlistDropdown.contains(e.target)) wishlistDropdown.classList.remove('show');
        if (!cartBtn.contains(e.target) && !cartDropdown.contains(e.target)) cartDropdown.classList.remove('show');
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            wishlistDropdown.classList.remove('show');
            cartDropdown.classList.remove('show');
        }
    });

    wishlistDropdown.addEventListener('click', e => e.stopPropagation());
    cartDropdown.addEventListener('click', e => e.stopPropagation());
}

// ============================================================
// PROBLEM 2: MƏHSUL DETALI SƏHİFƏSİ - MİQDAR
// ============================================================

function initProductQuantity() {
    console.log('✅ Product quantity control loaded');

    const quantityInput = document.getElementById('productQuantity');
    if (!quantityInput) return;

    // Hidden input yarat (əgər yoxdursa)
    let hiddenInput = document.getElementById('hiddenQuantity');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'hiddenQuantity';
        hiddenInput.name = 'quantity';
        hiddenInput.value = quantityInput.value;
        
        const addToCartForm = document.getElementById('addToCartForm');
        if (addToCartForm) {
            addToCartForm.appendChild(hiddenInput);
        } else {
            document.body.appendChild(hiddenInput);
        }
    }

    const minValue = parseInt(quantityInput.min) || 1;
    const maxValue = parseInt(quantityInput.max) || 99;

    // Qlobal funksiyalar - HTML-dən çağırılır
    window.decreaseQuantity = function() {
        let currentValue = parseInt(quantityInput.value) || minValue;
        if (currentValue > minValue) {
            quantityInput.value = currentValue - 1;
            if (hiddenInput) hiddenInput.value = quantityInput.value;
            updateTotalPrice(quantityInput.value);
        }
    };

    window.increaseQuantity = function() {
        let currentValue = parseInt(quantityInput.value) || minValue;
        if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
            if (hiddenInput) hiddenInput.value = quantityInput.value;
            updateTotalPrice(quantityInput.value);
        }
    };

    function updateTotalPrice(quantity) {
        const totalPriceElement = document.getElementById('totalPrice');
        
        // Vahid qiyməti tap
        let unitPrice = 0;
        
        const priceEl = document.querySelector('.special-price-value, .current-price, .product-price, .price');
        if (priceEl) {
            let priceText = priceEl.textContent;
            priceText = priceText.replace(/[₼$€£₺₽¥]/g, '').replace(/[^\d.,]/g, '').replace(',', '.');
            unitPrice = parseFloat(priceText);
        }
        
        if (isNaN(unitPrice)) unitPrice = 0;
        
        const totalPrice = unitPrice * parseInt(quantity);
        
        if (totalPriceElement) {
            totalPriceElement.textContent = '₼' + totalPrice.toFixed(2);
        }
    }

    hiddenInput.value = quantityInput.value;
    updateTotalPrice(quantityInput.value);
}

// ============================================================
// PROBLEM 1: SƏBƏT HİSSƏSİ - UPDATE CART BUTTON
// ============================================================

function initCartQuantity() {
    console.log('✅ Cart quantity control loaded');

    // Vahid qiymətləri və orijinal miqdarları saxlamaq üçün
    window.unitPrices = {};
    window.originalQuantities = {};

    const cartRows = document.querySelectorAll('.cart-row');
    
    cartRows.forEach(row => {
        const itemId = row.dataset.itemId;
        if (!itemId) return;
        
        // Vahid qiyməti tap
        let unitPrice = 0;
        
        // unitPrice elementindən tap
        const unitPriceEl = document.getElementById(`unitPrice-${itemId}`);
        if (unitPriceEl) {
            let priceText = unitPriceEl.textContent;
            priceText = priceText.replace(/[₼$€£₺₽¥]/g, '');
            unitPrice = parseFloat(priceText);
        }
        
        // total elementindən hesabla (əgər yoxdursa)
        if (!unitPrice || isNaN(unitPrice)) {
            const totalEl = document.getElementById(`totalPrice-${itemId}`);
            const qtyInput = document.getElementById(`ui-quantity-${itemId}`);
            if (totalEl && qtyInput) {
                let totalText = totalEl.textContent;
                totalText = totalText.replace(/[₼$€£₺₽¥]/g, '');
                const totalVal = parseFloat(totalText);
                const qtyVal = parseInt(qtyInput.value) || 1;
                if (!isNaN(totalVal) && qtyVal > 0) {
                    unitPrice = totalVal / qtyVal;
                }
            }
        }
        
        if (isNaN(unitPrice)) unitPrice = 0;
        window.unitPrices[itemId] = unitPrice;
        
        // Original miqdarı saxla
        const qtyInput = document.getElementById(`ui-quantity-${itemId}`);
        if (qtyInput) {
            window.originalQuantities[itemId] = parseInt(qtyInput.value) || 1;
        }
    });

    // Ümumi cəmi yenilə
    updateSummaryFromUI();
    
    // UPDATE BUTTON - Event listener əlavə et
    const updateBtn = document.getElementById('updateCartBtn');
    if (updateBtn) {
        // Köhnə event listener-ları təmizləmək üçün klonla
        const newBtn = updateBtn.cloneNode(true);
        updateBtn.parentNode.replaceChild(newBtn, updateBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            submitCartUpdates();
        });
    }
}

// Qlobal funksiya - HTML-dən birbaşa çağırılır
window.updateQuantityUI = function(itemId, action, value) {
    const qtyInput = document.getElementById(`ui-quantity-${itemId}`);
    if (!qtyInput) return;
    
    let currentValue = parseInt(qtyInput.value) || 1;
    let newValue = currentValue;
    
    if (action === 'increase') {
        newValue = currentValue + 1;
    } else if (action === 'decrease') {
        newValue = currentValue - 1;
    } else if (action === 'input') {
        newValue = parseInt(value) || 1;
    }
    
    newValue = Math.max(1, Math.min(99, newValue));
    
    if (newValue === currentValue) return;
    
    qtyInput.value = newValue;
    
    const currentHidden = document.getElementById(`current-quantity-${itemId}`);
    if (currentHidden) currentHidden.value = newValue;
    
    updatePriceForItem(itemId, newValue);
    
    const updateBtn = document.getElementById('updateCartBtn');
    if (updateBtn) {
        updateBtn.style.display = 'flex';
    }
};

function updatePriceForItem(itemId, quantity) {
    const unitPrice = window.unitPrices[itemId];
    if (!unitPrice || isNaN(unitPrice)) return;
    
    const newTotal = unitPrice * quantity;
    
    const totalEl = document.getElementById(`totalPrice-${itemId}`);
    if (totalEl) {
        totalEl.textContent = `₼${newTotal.toFixed(2)}`;
    }
    
    updateSummaryFromUI();
}

function updateSummaryFromUI() {
    let subtotal = 0;
    const cartRows = document.querySelectorAll('.cart-row');
    
    cartRows.forEach(row => {
        const itemId = row.dataset.itemId;
        if (!itemId) return;
        
        const totalEl = document.getElementById(`totalPrice-${itemId}`);
        if (totalEl) {
            let totalText = totalEl.textContent;
            let totalValue = parseFloat(totalText.replace(/[₼$€£₺₽¥]/g, ''));
            if (!isNaN(totalValue)) {
                subtotal += totalValue;
            }
        }
    });
    
    let shipping = 0;
    const shippingEl = document.getElementById('shipping');
    if (shippingEl) {
        const shippingText = shippingEl.textContent;
        if (shippingText && shippingText !== 'Pulsuz') {
            shipping = parseFloat(shippingText.replace(/[₼$€£₺₽¥]/g, '')) || 0;
        }
    }
    
    const total = subtotal + shipping;
    
    const subtotalEl = document.getElementById('subtotal');
    if (subtotalEl) subtotalEl.textContent = `₼${subtotal.toFixed(2)}`;
    
    if (shippingEl && shipping === 0) {
        shippingEl.textContent = 'Pulsuz';
    } else if (shippingEl) {
        shippingEl.textContent = `₼${shipping.toFixed(2)}`;
    }
    
    const totalEl = document.getElementById('total');
    if (totalEl) totalEl.textContent = `₼${total.toFixed(2)}`;
}

function submitCartUpdates() {
    const changedItems = [];
    const cartRows = document.querySelectorAll('.cart-row');
    
    cartRows.forEach(row => {
        const itemId = row.dataset.itemId;
        if (!itemId) return;
        
        const currentQtyEl = document.getElementById(`ui-quantity-${itemId}`);
        const originalQty = window.originalQuantities[itemId];
        const currentQty = currentQtyEl ? parseInt(currentQtyEl.value) : null;
        
        if (currentQty !== null && originalQty !== undefined && currentQty !== originalQty) {
            changedItems.push({ id: itemId, quantity: currentQty });
        }
    });
    
    if (changedItems.length === 0) {
        showNotification('Heç bir dəyişiklik edilməyib', 'info');
        return false;
    }
    
    const bulkForm = document.getElementById('bulkUpdateForm');
    if (!bulkForm) {
        showNotification('Xəta: Səbət yeniləmə formu tapılmadı!', 'error');
        return false;
    }
    
    const fieldsContainer = document.getElementById('bulkUpdateFields');
    if (fieldsContainer) {
        fieldsContainer.innerHTML = '';
        
        changedItems.forEach(item => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `quantity_${item.id}`;
            input.value = item.quantity;
            fieldsContainer.appendChild(input);
        });
        
        bulkForm.submit();
    } else {
        showNotification('Xəta: Form sahəsi tapılmadı!', 'error');
        return false;
    }
    
    return true;
}

// ------------------------
// AJAX forms (Add to cart, wishlist)
// ------------------------
function initAjaxForms() {
    console.log('✅ AJAX Forms loaded');

    const addToCartForms = document.querySelectorAll('form[action*="add_to_cart"], .add-to-cart-form, form[action*="add-to-cart"]');
    addToCartForms.forEach(form => setupAddToCartForm(form));

    const wishlistForms = document.querySelectorAll('form[action*="add_to_wishlist"], .add-to-wishlist-form, form[action*="add-to-wishlist"]');
    wishlistForms.forEach(form => setupWishlistForm(form));
    
    console.log(`Found ${addToCartForms.length} cart forms, ${wishlistForms.length} wishlist forms`);
    
    setTimeout(() => {
        convertAllDollarToManat();
    }, 100);
}

function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

function extractProductDataFromForm(form) {
    const productId = form.querySelector('[name="product_id"]')?.value || '';
    
    let title = '';
    title = form.querySelector('[name="product_title"]')?.value || '';
    if (!title) title = form.querySelector('[data-product-title]')?.dataset.productTitle || '';
    if (!title) {
        const productCard = form.closest('.product-card, .product-item, .portfolio-item, [class*="product"]');
        if (productCard) {
            title = productCard.querySelector('.product-title, h3, h4, .title')?.textContent?.trim() || '';
        }
    }
    if (!title) title = document.querySelector('.product-title, h1')?.textContent?.trim() || '';
    if (!title) title = 'Məhsul';
    
    let image = '';
    image = form.querySelector('[name="product_image"]')?.value || '';
    if (!image) image = form.querySelector('[data-product-image]')?.dataset.productImage || '';
    if (!image) {
        const productCard = form.closest('.product-card, .product-item, .portfolio-item, [class*="product"]');
        if (productCard) {
            const img = productCard.querySelector('img');
            if (img) image = img.src;
        }
    }
    if (!image) {
        const mainImg = document.querySelector('.product-image img, .main-image img, .product-detail img, .product-main-image img');
        if (mainImg) image = mainImg.src;
    }
    
    let priceRaw = '';
    priceRaw = form.querySelector('[name="product_price"]')?.value || '';
    if (!priceRaw) priceRaw = form.querySelector('[data-product-price]')?.dataset.productPrice || '';
    if (!priceRaw) {
        const productCard = form.closest('.product-card, .product-item, .portfolio-item, [class*="product"]');
        if (productCard) {
            priceRaw = productCard.querySelector('.special-price-value, .current-price, .product-price, .price')?.textContent || '';
            if (!priceRaw) priceRaw = productCard.querySelector('[class*="price"]')?.textContent || '';
        }
    }
    if (!priceRaw) {
        priceRaw = document.querySelector('.special-price-value, .current-price, .product-price')?.textContent || '';
        if (!priceRaw) priceRaw = document.querySelector('.price-section .current-price, .price-section .special-price')?.textContent || '';
    }
    if (!priceRaw) priceRaw = '0';
    
    const price = formatPrice(priceRaw);
    
    const hiddenInput = document.getElementById('hiddenQuantity');
    let quantity = hiddenInput?.value || form.querySelector('[name="quantity"]')?.value || 1;
    quantity = parseInt(quantity);
    
    return {
        id: productId,
        title: title,
        image: image,
        price: price,
        quantity: quantity
    };
}

function setupAddToCartForm(form) {
    if (form.dataset.ajaxReady === 'true') return;
    form.dataset.ajaxReady = 'true';

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const productId = this.querySelector('[name="product_id"]')?.value;
        if (!productId) { showNotification('❌ Product ID tapılmadı!', 'error'); return; }

        const btn = this.querySelector('button');
        const originalHtml = btn?.innerHTML || '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

        const formData = new FormData(this);
        const hiddenInput = document.getElementById('hiddenQuantity');
        const quantity = parseInt(hiddenInput?.value || this.querySelector('[name="quantity"]')?.value || 1);
        if (hiddenInput?.value) formData.set('quantity', hiddenInput.value);

        const productData = extractProductDataFromForm(this);
        const optimisticItem = {
            id: productData.id,
            title: productData.title,
            image: productData.image,
            price: productData.price,
            quantity: quantity
        };

        try {
            insertOptimisticItemToDropdown(optimisticItem, 'cartDropdown');
            const currCount = parseInt(document.querySelector('.cart-count, #cartBtn .dropdown-badge')?.textContent) || 0;
            updateCartCount(currCount + quantity);
        } catch (err) {
            console.warn('Optimistic add-to-cart failed', err);
        }

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': getCsrfToken() }
            });

            const data = await response.json();
            console.log('Add to cart response:', data);

            if (data?.success) {
                showNotification(data.message || '✅ Məhsul səbətə əlavə edildi!', 'success');
                updateCartCount(data.cart_count || 0);
                await refreshCartDropdown();
                await refreshWishlistDropdown();

                if (btn) {
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.style.backgroundColor = '#28a745';
                    setTimeout(() => { btn.innerHTML = originalHtml; btn.style.backgroundColor = ''; btn.disabled = false; }, 1400);
                }
            } else {
                removeOptimisticItemsFromDropdown(productId, 'cartDropdown');
                updateCartCount(data?.cart_count || 0);
                showNotification(data?.message || '❌ Xəta baş verdi!', 'error');
                if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            removeOptimisticItemsFromDropdown(productId, 'cartDropdown');
            showNotification('❌ Xəta baş verdi!', 'error');
            if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
        }
    });
}

function setupWishlistForm(form) {
    if (form.dataset.ajaxReady === 'true') return;
    form.dataset.ajaxReady = 'true';

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const productId = this.querySelector('[name="product_id"]')?.value;
        if (!productId) { showNotification('❌ Product ID tapılmadı!', 'error'); return; }

        const btn = this.querySelector('button');
        const originalHtml = btn?.innerHTML || '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

        const formData = new FormData(this);

        const productData = extractProductDataFromForm(this);
        const optimisticItem = {
            id: productData.id,
            title: productData.title,
            image: productData.image,
            price: productData.price,
            quantity: 1
        };

        try {
            insertOptimisticItemToDropdown(optimisticItem, 'wishlistDropdown');
            const currCount = parseInt(document.querySelector('.wishlist-count, #wishlistBtn .dropdown-badge')?.textContent) || 0;
            updateWishlistCount(currCount + 1);
        } catch (err) {
            console.warn('Optimistic add-to-wishlist failed', err);
        }

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': getCsrfToken() }
            });

            const data = await response.json();
            console.log('Wishlist response:', data);

            if (data?.success) {
                const action = data.action || 'added';
                if (action === 'added') {
                    showNotification(data.message || '❤️ Məhsul wishlist-ə əlavə edildi!', 'success');
                    if (btn) { btn.innerHTML = '<i class="fas fa-heart" style="color:#ff6b6b"></i>'; btn.style.backgroundColor = '#fee9e9'; }
                } else {
                    showNotification(data.message || '💔 Məhsul wishlist-dən silindi!', 'info');
                    if (btn) { btn.innerHTML = '<i class="far fa-heart"></i>'; btn.style.backgroundColor = ''; }
                    removeOptimisticItemsFromDropdown(productId, 'wishlistDropdown');
                }

                updateWishlistCount(data.wishlist_count || 0);
                await refreshWishlistDropdown();
                await refreshCartDropdown();

                setTimeout(() => { if (btn && action !== 'added') btn.disabled = false; }, 800);
            } else {
                removeOptimisticItemsFromDropdown(productId, 'wishlistDropdown');
                updateWishlistCount(data?.wishlist_count || 0);
                showNotification(data?.message || '❌ Xəta baş verdi!', 'error');
                if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            removeOptimisticItemsFromDropdown(productId, 'wishlistDropdown');
            showNotification('❌ Xəta baş verdi!', 'error');
            if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
        }
    });
}

// ------------------------
// Refresh dropdown data
// ------------------------
async function refreshCartDropdown() {
    try {
        console.log('🔄 Refreshing cart dropdown...');
        const cartDropdown = document.getElementById('cartDropdown');
        if (!cartDropdown) { console.warn('Cart dropdown not found'); return; }

        const endpoints = ['/cart/ajax/get-cart-data/', '/ajax/get-cart-data/'];
        let res = null;
        for (const ep of endpoints) {
            try {
                res = await fetch(ep, { method: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest', 'Cache-Control': 'no-cache' } });
                if (res.ok) break;
            } catch (e) { /* try next */ }
        }
        if (!res || !res.ok) { console.warn('Unable to fetch cart data'); return; }

        const data = await res.json();
        await processCartData(data, cartDropdown);
    } catch (error) {
        console.error('❌ Error refreshing cart:', error);
    }
}

async function processCartData(data, cartDropdown) {
    console.log('Cart data received:', data);
    if (!data || !data.success) return;

    const headerCount = cartDropdown.querySelector('.header-count');
    if (headerCount) headerCount.textContent = `${data.cart_count} məhsul`;

    let itemsContainer = cartDropdown.querySelector('.dropdown-items-container');
    if (!itemsContainer) {
        itemsContainer = document.createElement('div');
        itemsContainer.className = 'dropdown-items-container';
        const firstLi = cartDropdown.querySelector('li');
        if (firstLi) {
            firstLi.before(itemsContainer);
        } else {
            cartDropdown.appendChild(itemsContainer);
        }
    }

    itemsContainer.innerHTML = '';

    if (data.items && data.items.length > 0) {
        data.items.forEach(raw => {
            const item = normalizeItem(raw, true);
            const li = createDropdownListItem(item, true);
            if (item.id) li.dataset.productId = item.id;
            itemsContainer.appendChild(li);
        });
        const totalAmount = cartDropdown.querySelector('.total-amount');
        if (totalAmount) {
            totalAmount.textContent = `₼${parseFloat(data.cart_total ?? 0).toFixed(2)}`;
        }
    } else {
        itemsContainer.innerHTML = `<li class="dropdown-item empty-placeholder" style="justify-content:center;color:#999;text-align:center;padding:20px;"><i class="fas fa-shopping-cart" style="font-size:24px;margin-bottom:8px;display:block;"></i><span>Səbət boşdur</span></li>`;
        const totalAmount = cartDropdown.querySelector('.total-amount');
        if (totalAmount) totalAmount.textContent = '₼0.00';
    }

    console.log('✅ Cart dropdown updated');
}

async function refreshWishlistDropdown() {
    try {
        console.log('🔄 Refreshing wishlist dropdown...');
        const wishlistDropdown = document.getElementById('wishlistDropdown');
        if (!wishlistDropdown) return;

        const endpoints = ['/wishlist/ajax/get-wishlist-data/', '/ajax/get-wishlist-data/'];
        let res = null;
        for (const ep of endpoints) {
            try {
                res = await fetch(ep, { method: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest', 'Cache-Control': 'no-cache' } });
                if (res.ok) break;
            } catch (e) { /* try next */ }
        }
        if (!res || !res.ok) { console.warn('Unable to fetch wishlist data'); return; }

        const data = await res.json();
        await processWishlistData(data, wishlistDropdown);
    } catch (error) {
        console.error('❌ Error refreshing wishlist:', error);
    }
}

async function processWishlistData(data, wishlistDropdown) {
    console.log('Wishlist data received:', data);
    if (!data || !data.success) return;

    const headerCount = wishlistDropdown.querySelector('.header-count');
    if (headerCount) headerCount.textContent = `${data.wishlist_count} məhsul`;

    let itemsContainer = wishlistDropdown.querySelector('.dropdown-items-container');
    if (!itemsContainer) {
        itemsContainer = document.createElement('div');
        itemsContainer.className = 'dropdown-items-container';
        const firstLi = wishlistDropdown.querySelector('li');
        if (firstLi) {
            firstLi.before(itemsContainer);
        } else {
            wishlistDropdown.appendChild(itemsContainer);
        }
    }

    itemsContainer.innerHTML = '';
    
    if (data.items && data.items.length > 0) {
        data.items.forEach(raw => {
            const item = normalizeItem(raw, false);
            const li = createDropdownListItem(item, false);
            if (item.id) li.dataset.productId = item.id;
            itemsContainer.appendChild(li);
        });
    } else {
        itemsContainer.innerHTML = `<li class="dropdown-item empty-placeholder" style="justify-content:center;color:#999;text-align:center;padding:20px;"><i class="far fa-heart" style="font-size:24px;margin-bottom:8px;display:block;"></i><span>Wishlist boşdur</span></li>`;
    }

    console.log('✅ Wishlist dropdown updated');
}

// ------------------------
// Update counts
// ------------------------
function updateCartCount(count) {
    const selectors = ['.cart-count', '.cart-badge', '[class*="cart-count"]', '#cartBtn .dropdown-badge'];
    selectors.forEach(selector => {
        $$(selector).forEach(el => {
            if (el) {
                el.textContent = count;
                el.classList.add('pulse');
                setTimeout(() => el.classList.remove('pulse'), 500);
                if (count == 0) el.style.opacity = '0.6';
                else el.style.opacity = '1';
            }
        });
    });
}

function updateWishlistCount(count) {
    const selectors = ['.wishlist-count', '.wishlist-badge', '[class*="wishlist-count"]', '#wishlistBtn .dropdown-badge'];
    selectors.forEach(selector => {
        $$(selector).forEach(el => {
            if (el) {
                el.textContent = count;
                el.classList.add('pulse');
                setTimeout(() => el.classList.remove('pulse'), 500);
                if (count == 0) el.style.opacity = '0.6';
                else el.style.opacity = '1';
            }
        });
    });
}

// ------------------------
// Notifications
// ------------------------
function showNotification(message, type = 'success') {
    const oldMsg = document.querySelector('.ajax-notification');
    if (oldMsg) oldMsg.remove();

    const msg = document.createElement('div');
    msg.className = `ajax-notification ${type}`;
    const config = {
        success: { icon: 'fa-check-circle', bg: '#28a745', color: '#fff' },
        error: { icon: 'fa-exclamation-circle', bg: '#dc3545', color: '#fff' },
        info: { icon: 'fa-info-circle', bg: '#17a2b8', color: '#fff' },
        warning: { icon: 'fa-exclamation-triangle', bg: '#ffc107', color: '#000' }
    };
    const cfg = config[type] || config.success;
    msg.innerHTML = `<i class="fas ${cfg.icon}"></i><span>${escapeHtml(message)}</span>`;
    msg.style.cssText = `position: fixed; top:20px; right:20px; background:${cfg.bg}; color:${cfg.color}; padding:12px 24px; border-radius:8px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500; max-width:350px;`;
    
    const style = document.createElement('style');
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(msg);
    setTimeout(() => { msg.style.animation = 'slideOut 0.3s ease'; setTimeout(() => msg.remove(), 300); }, 3000);
}

// ------------------------
// Image functions
// ------------------------
function initImageFunctions() {
    console.log('✅ Image functions loaded');
    $$('img').forEach(img => {
        img.addEventListener('error', function() {
            if (!this.src.includes('placeholder')) {
                this.src = 'https://via.placeholder.com/400?text=No+Image';
            }
        });
    });
}

window.expandImage = function(src) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    `;
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
    `;
    modal.appendChild(img);
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
};

// ------------------------
// Search functions
// ------------------------
function initSearchFunctions() {
    initCartSearch();
    initWishlistSearch();
    initProductSearch();
}

function initCartSearch() {
    const searchInput = document.getElementById('cartSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('keyup', function() {
        const term = this.value.toLowerCase().trim();
        const rows = document.querySelectorAll('.cart-row');
        
        if (term === '') {
            rows.forEach(r => r.style.display = '');
            return;
        }
        
        rows.forEach(row => {
            const productName = row.querySelector('.product-name')?.textContent?.toLowerCase() || '';
            const manufacturer = row.querySelector('.manufacturer-name')?.textContent?.toLowerCase() || '';
            
            if (productName.includes(term) || manufacturer.includes(term)) {
                row.style.display = '';
                row.style.backgroundColor = '#fff9e6';
                setTimeout(() => row.style.backgroundColor = '', 500);
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function initWishlistSearch() {
    const searchInput = document.getElementById('wishlistSearch');
    if (!searchInput) return;
    let timeout;
    
    searchInput.addEventListener('keyup', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const term = this.value.toLowerCase().trim();
            const rows = document.querySelectorAll('.wishlist-table tbody tr');
            
            if (term === '') {
                rows.forEach(r => r.style.display = '');
                return;
            }
            
            rows.forEach(row => {
                const name = row.querySelector('.product-name')?.textContent?.toLowerCase() || '';
                const sku = row.querySelector('.product-sku')?.textContent?.toLowerCase() || '';
                
                if (name.includes(term) || sku.includes(term)) {
                    row.style.display = '';
                    row.style.backgroundColor = '#fff9e6';
                    setTimeout(() => row.style.backgroundColor = '', 500);
                } else {
                    row.style.display = 'none';
                }
            });
        }, 300);
    });
}

function initProductSearch() {
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) return;
    const clearBtn = document.getElementById('clearProductSearch');
    
    searchInput.addEventListener('keyup', performProductSearch);
    searchInput.addEventListener('input', performProductSearch);
    if (clearBtn) clearBtn.addEventListener('click', clearProductSearch);

    function performProductSearch() {
        const term = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.product-card, .portfolio-item, [class*="col-"]');
        
        if (term === '') {
            cards.forEach(c => c.style.display = '');
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }
        
        if (clearBtn) clearBtn.style.display = 'block';
        
        cards.forEach(card => {
            const title = card.querySelector('.product-title, h3, h4, .product-name')?.textContent?.toLowerCase() || '';
            const category = card.querySelector('.category, .badge')?.textContent?.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
            
            if ((title + ' ' + category + ' ' + desc).includes(term)) {
                card.style.display = '';
                card.style.boxShadow = '0 0 0 2px #ff6b6b';
                card.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    card.style.boxShadow = '';
                    card.style.transform = '';
                }, 500);
            } else {
                card.style.display = 'none';
            }
        });
    }
}

window.clearProductSearch = function() {
    const input = document.getElementById('productSearch');
    const clearBtn = document.getElementById('clearProductSearch');
    if (input) {
        input.value = '';
        input.focus();
        document.querySelectorAll('.product-card, .portfolio-item, [class*="col-"]').forEach(c => c.style.display = '');
    }
    if (clearBtn) clearBtn.style.display = 'none';
};

// ------------------------
// Checkout functions
// ------------------------
function initCheckoutFunctions() {
    console.log('✅ Checkout functions loaded');
    $$('.form-control').forEach(input => {
        input.addEventListener('focus', function(){ this.closest('.form-group')?.classList.add('focused'); });
        input.addEventListener('blur', function(){ this.closest('.form-group')?.classList.remove('focused'); });
    });
    const diffShipping = document.getElementById('different_shipping');
    const shipAddr = document.getElementById('shippingAddress');
    if (diffShipping && shipAddr) diffShipping.addEventListener('change', function(){ shipAddr.style.display = this.checked ? 'block' : 'none'; });
}

window.submitOrder = function() {
    const fields = ['first_name','last_name','email_address','p_address','city_name','province_name','zip_code','country_name'];
    for (let field of fields) { if (!document.getElementById(field)?.value) { showNotification('Zəhmət olmasa bütün məcburi sahələri doldurun!', 'error'); return; } }
    const email = document.getElementById('email_address')?.value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showNotification('Düzgün email daxil edin!', 'error'); return; }
    document.getElementById('step1')?.classList.remove('active'); document.getElementById('step2')?.classList.add('active');
    const btn = document.getElementById('submitButton'); if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Emal edilir...'; btn.disabled = true; }
    setTimeout(() => {
        document.getElementById('addressForm')?.classList.add('hidden');
        document.getElementById('successMessage')?.classList.remove('hidden');
        document.getElementById('step2')?.classList.remove('active'); document.getElementById('step3')?.classList.add('active');
        if (btn) { btn.innerHTML = 'Sifarişi Təsdiq Et'; btn.disabled = false; }
    }, 1500);
};

window.resetForm = function() {
    document.getElementById('step1')?.classList.add('active');
    document.getElementById('step2')?.classList.remove('active');
    document.getElementById('step3')?.classList.remove('active');
    document.getElementById('successMessage')?.classList.add('hidden');
    document.getElementById('addressForm')?.classList.remove('hidden');
    document.querySelectorAll('#addressForm input, #addressForm select').forEach(input => { if (input.type !== 'checkbox') input.value = ''; });
    const diffShipping = document.getElementById('different_shipping'); if (diffShipping) { diffShipping.checked = false; document.getElementById('shippingAddress').style.display = 'none'; }
};

window.validateEmail = function(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); };

// ------------------------
// Price slider
// ------------------------
function initPriceSlider() {
    console.log('✅ Price slider loaded');
    const sliderLeft = document.getElementById('slider-left');
    const sliderRight = document.getElementById('slider-right');
    const leftThumb = document.getElementById('left-thumb');
    const rightThumb = document.getElementById('right-thumb');
    const minInput = document.getElementById('min-price');
    const maxInput = document.getElementById('max-price');
    const progressBar = document.getElementById('slider-progress');
    const applyBtn = document.getElementById('apply-price');
    const resetBtn = document.getElementById('reset-price');
    const priceFilterForm = document.getElementById('price-filter-form');
    const hiddenMin = document.getElementById('hidden-min-price');
    const hiddenMax = document.getElementById('hidden-max-price');

    if (!sliderLeft || !sliderRight || !leftThumb || !rightThumb || !minInput || !maxInput || !progressBar) { console.warn('Price slider elements not found'); return; }

    const min = 0; const max = 10000;
    const urlParams = new URLSearchParams(window.location.search);
    const urlMin = urlParams.get('min_price'); const urlMax = urlParams.get('max_price');
    if (urlMin) sliderLeft.value = urlMin; if (urlMax) sliderRight.value = urlMax;
    minInput.value = sliderLeft.value; maxInput.value = sliderRight.value;

    function updateThumbs() {
        const leftPercent = ((sliderLeft.value - min)/(max-min))*100;
        const rightPercent = ((sliderRight.value - min)/(max-min))*100;
        leftThumb.style.left = leftPercent + '%';
        rightThumb.style.left = rightPercent + '%';
        progressBar.style.left = leftPercent + '%';
        progressBar.style.width = (rightPercent - leftPercent) + '%';
    }

    function updateInputs() {
        minInput.value = sliderLeft.value; maxInput.value = sliderRight.value;
        if (hiddenMin) hiddenMin.value = sliderLeft.value; if (hiddenMax) hiddenMax.value = sliderRight.value;
    }

    updateThumbs();

    sliderLeft.addEventListener('input', function(){ if (parseInt(this.value) > parseInt(sliderRight.value)) this.value = sliderRight.value; updateThumbs(); updateInputs(); });
    sliderRight.addEventListener('input', function(){ if (parseInt(this.value) < parseInt(sliderLeft.value)) this.value = sliderLeft.value; updateThumbs(); updateInputs(); });

    if (applyBtn) applyBtn.addEventListener('click', function(e){ e.preventDefault(); if (hiddenMin) hiddenMin.value = sliderLeft.value; if (hiddenMax) hiddenMax.value = sliderRight.value; if (priceFilterForm) priceFilterForm.submit(); });
    if (resetBtn) resetBtn.addEventListener('click', function(e){ e.preventDefault(); sliderLeft.value = 0; sliderRight.value = 10000; updateThumbs(); updateInputs(); if (hiddenMin) hiddenMin.value = ''; if (hiddenMax) hiddenMax.value = ''; if (priceFilterForm) { const manufacturer = priceFilterForm.querySelector('[name="manufacturer"]')?.value; const category = priceFilterForm.querySelector('[name="category"]')?.value; const color = priceFilterForm.querySelector('[name="color"]')?.value; let url = window.location.pathname + '?'; const params = []; if (manufacturer) params.push('manufacturer=' + manufacturer); if (category) params.push('category=' + category); if (color) params.push('color=' + color); window.location.href = url + params.join('&'); } });

    function setupDragThumb(thumb, isLeft) {
        let isDragging = false;
        thumb.addEventListener('mousedown', function(e){ e.preventDefault(); isDragging = true;
            function onMouseMove(e) {
                if (!isDragging) return;
                const rect = sliderLeft.parentElement.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
                let value = Math.round((percent / 100) * max);
                if (isLeft) { if (value < parseInt(sliderRight.value)) { sliderLeft.value = value; sliderLeft.dispatchEvent(new Event('input')); } }
                else { if (value > parseInt(sliderLeft.value)) { sliderRight.value = value; sliderRight.dispatchEvent(new Event('input')); } }
            }
            function onMouseUp(){ isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); }
            document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
        });
    }
    setupDragThumb(leftThumb, true); setupDragThumb(rightThumb, false);
}

// ------------------------
// Premium badges
// ------------------------
function initPremiumBadges() {
    console.log('✅ Premium badge system loaded');
    const isAccount = window.location.pathname.includes('account') || window.location.pathname.includes('profile') || document.querySelector('.user-profile') !== null;
    if (isAccount) return;
    const isProductPage = document.querySelector('.products-grid, .product-card, .portfolio-item') !== null;
    if (!isProductPage) return;
    if (document.querySelector('.product-detail')) return;
    const cards = document.querySelectorAll('.product-card, .portfolio-item');
    let count = 0;
    cards.forEach(card => {
        if (card.querySelector('.badge, .sale-badge, .discount-badge, .premium-badge')) return;
        if (card.closest('.cart-table, .wishlist-table, .order-summary')) return;
        const badge = document.createElement('span');
        badge.className = 'premium-badge';
        badge.textContent = 'PREMIUM';
        badge.style.cssText = `position:absolute; top:10px; right:10px; background:linear-gradient(135deg,#FFD700,#FFA500); color:#000; font-weight:bold; font-size:12px; padding:4px 12px; border-radius:20px; z-index:10; box-shadow:0 2px 8px rgba(255,215,0,0.3); text-transform:uppercase;`;
        if (window.getComputedStyle(card).position === 'static') card.style.position = 'relative';
        card.appendChild(badge); count++;
    });
    console.log(`✨ Added ${count} premium badges`);
}

// ------------------------
// Product detail badge
// ------------------------
function initProductDetailBadge() {
    console.log('✅ Product detail badge loaded');
    const isProductDetail = document.querySelector('.product-detail, .product-info, [class*="product-detail"]') !== null;
    if (!isProductDetail) return;
    const discountBadge = document.querySelector('.discount-badge-large, .discount-badge, .save-badge, [class*="discount"], [class*="save"]');
    const specialPriceElement = document.querySelector('.special-price-value, .current-price, .product-price, [class*="special-price"], [class*="current-price"]');
    const oldPriceElement = document.querySelector('.was-price, .old-price, .original-price, [class*="old-price"], [class*="was-price"]');
    if (!specialPriceElement || !oldPriceElement) return;
    const specialText = specialPriceElement.textContent.replace(/[₼$€£₺]/g, '').replace(/[^0-9.,]/g,'').replace(',', '.');
    const oldText = oldPriceElement.textContent.replace(/[₼$€£₺]/g, '').replace(/[^0-9.,]/g,'').replace(',', '.');
    const specialPrice = parseFloat(specialText) || 0; const oldPrice = parseFloat(oldText) || 0;
    let discountPercent = 0; let hasDiscount = false;
    if (oldPrice > specialPrice && specialPrice > 0) { discountPercent = Math.round(((oldPrice - specialPrice)/oldPrice)*100); hasDiscount = true; }
    if (discountBadge) {
        if (hasDiscount) { discountBadge.textContent = `Save ${discountPercent}%`; discountBadge.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)'; discountBadge.style.color = 'white'; discountBadge.style.display = 'inline-block'; }
        else { discountBadge.textContent = 'PREMIUM'; discountBadge.style.background = 'linear-gradient(135deg,#FFD700,#FFA500)'; discountBadge.style.color = '#000'; discountBadge.style.display = 'inline-block'; }
    }
    
    if (specialPriceElement && specialPriceElement.textContent.includes('$')) {
        specialPriceElement.textContent = specialPriceElement.textContent.replace(/\$/g, '₼');
    }
    if (oldPriceElement && oldPriceElement.textContent.includes('$')) {
        oldPriceElement.textContent = oldPriceElement.textContent.replace(/\$/g, '₼');
    }
}

// ------------------------
// Order summary scroll helper
// ------------------------
document.addEventListener('DOMContentLoaded', function() {
    const orderItemsContainer = document.querySelector('.order-items-container');
    if (orderItemsContainer) {
        const itemCount = orderItemsContainer.children.length;
        if (itemCount > 3) { orderItemsContainer.style.maxHeight = '350px'; orderItemsContainer.style.overflowY = 'auto'; }
        else { orderItemsContainer.style.maxHeight = 'none'; orderItemsContainer.style.overflowY = 'visible'; }
        orderItemsContainer.addEventListener('wheel', e => e.stopPropagation());
        orderItemsContainer.addEventListener('touchstart', e => e.stopPropagation());
    }
});

// ------------------------
// Small helpers
// ------------------------
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`=\/]/g, function(s) { 
        const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'};
        return map[s] || s;
    });
}

// Dilə görə rəng adlarını yenilə
function updateColorNames() {
    const currentLang = document.documentElement.lang || 'az';
    
    // Rəng adlarını yenilə
    const colorNameElements = document.querySelectorAll('.color-name');
    colorNameElements.forEach(el => {
        const azName = el.dataset.colorAz;
        if (azName) {
            if (currentLang === 'az' || currentLang === 'az-AZ') {
                el.textContent = azName;
            } else if (currentLang === 'en' || currentLang === 'en-US') {
                // İngilis dilinə tərcümə
                const enName = translateColorToEn(azName);
                el.textContent = enName;
            } else if (currentLang === 'ru' || currentLang === 'ru-RU') {
                // Rus dilinə tərcümə
                const ruName = translateColorToRu(azName);
                el.textContent = ruName;
            }
        }
    });
    
    // "Rəng yoxdur!" mesajını yenilə
    const noColorElements = document.querySelectorAll('.color-text');
    noColorElements.forEach(el => {
        if (currentLang === 'az' || currentLang === 'az-AZ') {
            el.textContent = el.dataset.noColorAz || 'Rəng yoxdur!';
        } else if (currentLang === 'en' || currentLang === 'en-US') {
            el.textContent = el.dataset.noColorEn || 'No color!';
        } else if (currentLang === 'ru' || currentLang === 'ru-RU') {
            el.textContent = el.dataset.noColorRu || 'Нет цвета!';
        }
    });
}

// Rəng adlarını İngilis dilinə tərcümə et
function translateColorToEn(azName) {
    const colorMap = {
        'qırmızı': 'Red',
        'mavi': 'Blue',
        'yaşıl': 'Green',
        'sarı': 'Yellow',
        'narıncı': 'Orange',
        'bənövşəyi': 'Purple',
        'çəhrayı': 'Pink',
        'qara': 'Black',
        'ağ': 'White',
        'boz': 'Gray',
        'göy': 'Cyan',
        'qəhvəyi': 'Brown',
        'tünd göy': 'Dark Blue',
        'tünd yaşıl': 'Dark Green',
        'tünd qırmızı': 'Dark Red',
        'bej': 'Beige',
        'qızılı': 'Gold',
        'gümüşü': 'Silver',
        'firuzə': 'Turquoise',
        'açıq yaşıl': 'Light Green',
        'mərcan': 'Coral',
        'qızılbalıq': 'Salmon',
        'xaki': 'Khaki',
        'gavalı': 'Plum',
        'buğda': 'Wheat',
        'lavanda': 'Lavender',
        'xiyar': 'Cucumber'
    };
    return colorMap[azName.toLowerCase()] || azName;
}

// Rəng adlarını Rus dilinə tərcümə et
function translateColorToRu(azName) {
    const colorMap = {
        'qırmızı': 'Красный',
        'mavi': 'Синий',
        'yaşıl': 'Зеленый',
        'sarı': 'Желтый',
        'narıncı': 'Оранжевый',
        'bənövşəyi': 'Фиолетовый',
        'çəhrayı': 'Розовый',
        'qara': 'Черный',
        'ağ': 'Белый',
        'boz': 'Серый',
        'göy': 'Голубой',
        'qəhvəyi': 'Коричневый',
        'tünd göy': 'Темно-синий',
        'tünd yaşıl': 'Темно-зеленый',
        'tünd qırmızı': 'Темно-красный',
        'bej': 'Бежевый',
        'qızılı': 'Золотой',
        'gümüşü': 'Серебряный',
        'firuzə': 'Бирюзовый',
        'açıq yaşıl': 'Светло-зеленый',
        'mərcan': 'Коралловый',
        'qızılbalıq': 'Лососевый',
        'xaki': 'Хаки',
        'gavalı': 'Сливовый',
        'buğda': 'Пшеничный',
        'lavanda': 'Лавандовый',
        'xiyar': 'Огуречный'
    };
    return colorMap[azName.toLowerCase()] || azName;
}

// Dil dəyişmə eventini dinlə
function initColorLanguage() {
    // Səhifə yükləndikdə rəng adlarını yenilə
    updateColorNames();
    
    // Dil dəyişdikdə rəng adlarını yenilə
    const observer = new MutationObserver(() => {
        updateColorNames();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    
    // Dil dəyişmə düymələrinə click eventi
    document.querySelectorAll('.lang-option, .language-selector a, [data-lang], .lang-switcher button').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(updateColorNames, 200);
        });
    });
}

// Səhifə yükləndikdə çağır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initColorLanguage);
} else {
    initColorLanguage();
}