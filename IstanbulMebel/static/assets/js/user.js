// ========== ACCOUNT PAGE - WISHLIST, CART & PROFILE (BİRLƏŞDİRİLMİŞ VERSİYA) ==========
(function() {
    'use strict';
    
    // ============================================================
    // 1. SƏHİFƏNİN ACCOUNT SƏHİFƏSİ OLDUĞUNU YOXLA
    // ============================================================
    const isAccountPage = window.location.pathname.includes('/account') || 
                          window.location.pathname.includes('/my-account') ||
                          window.location.pathname.includes('/users/account') ||
                          document.querySelector('.account-sidebar') !== null ||
                          document.querySelector('.sidebar-menu') !== null ||
                          document.getElementById('wishlist-tab') !== null;
    
    if (!isAccountPage) {
        console.log('Account JS: Not account page');
        return;
    }
    
    if (window._accountFinalized) {
        console.log('Account JS: Already initialized');
        return;
    }
    window._accountFinalized = true;
    
    console.log('✅ Account JS: BİRLƏŞDİRİLMİŞ VERSİYA loaded');
    
    // ============================================================
    // 2. CSRF TOKEN
    // ============================================================
    function getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        if (token && token.value) return token.value;
        
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) return metaToken.getAttribute('content');
        
        const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        if (cookie) return cookie.split('=')[1];
        
        const allInputs = document.querySelectorAll('input[type=hidden]');
        for (let input of allInputs) {
            if (input.name && input.name.toLowerCase().includes('csrf')) {
                return input.value;
            }
        }
        
        return '';
    }
    
    // ============================================================
    // 3. BİLDİRİŞ SİSTEMİ
    // ============================================================
    function showMessage(message, type = 'success') {
        const oldMsg = document.querySelector('.account-toast');
        if (oldMsg) oldMsg.remove();
        
        const toast = document.createElement('div');
        toast.className = 'account-toast';
        
        let bgColor, icon;
        if (type === 'success') {
            bgColor = '#10b981';
            icon = 'fa-check-circle';
        } else if (type === 'error') {
            bgColor = '#ef4444';
            icon = 'fa-exclamation-circle';
        } else {
            bgColor = '#f59e0b';
            icon = 'fa-exclamation-triangle';
        }
        
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 14px 24px;
            background: ${bgColor};
            color: white;
            border-radius: 12px;
            z-index: 999999;
            font-size: 14px;
            font-weight: 500;
            font-family: system-ui, sans-serif;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
            animation: slideInUp 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        `;
        
        toast.innerHTML = `<i class="fas ${icon}" style="font-size: 18px;"></i> <span>${message}</span>`;
        document.body.appendChild(toast);
        
        toast.onclick = () => toast.remove();
        
        setTimeout(() => {
            if (toast && toast.remove) toast.remove();
        }, 3000);
    }
    
    // ============================================================
    // 4. QİYMƏTİ TƏMİZLƏ - VALYUTA SİMVOLLARINI TƏMİZLƏ
    // ============================================================
    function cleanPrice(priceText) {
        if (!priceText) return 0;
        if (typeof priceText === 'number') return priceText;
        
        let cleaned = priceText.toString();
        
        // $, ₼, €, £, ₺, ₽, ¥ simvolları təmizlə
        cleaned = cleaned.replace(/[$₼€£₺₽¥]/g, '');
        
        // Vergülü nöqtəyə çevir
        if (cleaned.includes(',') && cleaned.includes('.')) {
            cleaned = cleaned.replace(/,/g, '');
        } else if (cleaned.includes(',') && !cleaned.includes('.')) {
            const parts = cleaned.split(',');
            if (parts.length === 2 && parts[1].length === 2) {
                cleaned = parts[0] + '.' + parts[1];
            } else {
                cleaned = cleaned.replace(/,/g, '');
            }
        }
        
        cleaned = cleaned.replace(/[^0-9.-]/g, '');
        
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    // ============================================================
    // 5. FORMATLI QİYMƏT GÖSTƏR
    // ============================================================
    function formatPrice(price) {
        return `₼${price.toFixed(2)}`;
    }
    
    // ============================================================
    // 6. BADGE SAYLARINI YENİLƏ
    // ============================================================
    function updateBadges(cartCount, wishlistCount) {
        if (cartCount !== undefined) {
            const cartSelectors = ['[data-tab="carts"] .menu-badge', '.carts-badge', '.cart-count', '.badge-cart', '.cart-badge'];
            cartSelectors.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) {
                    el.textContent = cartCount;
                    el.style.display = cartCount === 0 ? 'none' : 'inline-block';
                }
            });
        }
        
        if (wishlistCount !== undefined) {
            const wishlistSelectors = ['[data-tab="wishlist"] .menu-badge', '.wishlist-badge', '.wishlist-count', '.badge-wishlist', '.wishlist-badge'];
            wishlistSelectors.forEach(sel => {
                const el = document.querySelector(sel);
                if (el) {
                    el.textContent = wishlistCount;
                    el.style.display = wishlistCount === 0 ? 'none' : 'inline-block';
                }
            });
        }
    }
    
    // ============================================================
    // 7. SERVER SORĞUSU
    // ============================================================
    async function sendRequest(action, data) {
        const formData = new FormData();
        const csrf = getCSRFToken();
        if (csrf) formData.append('csrfmiddlewaretoken', csrf);
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
            console.log(`📦 ${action} response:`, result);
            return result;
        } catch (error) {
            console.error('Request error:', error);
            return { status: 'error', message: 'Network error!' };
        }
    }
    
    // ============================================================
    // 8. BÜTÜN AD ELEMENTLƏRİNİ YENİLƏ (Main1.js-dən təkmilləşdirilmiş)
    // ============================================================
    function updateAllNameDisplays(firstName, lastName) {
        const fullName = `${firstName} ${lastName}`.trim();
        
        const allNameElements = document.querySelectorAll(`
            .user-name, .profile-name, .sidebar-user-name, .account-name,
            .full-name, .profile-fullname, .welcome-text, .greeting,
            #user-name, #profile-name, .navbar-user-name, .header-user-name,
            .dropdown-user-name, .account-user-name, .user-fullname, .display-name,
            [data-user-name], .user-greeting, .profile-greeting, .name-display,
            .sidebar .user-name, .profile-sidebar .user-name, .sidebar-menu .user-name
        `);
        
        allNameElements.forEach(el => {
            if (el && el.textContent !== fullName && fullName) {
                el.textContent = fullName;
            }
        });
        
        const firstNameInput = document.querySelector('#first_name, [name="first_name"], #id_first_name');
        const lastNameInput = document.querySelector('#last_name, [name="last_name"], #id_last_name');
        
        if (firstNameInput && firstNameInput.value !== firstName) {
            firstNameInput.value = firstName;
        }
        if (lastNameInput && lastNameInput.value !== lastName) {
            lastNameInput.value = lastName;
        }
    }
    
    // ============================================================
    // 9. BÜTÜN PROFİL MƏLUMATLARINI YENİLƏ (ANINDA - Main1.js-dən təkmilləşdirilmiş)
    // ============================================================
    function updateAllProfileElements(data) {
        console.log('🔄 Updating all profile elements with:', data);
        
        // Ad və Soyad
        const firstName = data.first_name || data.user?.first_name || '';
        const lastName = data.last_name || data.user?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (fullName) {
            const nameSelectors = [
                '.sidebar-user-name', '.sidebar-menu .user-name', '.account-sidebar .user-name',
                '.profile-sidebar .user-name', '.profile-name', '.account-name', '.user-name',
                '.profile-fullname', '.full-name', '.welcome-text', '.greeting',
                '.sidebar .user-name', '#sidebar-user-name', '.navbar-user-name'
            ];
            nameSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (el && el.textContent !== fullName) {
                        el.textContent = fullName;
                    }
                });
            });
        }
        
        // Telefon
        const phone = data.phone || data.profile?.phone || '';
        if (phone) {
            const phoneInput = document.querySelector('#phone, [name="phone"], #id_phone');
            if (phoneInput) phoneInput.value = phone;
            document.querySelectorAll('.user-phone, .profile-phone, .phone-number').forEach(el => {
                if (el) el.textContent = phone;
            });
        }
        
        // Doğum tarixi
        const birthdate = data.birthdate || data.profile?.birthdate || '';
        if (birthdate) {
            const birthdateInput = document.querySelector('#birthdate, [name="birthdate"], #id_birthdate, input[type="date"]');
            if (birthdateInput) birthdateInput.value = birthdate;
        }
        
        // Cinsiyyət
        const gender = data.gender || data.profile?.gender || '';
        if (gender) {
            const genderRadio = document.querySelector(`input[name="gender"][value="${gender}"]`);
            if (genderRadio) {
                genderRadio.checked = true;
            }
            const genderSelect = document.querySelector('#gender, [name="gender"], select[name="gender"]');
            if (genderSelect) genderSelect.value = gender;
        }
        
        // Təkliflər checkbox
        if (data.profile?.receive_offers !== undefined) {
            const offersCheckbox = document.querySelector('#receive_offers, [name="receive_offers"]');
            if (offersCheckbox) offersCheckbox.checked = data.profile.receive_offers;
        }
        
        // Newsletter checkbox
        if (data.profile?.subscribe_newsletter !== undefined) {
            const newsletterCheckbox = document.querySelector('#subscribe_newsletter, [name="subscribe_newsletter"]');
            if (newsletterCheckbox) newsletterCheckbox.checked = data.profile.subscribe_newsletter;
        }
        
        console.log('✅ All profile elements updated instantly!');
    }
    
    // ============================================================
    // 10. PROFİL MƏLUMATLARINI YENİLƏ (Main1.js-dən təkmilləşdirilmiş versiya)
    // ============================================================
    window.updateProfileInfoAJAX = async function(submitBtn, event) {
        if (event && event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const firstNameInput = document.querySelector('#first_name, [name="first_name"], #id_first_name');
        const lastNameInput = document.querySelector('#last_name, [name="last_name"], #id_last_name');
        const phoneInput = document.querySelector('#phone, [name="phone"], #id_phone');
        const birthdateInput = document.querySelector('#birthdate, [name="birthdate"], #id_birthdate, input[type="date"]');
        
        let gender = '';
        const genderRadio = document.querySelector('input[name="gender"]:checked');
        if (genderRadio) {
            gender = genderRadio.value;
        } else {
            gender = document.querySelector('#gender, [name="gender"], select[name="gender"]')?.value || '';
        }
        
        const receiveOffers = document.querySelector('#receive_offers, [name="receive_offers"]')?.checked || false;
        const subscribeNewsletter = document.querySelector('#subscribe_newsletter, [name="subscribe_newsletter"]')?.checked || false;
        
        const firstName = firstNameInput?.value || '';
        const lastName = lastNameInput?.value || '';
        const phone = phoneInput?.value || '';
        const birthdate = birthdateInput?.value || '';
        
        const btn = submitBtn || event?.target?.closest('button[type="submit"]');
        const originalHtml = btn?.innerHTML || 'Update';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yenilənir...';
        }
        
        const result = await sendRequest('update_profile', {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            birthdate: birthdate,
            gender: gender,
            receive_offers: receiveOffers ? 'on' : '',
            subscribe_newsletter: subscribeNewsletter ? 'on' : ''
        });
        
        if (result.status === 'success') {
            const updatedData = {
                first_name: result.user?.first_name || result.first_name || firstName,
                last_name: result.user?.last_name || result.last_name || lastName,
                phone: result.profile?.phone || result.phone || phone,
                birthdate: result.profile?.birthdate || result.birthdate || birthdate,
                gender: result.profile?.gender || result.gender || gender,
                profile: result.profile || {}
            };
            
            // Bütün profil elementlərini anında yenilə
            updateAllProfileElements(updatedData);
            
            showMessage(result.message || '✅ Profil məlumatları yeniləndi!', 'success');
        } else {
            showMessage(result.message || '❌ Xəta baş verdi!', 'error');
        }
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    };
    
    // ============================================================
    // 11. PROFİL ŞƏKLİ YÜKLƏ
    // ============================================================
    window.uploadProfileImage = async function(inputElement) {
        const file = inputElement.files[0];
        if (!file) {
            showMessage('Please select an image!', 'warning');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showMessage('Please select an image file (JPG, PNG, GIF)!', 'error');
            inputElement.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Image size must be less than 5MB!', 'error');
            inputElement.value = '';
            return;
        }
        
        // Optimistik olaraq şəkli göstər
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgSelectors = '.profile-avatar img, .profile-image img, .avatar img, .user-avatar img, #profile-image-preview';
            document.querySelectorAll(imgSelectors).forEach(img => {
                img.src = e.target.result;
            });
        };
        reader.readAsDataURL(file);
        
        const formData = new FormData();
        const csrf = getCSRFToken();
        if (csrf) formData.append('csrfmiddlewaretoken', csrf);
        formData.append('update_profile_image', 'true');
        formData.append('profile_image', file);
        
        const uploadBtn = document.querySelector('#upload-photo-btn, .upload-photo-btn, button[title*="Upload"]');
        const originalHtml = uploadBtn?.innerHTML || 'Upload';
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        }
        
        try {
            const response = await fetch(window.location.href, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                showMessage(result.message || '✅ Profile image updated!', 'success');
                
                if (result.image_url) {
                    const newUrl = result.image_url + '?t=' + Date.now();
                    const imgSelectors = '.profile-avatar img, .profile-image img, .avatar img, .user-avatar img, #profile-image-preview';
                    document.querySelectorAll(imgSelectors).forEach(img => {
                        img.src = newUrl;
                    });
                }
                
                inputElement.value = '';
            } else {
                showMessage(result.message || '❌ Error uploading image!', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showMessage('❌ Network error!', 'error');
        }
        
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = originalHtml;
        }
    };
    
    // ============================================================
    // 12. PROFİL ŞƏKLİ SİL
    // ============================================================
    window.deleteProfileImage = async function(btn) {
        if (!confirm('Are you sure you want to delete your profile picture?')) return;
        
        const originalHtml = btn?.innerHTML || 'Delete';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        const result = await sendRequest('delete_profile_image', {});
        
        if (result.status === 'success') {
            showMessage(result.message || '✅ Profile image deleted!', 'success');
            
            const defaultAvatar = '/static/images/default-avatar.png';
            const imgSelectors = '.profile-avatar img, .profile-image img, .avatar img, .user-avatar img, #profile-image-preview';
            document.querySelectorAll(imgSelectors).forEach(img => {
                img.src = defaultAvatar + '?t=' + Date.now();
            });
        } else {
            showMessage(result.message || '❌ Error deleting image!', 'error');
        }
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    };
    
    // ============================================================
    // 13. SƏBƏTDƏN SİL
    // ============================================================
    window.removeFromCart = async function(productId, btn, skipConfirm = false) {
        if (!skipConfirm) {
            if (!confirm('Məhsulu səbətdən silmek istədiyinizə əminsiniz?')) return;
        }
        
        const row = btn?.closest('tr.cart-item');
        
        const originalHtml = btn?.innerHTML;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        const result = await sendRequest('remove_from_cart', { product_id: productId });
        
        if (result.status === 'success') {
            if (row) {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    updateBadges(result.cart_count, result.wishlist_count);
                    updateCartTotal();
                    showMessage('✅ Item removed from cart', 'success');
                    
                    const tbody = document.querySelector('#cart-table-body');
                    if (tbody && tbody.querySelectorAll('tr.cart-item').length === 0) {
                        location.reload();
                    }
                }, 200);
            } else {
                location.reload();
            }
        } else {
            showMessage(result.message || 'Error!', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }
    };
    
    // ============================================================
    // 14. SƏBƏTDƏ MİQDAR YENİLƏ
    // ============================================================
    window.updateQuantity = async function(btn, change, productId) {
        const row = btn?.closest('tr.cart-item');
        if (!row) {
            console.error('❌ Row not found!');
            showMessage('Xəta: Sətir tapılmadı!', 'error');
            return;
        }
        
        const qtySpan = row.querySelector('.qty-value');
        if (!qtySpan) {
            console.error('❌ Quantity element not found!');
            showMessage('Xəta: Miqdar elementi tapılmadı!', 'error');
            return;
        }
        
        let unitPrice = null;
        
        if (row.dataset.unitPrice) {
            unitPrice = parseFloat(row.dataset.unitPrice);
        }
        
        if (!unitPrice || isNaN(unitPrice)) {
            const priceSpan = row.querySelector('.price');
            if (priceSpan) {
                const dataPrice = priceSpan.dataset.price;
                if (dataPrice) {
                    unitPrice = cleanPrice(dataPrice);
                } else {
                    unitPrice = cleanPrice(priceSpan.textContent);
                }
                
                const currentQty = parseInt(qtySpan.textContent) || 1;
                if (currentQty > 1 && unitPrice > 10000) {
                    unitPrice = unitPrice / currentQty;
                }
            }
        }
        
        if (!unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
            const totalSpan = row.querySelector('.total-price');
            const currentQty = parseInt(qtySpan.textContent) || 1;
            if (totalSpan && currentQty > 0) {
                const totalValue = cleanPrice(totalSpan.textContent);
                unitPrice = totalValue / currentQty;
            }
        }
        
        if (!unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
            console.error('❌ Could not determine unit price!');
            showMessage('Qiymət məlumatı tapılmadı!', 'error');
            return;
        }
        
        if (!row.dataset.unitPrice) {
            row.dataset.unitPrice = unitPrice;
        }
        
        let currentQty = parseInt(qtySpan.textContent) || 1;
        let newQty = currentQty + change;
        
        if (newQty <= 0) {
            await window.removeFromCart(productId, btn, true);
            return;
        }
        
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const result = await sendRequest('update_cart_quantity', { 
            product_id: productId, 
            quantity: newQty 
        });
        
        if (result.status === 'success') {
            qtySpan.textContent = newQty;
            
            const qtyInput = row.querySelector('.quantity-input');
            if (qtyInput) qtyInput.value = newQty;
            
            const newTotal = unitPrice * newQty;
            
            const totalSpan = row.querySelector('.total-price');
            if (totalSpan) {
                totalSpan.textContent = formatPrice(newTotal);
            }
            
            updateCartTotal();
            updateBadges(result.cart_count, result.wishlist_count);
            
            showMessage(`✅ Miqdar: ${newQty} | Cəmi: ${formatPrice(newTotal)}`, 'success');
        } else {
            showMessage(result.message || 'Xəta baş verdi!', 'error');
            qtySpan.textContent = currentQty;
        }
        
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    };
    
    // ============================================================
    // 15. ÜMUMİ SƏBƏT CƏMİNİ YENİLƏ
    // ============================================================
    function updateCartTotal() {
        let total = 0;
        const allRows = document.querySelectorAll('#cart-table-body tr.cart-item');
        
        allRows.forEach(row => {
            const totalSpan = row.querySelector('.total-price');
            if (totalSpan) {
                const price = cleanPrice(totalSpan.textContent);
                if (!isNaN(price)) {
                    total += price;
                }
            }
        });
        
        const subtotalElement = document.querySelector('#cart-subtotal, .cart-subtotal, .subtotal-amount');
        if (subtotalElement) {
            subtotalElement.innerHTML = `Cəmi: ${formatPrice(total)}`;
        }
        
        const totalElements = document.querySelectorAll('.cart-grand-total, .total-amount, #cart-total, .cart-total');
        totalElements.forEach(el => {
            el.textContent = formatPrice(total);
        });
        
        console.log(`💰 Cart total updated: ${formatPrice(total)}`);
        return total;
    }
    
    // ============================================================
    // 16. WISHLIST-DƏN SİL
    // ============================================================
    window.removeFromWishlist = async function(productId, btn) {
        if (!confirm('Remove from wishlist?')) return;
        
        const row = btn?.closest('tr.wishlist-item');
        
        const originalHtml = btn?.innerHTML;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        const result = await sendRequest('remove_from_wishlist', { product_id: productId });
        
        if (result.status === 'success') {
            if (row) {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    updateBadges(result.cart_count, result.wishlist_count);
                    showMessage(`🗑️ Removed from wishlist`, 'success');
                    
                    const tbody = document.querySelector('#wishlist-table-body');
                    if (tbody && tbody.querySelectorAll('tr.wishlist-item').length === 0) {
                        location.reload();
                    }
                }, 200);
            }
        } else {
            showMessage(result.message || 'Error!', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }
    };
    
    // ============================================================
    // 17. WISHLIST-DƏN SƏBƏTƏ ƏLAVƏ
    // ============================================================
    window.addToCartFromWishlist = async function(productId, btn) {
        const row = btn?.closest('tr.wishlist-item');
        
        const originalHtml = btn?.innerHTML;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        const result = await sendRequest('add_to_cart', { product_id: productId });
        
        if (result.status === 'success') {
            if (row) {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    updateBadges(result.cart_count, result.wishlist_count);
                    showMessage(`✅ Added to cart`, 'success');
                }, 200);
            }
        } else {
            showMessage(result.message || 'Error!', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }
    };
    
    // ============================================================
    // 18. WISHLIST AXTARIŞ FUNKSİYASI
    // ============================================================
    function initWishlistSearch() {
        const searchInput = document.getElementById('wishlist-search');
        if (!searchInput) return;
        
        console.log('🔍 Wishlist search initialized');
        
        let resultCountSpan = document.getElementById('wishlist-search-count');
        if (!resultCountSpan) {
            resultCountSpan = document.createElement('span');
            resultCountSpan.id = 'wishlist-search-count';
            resultCountSpan.className = 'search-result-count';
            resultCountSpan.style.cssText = 'font-size: 12px; color: #64748b; margin-left: 10px; font-weight: normal;';
            const headerElement = searchInput.closest('.section-header');
            if (headerElement) {
                const h2 = headerElement.querySelector('h2');
                if (h2 && !h2.querySelector('#wishlist-search-count')) {
                    h2.appendChild(resultCountSpan);
                }
            }
        }
        
        const searchBox = searchInput.closest('.search-box');
        let clearBtn = searchBox?.querySelector('.clear-search');
        if (searchBox && !clearBtn) {
            clearBtn = document.createElement('button');
            clearBtn.className = 'clear-search';
            clearBtn.innerHTML = '<i class="fas fa-times"></i>';
            clearBtn.style.cssText = `
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                display: none;
                font-size: 12px;
                padding: 4px;
                border-radius: 50%;
                z-index: 10;
            `;
            searchBox.style.position = 'relative';
            searchBox.appendChild(clearBtn);
            
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                filterWishlistTable('');
                clearBtn.style.display = 'none';
                searchInput.focus();
            });
            
            searchInput.addEventListener('input', () => {
                clearBtn.style.display = searchInput.value ? 'flex' : 'none';
            });
        }
        
        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                filterWishlistTable(this.value);
            }, 300);
        });
        
        function filterWishlistTable(searchTerm) {
            const tableBody = document.querySelector('#wishlist-table-body');
            if (!tableBody) return;
            
            const rows = tableBody.querySelectorAll('tr.wishlist-item');
            let visibleCount = 0;
            const searchLower = searchTerm.toLowerCase().trim();
            
            rows.forEach(row => {
                const productNameEl = row.querySelector('.product-name');
                let productName = productNameEl ? productNameEl.textContent.toLowerCase() : '';
                
                const matches = searchLower === '' || productName.includes(searchLower);
                
                if (matches) {
                    row.style.display = '';
                    visibleCount++;
                    addHighlightAnimation(row);
                    highlightSearchMatch(row, searchLower);
                } else {
                    row.style.display = 'none';
                }
            });
            
            if (resultCountSpan) {
                if (searchLower) {
                    resultCountSpan.textContent = `(${visibleCount} nəticə)`;
                    resultCountSpan.style.display = 'inline';
                } else {
                    resultCountSpan.style.display = 'none';
                    resultCountSpan.textContent = '';
                }
            }
            
            const existingEmptyMsg = tableBody.querySelector('.empty-search-message');
            if (searchLower && visibleCount === 0) {
                if (!existingEmptyMsg) {
                    const msgRow = document.createElement('tr');
                    msgRow.className = 'empty-search-message';
                    msgRow.innerHTML = `<td colspan="5" style="text-align: center; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 48px; color: #cbd5e1; margin-bottom: 15px; display: block;"></i>
                        <p style="color: #64748b;">"${escapeHtml(searchTerm)}" üçün heç bir nəticə tapılmadı</p>
                    </table>`;
                    tableBody.appendChild(msgRow);
                }
            } else {
                if (existingEmptyMsg) existingEmptyMsg.remove();
            }
        }
        
        function highlightSearchMatch(row, searchTerm) {
            if (!searchTerm) return;
            
            clearAllHighlights(row);
            
            const productNameEl = row.querySelector('.product-name');
            if (productNameEl) {
                const originalText = productNameEl.textContent;
                if (originalText.toLowerCase().includes(searchTerm.toLowerCase())) {
                    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
                    productNameEl.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
                }
            }
        }
        
        function clearAllHighlights(row) {
            const highlights = row.querySelectorAll('.search-highlight');
            highlights.forEach(el => {
                const parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            });
        }
        
        function addHighlightAnimation(row) {
            setTimeout(() => {
                row.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                row.style.backgroundColor = '#e0f2fe';
                row.style.boxShadow = '0 0 0 3px #38bdf8';
                
                setTimeout(() => {
                    row.style.backgroundColor = '';
                    row.style.boxShadow = '';
                }, 800);
            }, 10);
        }
        
        function escapeRegex(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }
    }
    
    // ============================================================
    // 19. CART AXTARIŞ FUNKSİYASI
    // ============================================================
    function initCartSearch() {
        const searchInput = document.getElementById('cart-search');
        if (!searchInput) return;
        
        console.log('🔍 Cart search initialized');
        
        let resultCountSpan = document.getElementById('cart-search-count');
        if (!resultCountSpan) {
            resultCountSpan = document.createElement('span');
            resultCountSpan.id = 'cart-search-count';
            resultCountSpan.className = 'search-result-count';
            resultCountSpan.style.cssText = 'font-size: 12px; color: #64748b; margin-left: 10px; font-weight: normal;';
            const headerElement = searchInput.closest('.section-header');
            if (headerElement) {
                const h2 = headerElement.querySelector('h2');
                if (h2 && !h2.querySelector('#cart-search-count')) {
                    h2.appendChild(resultCountSpan);
                }
            }
        }
        
        const searchBox = searchInput.closest('.search-box');
        let clearBtn = searchBox?.querySelector('.clear-search');
        if (searchBox && !clearBtn) {
            clearBtn = document.createElement('button');
            clearBtn.className = 'clear-search';
            clearBtn.innerHTML = '<i class="fas fa-times"></i>';
            clearBtn.style.cssText = `
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                display: none;
                font-size: 12px;
                padding: 4px;
                border-radius: 50%;
                z-index: 10;
            `;
            searchBox.style.position = 'relative';
            searchBox.appendChild(clearBtn);
            
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                filterCartTable('');
                clearBtn.style.display = 'none';
                searchInput.focus();
            });
            
            searchInput.addEventListener('input', () => {
                clearBtn.style.display = searchInput.value ? 'flex' : 'none';
            });
        }
        
        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                filterCartTable(this.value);
            }, 300);
        });
        
        function filterCartTable(searchTerm) {
            const tableBody = document.querySelector('#cart-table-body');
            if (!tableBody) return;
            
            const rows = tableBody.querySelectorAll('tr.cart-item');
            let visibleCount = 0;
            const searchLower = searchTerm.toLowerCase().trim();
            
            rows.forEach(row => {
                const productNameEl = row.querySelector('.product-name');
                let productName = productNameEl ? productNameEl.textContent.toLowerCase() : '';
                
                const matches = searchLower === '' || productName.includes(searchLower);
                
                if (matches) {
                    row.style.display = '';
                    visibleCount++;
                    addHighlightAnimation(row);
                    highlightSearchMatch(row, searchLower);
                } else {
                    row.style.display = 'none';
                }
            });
            
            if (resultCountSpan) {
                if (searchLower) {
                    resultCountSpan.textContent = `(${visibleCount} nəticə)`;
                    resultCountSpan.style.display = 'inline';
                } else {
                    resultCountSpan.style.display = 'none';
                    resultCountSpan.textContent = '';
                }
            }
            
            const existingEmptyMsg = tableBody.querySelector('.empty-search-message');
            if (searchLower && visibleCount === 0) {
                if (!existingEmptyMsg) {
                    const msgRow = document.createElement('tr');
                    msgRow.className = 'empty-search-message';
                    msgRow.innerHTML = `<td colspan="5" style="text-align: center; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 48px; color: #cbd5e1; margin-bottom: 15px; display: block;"></i>
                        <p style="color: #64748b;">"${escapeHtml(searchTerm)}" üçün heç bir nəticə tapılmadı</p>
                    </table>`;
                    tableBody.appendChild(msgRow);
                }
            } else {
                if (existingEmptyMsg) existingEmptyMsg.remove();
            }
            
            updateCartTotal();
        }
        
        function highlightSearchMatch(row, searchTerm) {
            if (!searchTerm) return;
            
            clearAllHighlights(row);
            
            const productNameEl = row.querySelector('.product-name');
            if (productNameEl) {
                const originalText = productNameEl.textContent;
                if (originalText.toLowerCase().includes(searchTerm.toLowerCase())) {
                    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
                    productNameEl.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
                }
            }
        }
        
        function clearAllHighlights(row) {
            const highlights = row.querySelectorAll('.search-highlight');
            highlights.forEach(el => {
                const parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            });
        }
        
        function addHighlightAnimation(row) {
            setTimeout(() => {
                row.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                row.style.backgroundColor = '#e0f2fe';
                row.style.boxShadow = '0 0 0 3px #38bdf8';
                
                setTimeout(() => {
                    row.style.backgroundColor = '';
                    row.style.boxShadow = '';
                }, 800);
            }, 10);
        }
        
        function escapeRegex(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }
    }
    
    // ============================================================
    // 20. EVENT LİSTENERLƏR (Təkmilləşdirilmiş)
    // ============================================================
    function attachEventListeners() {
        console.log('🔄 Attaching event listeners...');
        
        // Profil yeniləmə düymələri
        const profileBtns = document.querySelectorAll('#update-profile-btn, .update-profile-btn, .btn-save-profile, .save-profile-btn, [data-action="update-profile"], #save-profile-btn');
        profileBtns.forEach(btn => {
            if (!btn.dataset._attached) {
                btn.dataset._attached = 'true';
                const newBtn = btn.cloneNode(true);
                btn.parentNode?.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.updateProfileInfoAJAX(newBtn, e);
                });
            }
        });
        
        // Profil formu
        const profileForm = document.querySelector('#profile-form, .profile-form');
        if (profileForm && !profileForm.dataset._attached) {
            profileForm.dataset._attached = 'true';
            const newForm = profileForm.cloneNode(true);
            profileForm.parentNode?.replaceChild(newForm, profileForm);
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = newForm.querySelector('button[type="submit"]');
                if (btn) window.updateProfileInfoAJAX(btn, e);
                else window.updateProfileInfoAJAX(null, e);
            });
        }
        
        // Şəkil yükləmə inputu
        const photoInput = document.querySelector('#profile-image-input, input[type="file"][accept*="image"], input[name="profile_image"]');
        if (photoInput && !photoInput.dataset._attached) {
            photoInput.dataset._attached = 'true';
            const newInput = photoInput.cloneNode(true);
            photoInput.parentNode?.replaceChild(newInput, photoInput);
            newInput.addEventListener('change', () => window.uploadProfileImage(newInput));
        }
        
        // Şəkil silmə düyməsi
        const deletePhotoBtn = document.querySelector('#delete-photo-btn, .delete-photo-btn');
        if (deletePhotoBtn && !deletePhotoBtn.dataset._attached) {
            deletePhotoBtn.dataset._attached = 'true';
            const newBtn = deletePhotoBtn.cloneNode(true);
            deletePhotoBtn.parentNode?.replaceChild(newBtn, deletePhotoBtn);
            newBtn.addEventListener('click', () => window.deleteProfileImage(newBtn));
        }
        
        initWishlistSearch();
        initCartSearch();
    }
    
    // ============================================================
    // 21. MUTASİYA OBSERVER
    // ============================================================
    let observerTimeout;
    const observer = new MutationObserver(() => {
        if (observerTimeout) clearTimeout(observerTimeout);
        observerTimeout = setTimeout(attachEventListeners, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // ============================================================
    // 22. İNİT
    // ============================================================
    function init() {
        setTimeout(() => {
            attachEventListeners();
            updateCartTotal();
            console.log('✅ Account JS BİRLƏŞDİRİLMİŞ VERSİYA initialized');
            console.log('📍 Profil məlumatları səhifə yenilənmədən anında yenilənir!');
        }, 500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ============================================================
    // 23. CSS
    // ============================================================
    if (!document.querySelector('#account-final-styles')) {
        const style = document.createElement('style');
        style.id = 'account-final-styles';
        style.textContent = `
            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .search-highlight {
                background: #fef08a;
                color: #1e293b;
                padding: 2px 5px;
                border-radius: 6px;
                font-weight: 600;
                display: inline-block;
            }
            .clear-search {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                transition: all 0.2s;
            }
            .clear-search:hover {
                background: #e2e8f0;
                color: #ef4444;
            }
            .wishlist-item, .cart-item {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .qty-btn {
                transition: all 0.2s ease;
            }
            .qty-btn:active {
                transform: scale(0.92);
            }
            .profile-avatar img, .profile-image img, .avatar img {
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
})();