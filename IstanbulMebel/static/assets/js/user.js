

// ========== ACCOUNT PAGE - WISHLIST, CART & PROFILE (TƏMİZLƏNMİŞ VERSİYA - COMMENTS SİLİNDİ) ==========
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
    
    console.log('✅ Account JS: CLEAN VERSION loaded (No comments)');
    
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
    // 4. ELEMENTİ YENİLƏ
    // ============================================================
    function updateElement(selector, value, isInput = false) {
        if (!value && value !== 0) return false;
        
        try {
            const elements = document.querySelectorAll(selector);
            let updated = false;
            
            elements.forEach(el => {
                if (el) {
                    if (isInput || el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                        if (el.value !== String(value)) {
                            el.value = value;
                            updated = true;
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } else {
                        if (el.textContent !== String(value)) {
                            el.textContent = value;
                            updated = true;
                        }
                    }
                }
            });
            
            return updated;
        } catch(e) {
            console.warn(`Update error ${selector}:`, e);
            return false;
        }
    }
    
    // ============================================================
    // 5. BADGE SAYLARINI YENİLƏ
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
    // 6. CART TOTAL YENİLƏ
    // ============================================================
    function updateCartTotal() {
        try {
            let total = 0;
            const rows = document.querySelectorAll('#cart-table-body tr:not(.empty-state-row)');
            
            rows.forEach(row => {
                const totalEl = row.querySelector('.total-price, .item-total');
                if (totalEl && totalEl.textContent) {
                    const price = parseFloat(totalEl.textContent.replace(/[^0-9.-]/g, ''));
                    if (!isNaN(price)) total += price;
                }
            });
            
            const subtotalEls = document.querySelectorAll('#cart-subtotal, .cart-total, .subtotal-value');
            subtotalEls.forEach(el => {
                if (el) el.textContent = `$${total.toFixed(2)}`;
            });
            
            return total;
        } catch(e) {
            console.warn('Cart total error:', e);
            return 0;
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
    // 8. AD VƏ SOYADI DƏRHAL YENİLƏ
    // ============================================================
    function updateAllNameDisplays(firstName, lastName) {
        console.log('🔄 Updating name displays:', firstName, lastName);
        
        const fullName = `${firstName} ${lastName}`.trim();
        
        const allNameElements = document.querySelectorAll(`
            .user-name, .profile-name, .sidebar-user-name, .account-name,
            .full-name, .profile-fullname, .welcome-text, .greeting,
            #user-name, #profile-name, .navbar-user-name, .header-user-name,
            .dropdown-user-name, span.user-name, div.user-name, .account-user-name,
            .dashboard-user-name, .user-display-name, .profile-header-name,
            .card-title, .account-username, .user-fullname, .display-name,
            [data-user-name], .user-greeting, .profile-greeting, .name-display
        `);
        
        allNameElements.forEach(el => {
            if (el && el.textContent !== fullName && fullName) {
                el.textContent = fullName;
                console.log(`  ✓ Updated: ${el.tagName}.${el.className} -> "${fullName}"`);
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
    // 9. PROFİL MƏLUMATLARINI YENİLƏ
    // ============================================================
    window.updateProfileData = async function(button) {
        console.log('🟢 updateProfileData STARTED');
        
        const firstName = document.querySelector('#first_name, [name="first_name"], #id_first_name')?.value || '';
        const lastName = document.querySelector('#last_name, [name="last_name"], #id_last_name')?.value || '';
        const phone = document.querySelector('#phone, [name="phone"], #id_phone')?.value || '';
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
        
        console.log('📤 Sending:', { firstName, lastName, phone, birthdate, gender });
        
        const originalHtml = button?.innerHTML || 'Update';
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
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
        
        console.log('📥 Server result:', result);
        
        if (result.status === 'success') {
            let newFirstName = firstName;
            let newLastName = lastName;
            
            if (result.user) {
                newFirstName = result.user.first_name || firstName;
                newLastName = result.user.last_name || lastName;
            } else if (result.first_name) {
                newFirstName = result.first_name;
                newLastName = result.last_name || lastName;
            }
            
            updateAllNameDisplays(newFirstName, newLastName);
            
            const phoneValue = result.profile?.phone || result.phone || phone;
            if (phoneValue) {
                const phoneInput = document.querySelector('#phone, [name="phone"], #id_phone');
                if (phoneInput) phoneInput.value = phoneValue;
            }
            
            const birthdateValue = result.profile?.birthdate || result.birthdate || birthdate;
            if (birthdateValue) {
                const birthdateInput = document.querySelector('#birthdate, [name="birthdate"], #id_birthdate, input[type="date"]');
                if (birthdateInput) birthdateInput.value = birthdateValue;
            }
            
            const genderValue = result.profile?.gender || result.gender || gender;
            if (genderValue) {
                const genderRadioToCheck = document.querySelector(`input[name="gender"][value="${genderValue}"]`);
                if (genderRadioToCheck) genderRadioToCheck.checked = true;
            }
            
            if (result.profile) {
                const offersCheckbox = document.querySelector('#receive_offers, [name="receive_offers"]');
                if (offersCheckbox && result.profile.receive_offers !== undefined) {
                    offersCheckbox.checked = result.profile.receive_offers;
                }
                
                const newsletterCheckbox = document.querySelector('#subscribe_newsletter, [name="subscribe_newsletter"]');
                if (newsletterCheckbox && result.profile.subscribe_newsletter !== undefined) {
                    newsletterCheckbox.checked = result.profile.subscribe_newsletter;
                }
            }
            
            showMessage(result.message || '✅ Profile updated successfully!', 'success');
            console.log('✅ Name updated WITHOUT page refresh!');
            
        } else {
            showMessage(result.message || '❌ Error updating profile!', 'error');
        }
        
        if (button) {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }
    };
    
    // ============================================================
    // 10. PROFİL ŞƏKLİ YÜKLƏ
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
                body: formData
            });
            
            const result = await response.json();
            console.log('Upload result:', result);
            
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
    // 11. PROFİL ŞƏKLİ SİL
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
    // 12. SƏBƏTDƏN SİL
    // ============================================================
    window.removeFromCart = async function(btn, skipConfirm = false) {
        if (!skipConfirm) {
            if (!confirm('Məhsulu səbətdən silmek istədiyinizə əminsiniz?')) return;
        }
        
        const row = btn?.closest('tr');
        if (!row) return;
        
        const productId = row.dataset.productId || row.dataset.id;
        
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const result = await sendRequest('remove_from_cart', { product_id: productId });
        
        if (result.status === 'success') {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateBadges(result.cart_count, result.wishlist_count);
                updateCartTotal();
                showMessage('✅ Item removed from cart', 'success');
            }, 200);
        } else {
            showMessage(result.message || 'Error!', 'error');
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    };
    
    // ============================================================
    // 13. SƏBƏTDƏ MİQDAR YENİLƏ
    // ============================================================
    window.updateQuantity = async function(btn, change) {
        const row = btn?.closest('tr');
        if (!row) return;
        
        const qtySpan = row.querySelector('.qty-value, .quantity-value');
        if (!qtySpan) return;
        
        const productId = row.dataset.productId || row.dataset.id;
        let currentQty = parseInt(qtySpan.textContent) || 1;
        let newQty = currentQty + change;
        
        if (newQty <= 0) {
            await window.removeFromCart(btn, true);
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
            
            const priceSpan = row.querySelector('.price, .unit-price');
            const totalSpan = row.querySelector('.total-price, .item-total');
            
            if (priceSpan && totalSpan) {
                let price = parseFloat(priceSpan.textContent.replace(/[^0-9.-]/g, ''));
                if (isNaN(price)) price = 0;
                totalSpan.textContent = `$${(price * newQty).toFixed(2)}`;
            }
            
            updateCartTotal();
            updateBadges(result.cart_count, result.wishlist_count);
            showMessage(`📦 Quantity: ${newQty}`, 'success');
        } else {
            showMessage(result.message || 'Error!', 'error');
            qtySpan.textContent = currentQty;
        }
        
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    };
    
    // ============================================================
    // 14. WISHLIST MƏLUMATLARI
    // ============================================================
    function getWishlistProductInfo(row) {
        let productName = '';
        const nameEl = row.querySelector('.product-name, .item-name, .product-title');
        if (nameEl) {
            productName = nameEl.textContent.trim();
        } else {
            const text = row.innerText || '';
            productName = text.split('\n')[0].trim();
        }
        
        let productId = row.dataset.productId || row.dataset.id;
        if (!productId) {
            const idAttr = row.querySelector('[data-product-id], [data-id]');
            if (idAttr) productId = idAttr.dataset.productId || idAttr.dataset.id;
        }
        
        return { id: productId, name: productName };
    }
    
    // ============================================================
    // 15. WISHLIST-DƏN SİL
    // ============================================================
    window.removeFromWishlist = async function(btn) {
        if (!confirm('Remove from wishlist?')) return;
        
        const row = btn?.closest('tr');
        if (!row) return;
        
        const product = getWishlistProductInfo(row);
        
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const result = await sendRequest('remove_from_wishlist', { product_id: product.id });
        
        if (result.status === 'success') {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateBadges(result.cart_count, result.wishlist_count);
                showMessage(`🗑️ Removed from wishlist`, 'success');
            }, 200);
        } else {
            showMessage(result.message || 'Error!', 'error');
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    };
    
    // ============================================================
    // 16. WISHLIST-DƏN SƏBƏTƏ ƏLAVƏ
    // ============================================================
    window.addToCartFromWishlist = async function(btn) {
        const row = btn?.closest('tr');
        if (!row) return;
        
        const product = getWishlistProductInfo(row);
        
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const result = await sendRequest('add_to_cart', { product_id: product.id });
        
        if (result.status === 'success') {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateBadges(result.cart_count, result.wishlist_count);
                showMessage(`✅ Added to cart`, 'success');
            }, 200);
        } else {
            showMessage(result.message || 'Error!', 'error');
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    };
    
    // ============================================================
    // 17. EVENT LİSTENERLƏR
    // ============================================================
    function attachEventListeners() {
        console.log('🔄 Attaching event listeners...');
        
        const profileBtns = document.querySelectorAll('#update-profile-btn, .update-profile-btn, .btn-save-profile, .save-profile-btn, [data-action="update-profile"], #save-profile-btn');
        profileBtns.forEach(btn => {
            if (!btn.dataset._attached) {
                btn.dataset._attached = 'true';
                const newBtn = btn.cloneNode(true);
                btn.parentNode?.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.updateProfileData(newBtn);
                });
                console.log('✅ Profile button attached');
            }
        });
        
        const profileForm = document.querySelector('#profile-form, .profile-form');
        if (profileForm && !profileForm.dataset._attached) {
            profileForm.dataset._attached = 'true';
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = profileForm.querySelector('button[type="submit"]');
                if (btn) window.updateProfileData(btn);
            });
            console.log('✅ Profile form attached');
        }
        
        const photoInput = document.querySelector('#profile-image-input, input[type="file"][accept*="image"], input[name="profile_image"]');
        if (photoInput && !photoInput.dataset._attached) {
            photoInput.dataset._attached = 'true';
            photoInput.addEventListener('change', () => window.uploadProfileImage(photoInput));
            console.log('✅ Image input attached');
        }
        
        const deletePhotoBtn = document.querySelector('#delete-photo-btn, .delete-photo-btn');
        if (deletePhotoBtn && !deletePhotoBtn.dataset._attached) {
            deletePhotoBtn.dataset._attached = 'true';
            const newBtn = deletePhotoBtn.cloneNode(true);
            deletePhotoBtn.parentNode?.replaceChild(newBtn, deletePhotoBtn);
            newBtn.addEventListener('click', () => window.deleteProfileImage(newBtn));
            console.log('✅ Delete photo button attached');
        }
        
        document.querySelectorAll('#wishlist-table-body .add-to-cart, #wishlist-table-body .cart-icon, #wishlist-table-body .move-to-cart').forEach(btn => {
            if (!btn.dataset._attached) {
                btn.dataset._attached = 'true';
                const newBtn = btn.cloneNode(true);
                btn.parentNode?.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => window.addToCartFromWishlist(newBtn));
            }
        });
        
        document.querySelectorAll('#wishlist-table-body .remove, #wishlist-table-body .delete, #wishlist-table-body .wishlist-remove').forEach(btn => {
            if (!btn.dataset._attached) {
                btn.dataset._attached = 'true';
                const newBtn = btn.cloneNode(true);
                btn.parentNode?.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => window.removeFromWishlist(newBtn));
            }
        });
        
        document.querySelectorAll('#cart-table-body .remove, #cart-table-body .delete').forEach(btn => {
            if (!btn.dataset._attached) {
                btn.dataset._attached = 'true';
                const newBtn = btn.cloneNode(true);
                btn.parentNode?.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => window.removeFromCart(newBtn, false));
            }
        });
        
        document.querySelectorAll('#cart-table-body .qty-plus, #cart-table-body .quantity-plus').forEach(btn => {
            if (!btn.dataset._attached) {
                btn.dataset._attached = 'true';
                const newBtn = btn.cloneNode(true);
                btn.parentNode?.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => window.updateQuantity(newBtn, 1));
            }
        });
        
        document.querySelectorAll('#cart-table-body .qty-minus, #cart-table-body .quantity-minus').forEach(btn => {
            if (!btn.dataset._attached) {
                btn.dataset._attached = 'true';
                const newBtn = btn.cloneNode(true);
                btn.parentNode?.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => window.updateQuantity(newBtn, -1));
            }
        });
    }
    
    // ============================================================
    // 18. MUTASİYA OBSERVER
    // ============================================================
    let observerTimeout;
    const observer = new MutationObserver(() => {
        if (observerTimeout) clearTimeout(observerTimeout);
        observerTimeout = setTimeout(attachEventListeners, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // ============================================================
    // 19. İNİT
    // ============================================================
    function init() {
        setTimeout(() => {
            attachEventListeners();
            updateCartTotal();
            console.log('✅ Account JS CLEAN VERSION initialized (No comments)');
            console.log('📍 Profile, Cart, Wishlist working - Comments removed');
        }, 500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ============================================================
    // 20. CSS
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
            .add-to-cart, .cart-icon, .move-to-cart, .remove, .delete, .wishlist-remove {
                cursor: pointer;
                transition: all 0.2s;
            }
            .add-to-cart:hover, .cart-icon:hover, .move-to-cart:hover {
                transform: scale(1.05);
            }
            .remove:hover, .delete:hover, .wishlist-remove:hover {
                transform: scale(1.05);
                color: #dc2626 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
})();



/**
 * Product Reviews - Müstəqil AJAX Sistemi (TAM VERSİYA + LİKE/DİSLİKE)
 * Xüsusiyyətlər:
 * - Rəy əlavə etmək (Add Review)
 * - Rəylərə limitsiz cavab yazmaq (Reply - SADƏCƏ MƏTN)
 * - Rəy və cavabları bəyənmək/bəyənməmək (Like/Dislike - HƏR İSTİFADƏÇİ 1 DƏFƏ)
 * - Versiya: 9.0.0 (TAM İŞLƏK + LİKE/DİSLİKE LIMITI)
 */

(function() {
    'use strict';
    
    // ============================================================
    // 1. KONFİQURASİYA
    // ============================================================
    const CONFIG = {
        STORAGE_PREFIX: 'review_vote_',
        ANIMATION_DURATION: 300
    };
    
    // ============================================================
    // 2. GLOBAL DƏYİŞƏNLƏR
    // ============================================================
    let isSubmitting = false;
    
    // Default istifadəçi adı (admin üçün)
    const DEFAULT_USER_NAME = 'Admin';
    const DEFAULT_USER_SURNAME = '';
    
    // ============================================================
    // 3. CSRF TOKEN
    // ============================================================
    function getCSRFToken() {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput && csrfInput.value) return csrfInput.value;
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) return metaToken.getAttribute('content');
        const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }
    
    // ============================================================
    // 4. BİLDİRİŞ SİSTEMİ
    // ============================================================
    function showNotification(message, type = 'success') {
        const oldNotif = document.querySelector('.review-toast');
        if (oldNotif) oldNotif.remove();
        
        const toast = document.createElement('div');
        toast.className = 'review-toast';
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 14px 24px;
            background: ${colors[type] || colors.success};
            color: white;
            border-radius: 12px;
            z-index: 1000001;
            font-size: 14px;
            font-weight: 500;
            font-family: system-ui, sans-serif;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        `;
        
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast && toast.remove) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
        
        toast.onclick = () => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        };
    }
    
    // ============================================================
    // 5. KOMUNAL FUNKSİYALAR
    // ============================================================
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    function timeSince(dateStr) {
        if (!dateStr) return 'İndi';
        try {
            const date = new Date(dateStr);
            const seconds = Math.floor((new Date() - date) / 1000);
            if (seconds < 60) return 'İndi';
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return minutes + ' dəq əvvəl';
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return hours + ' saat əvvəl';
            const days = Math.floor(hours / 24);
            if (days < 30) return days + ' gün əvvəl';
            const months = Math.floor(days / 30);
            if (months < 12) return months + ' ay əvvəl';
            return Math.floor(months / 12) + ' il əvvəl';
        } catch(e) {
            return 'İndi';
        }
    }
    
    function getRandomAvatarColor() {
        const colors = ['avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-orange'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // ============================================================
    // 6. SESSION IDARƏETMƏ (Hər istifadəçi 1 like/dislike)
    // ============================================================
    
    // Like statusunu yoxla
    function hasLiked(reviewId, type = 'review') {
        const key = `${CONFIG.STORAGE_PREFIX}${type}_${reviewId}_liked`;
        return sessionStorage.getItem(key) === 'true';
    }
    
    // Dislike statusunu yoxla
    function hasDisliked(reviewId, type = 'review') {
        const key = `${CONFIG.STORAGE_PREFIX}${type}_${reviewId}_disliked`;
        return sessionStorage.getItem(key) === 'true';
    }
    
    // Like statusunu set et
    function setLiked(reviewId, liked, type = 'review') {
        const likeKey = `${CONFIG.STORAGE_PREFIX}${type}_${reviewId}_liked`;
        const dislikeKey = `${CONFIG.STORAGE_PREFIX}${type}_${reviewId}_disliked`;
        
        if (liked) {
            sessionStorage.setItem(likeKey, 'true');
            sessionStorage.removeItem(dislikeKey);
        } else {
            sessionStorage.removeItem(likeKey);
        }
    }
    
    // Dislike statusunu set et
    function setDisliked(reviewId, disliked, type = 'review') {
        const likeKey = `${CONFIG.STORAGE_PREFIX}${type}_${reviewId}_liked`;
        const dislikeKey = `${CONFIG.STORAGE_PREFIX}${type}_${reviewId}_disliked`;
        
        if (disliked) {
            sessionStorage.setItem(dislikeKey, 'true');
            sessionStorage.removeItem(likeKey);
        } else {
            sessionStorage.removeItem(dislikeKey);
        }
    }
    
    // Like/Dislike limitini yoxla (bir istifadəçi hər review üçün ya like ya da dislike edə bilər)
    function canVote(reviewId, type = 'review') {
        return !hasLiked(reviewId, type) && !hasDisliked(reviewId, type);
    }
    
    // ============================================================
    // 7. AJAX SORĞULARI
    // ============================================================
    async function sendRequest(action, data) {
        const formData = new FormData();
        const csrf = getCSRFToken();
        if (csrf) formData.append('csrfmiddlewaretoken', csrf);
        formData.append('action', action);
        
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
            console.log(`📦 ${action}:`, result);
            return result;
        } catch (error) {
            console.error(`❌ ${action}:`, error);
            return { status: 'error', message: 'Şəbəkə xətası!' };
        }
    }
    
    // ============================================================
    // 8. RƏY ƏLAVƏ ET
    // ============================================================
    async function addReview(form) {
        if (isSubmitting) {
            showNotification('Zəhmət olmasa gözləyin...', 'warning');
            return false;
        }
        
        const name = form.querySelector('#firstName, [name="name"]')?.value?.trim();
        const surname = form.querySelector('#lastName, [name="surname"]')?.value?.trim();
        const text = form.querySelector('#commentText, [name="text"]')?.value?.trim();
        const selectedRating = form.querySelector('input[name="rating"]:checked');
        const rating = selectedRating ? selectedRating.value : null;
        
        if (!name) { showNotification('Adınızı daxil edin!', 'error'); return false; }
        if (!surname) { showNotification('Soyadınızı daxil edin!', 'error'); return false; }
        if (!text) { showNotification('Rəy mətnini daxil edin!', 'error'); return false; }
        if (!rating) { showNotification('Ulduz sayını seçin!', 'error'); return false; }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHtml = submitBtn?.innerHTML;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Göndərilir...';
        }
        isSubmitting = true;
        
        const result = await sendRequest('add_review', {
            name: name, surname: surname, text: text, rating: rating
        });
        
        if (result.status === 'success') {
            const firstNameInput = form.querySelector('#firstName, [name="name"]');
            const lastNameInput = form.querySelector('#lastName, [name="surname"]');
            const textInput = form.querySelector('#commentText, [name="text"]');
            if (firstNameInput) firstNameInput.value = '';
            if (lastNameInput) lastNameInput.value = '';
            if (textInput) textInput.value = '';
            
            form.querySelectorAll('input[name="rating"]').forEach(input => input.checked = false);
            const ratingText = form.querySelector('#ratingText');
            if (ratingText) ratingText.textContent = '0/5';
            
            if (result.review) {
                appendReviewToPage(result.review);
            }
            
            showNotification(result.message || '✅ Rəyiniz əlavə edildi!', 'success');
            updateReviewCount();
        } else {
            showNotification(result.message || '❌ Xəta baş verdi!', 'error');
        }
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
        }
        isSubmitting = false;
        return result.status === 'success';
    }
    
    function appendReviewToPage(review) {
        const commentsList = document.getElementById('commentsList');
        const emptyState = document.getElementById('emptyComments');
        
        if (emptyState) emptyState.remove();
        
        const fullName = `${escapeHtml(review.name)} ${escapeHtml(review.surname || '')}`;
        const avatarInitial = review.name.charAt(0).toUpperCase();
        const avatarColor = getRandomAvatarColor();
        
        let starsHtml = '';
        if (review.rating) {
            const fullStars = parseInt(review.rating);
            const emptyStars = 5 - fullStars;
            starsHtml = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
        }
        
        // Like/Dislike statuslarını yoxla
        const isLiked = hasLiked(review.id, 'review');
        const isDisliked = hasDisliked(review.id, 'review');
        
        const reviewHtml = `
            <div class="comment-card" data-review-id="${review.id}">
                <div class="comment-header">
                    <div class="comment-user">
                        <div class="comment-avatar ${avatarColor}">
                            ${avatarInitial}
                        </div>
                        <div class="comment-user-info">
                            <div class="comment-user-name">${fullName}</div>
                            <div class="comment-date">
                                <i class="far fa-calendar-alt"></i>
                                <span>${timeSince(review.created)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="comment-badge">
                        <i class="fas fa-star"></i>
                        <span>${review.rating}/5</span>
                    </div>
                </div>
                <div class="comment-content">
                    <div class="comment-rating">
                        <div class="rating-display">
                            <div class="stars-display">
                                ${starsHtml.split('').map(s => s === '★' ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>').join('')}
                            </div>
                            <div class="rating-score">(${review.rating}/5)</div>
                        </div>
                    </div>
                    <div class="comment-text">
                        <p>${escapeHtml(review.text)}</p>
                    </div>
                    <div class="comment-actions">
                        <div class="comment-action action-reply" data-review-id="${review.id}" data-author-name="${escapeHtml(review.name)}">
                            <i class="fas fa-reply"></i>
                            <span>Cavab yaz</span>
                        </div>
                        <div class="comment-action action-like ${isLiked ? 'active' : ''}" data-review-id="${review.id}" data-type="review" style="color: ${isLiked ? '#149ddd' : '#64748b'};">
                            <i class="fas fa-thumbs-up"></i>
                            <span class="like-count">${review.likes || 0}</span>
                        </div>
                        <div class="comment-action action-dislike ${isDisliked ? 'active' : ''}" data-review-id="${review.id}" data-type="review" style="color: ${isDisliked ? '#ff6b6b' : '#64748b'};">
                            <i class="fas fa-thumbs-down"></i>
                            <span class="dislike-count">${review.dislikes || 0}</span>
                        </div>
                    </div>
                    <div class="replies-section" id="replies-${review.id}">
                    </div>
                </div>
            </div>
        `;
        
        if (commentsList) {
            commentsList.insertAdjacentHTML('afterbegin', reviewHtml);
            const newReview = commentsList.firstElementChild;
            if (newReview) {
                newReview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    // ============================================================
    // 9. REPLY ƏLAVƏ ET - LİMİTSİZ VERSİYA
    // ============================================================
    function showReplyForm(reviewId, authorName) {
        const targetElement = document.querySelector(`.comment-card[data-review-id="${reviewId}"] .replies-section`);
        if (!targetElement) return;
        
        // Əgər bu review üçün artıq açıq form varsa, onu sil
        const existingForm = targetElement.querySelector('.reply-form-container');
        if (existingForm) {
            existingForm.remove();
        }
        
        const replyFormHtml = `
            <div class="reply-form-container" data-parent-review="${reviewId}" style="margin-top: 15px; margin-bottom: 10px; padding: 16px; background: #f8fcff; border-radius: 20px; border: 1px solid rgba(20, 157, 221, 0.15);">
                <div class="reply-form-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                    <i class="fas fa-reply" style="color: #149ddd; font-size: 14px;"></i>
                    <span style="font-size: 14px; color: #334155;">Cavab yazırsınız: <strong style="color: #149ddd;">${escapeHtml(authorName)}</strong></span>
                    <button type="button" class="cancel-reply-btn" data-review-id="${reviewId}" style="background: none; border: none; color: #ff6b6b; cursor: pointer; margin-left: auto; font-size: 13px; padding: 4px 8px;">✕ Bağla</button>
                </div>
                <textarea class="reply-text" placeholder="Cavabınızı yazın..." rows="2" style="width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 12px; resize: vertical; font-family: inherit; font-size: 14px;"></textarea>
                <div style="display: flex; justify-content: flex-end;">
                    <button type="button" class="submit-reply-btn" data-review-id="${reviewId}" data-reply-to="${escapeHtml(authorName)}" style="background: #149ddd; color: white; border: none; padding: 8px 24px; border-radius: 30px; cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                        <i class="fas fa-paper-plane"></i> Göndər
                    </button>
                </div>
            </div>
        `;
        
        targetElement.insertAdjacentHTML('beforeend', replyFormHtml);
        const newForm = targetElement.lastElementChild;
        
        const cancelBtn = newForm.querySelector('.cancel-reply-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newForm.remove();
            });
        }
        
        const submitBtn = newForm.querySelector('.submit-reply-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                submitReply(submitBtn);
            });
        }
        
        const textarea = newForm.querySelector('.reply-text');
        if (textarea) textarea.focus();
    }
    
    async function submitReply(btn) {
        const formContainer = btn.closest('.reply-form-container');
        const reviewId = btn.dataset.reviewId;
        const replyToName = btn.dataset.replyTo;
        
        const text = formContainer.querySelector('.reply-text')?.value?.trim();
        
        if (!text) { 
            showNotification('Cavab mətnini daxil edin!', 'error'); 
            return;
        }
        
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const result = await sendRequest('add_reply', {
            parent_id: reviewId,
            name: DEFAULT_USER_NAME,
            surname: DEFAULT_USER_SURNAME,
            text: text,
            reply_to_name: replyToName
        });
        
        if (result.status === 'success') {
            if (formContainer) formContainer.remove();
            
            if (result.reply) {
                appendReplyToPage(result.reply, reviewId);
            }
            showNotification(result.message || '✅ Cavab əlavə edildi!', 'success');
            updateReviewCount();
        } else {
            showNotification(result.message || '❌ Xəta!', 'error');
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }
    
    function appendReplyToPage(reply, parentReviewId) {
        const repliesContainer = document.getElementById(`replies-${parentReviewId}`);
        if (!repliesContainer) return;
        
        const fullName = `${escapeHtml(reply.name)} ${escapeHtml(reply.surname || '')}`;
        const replyText = reply.reply_to_name 
            ? `<span style="color: #149ddd; font-weight: 500;">@${escapeHtml(reply.reply_to_name)}</span> ${escapeHtml(reply.text)}`
            : escapeHtml(reply.text);
        
        // Reply üçün like/dislike statuslarını yoxla
        const isLiked = hasLiked(reply.id, 'reply');
        const isDisliked = hasDisliked(reply.id, 'reply');
        
        const replyHtml = `
            <div class="reply-card" data-reply-id="${reply.id}" style="margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 16px; border-left: 3px solid #149ddd;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <div class="reply-avatar ${getRandomAvatarColor()}" style="width: 32px; height: 32px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 600;">
                        ${reply.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span style="font-weight: 600; font-size: 14px;">${fullName}</span>
                        <span style="font-size: 12px; color: #94a3b8; margin-left: 8px;">${timeSince(reply.created)}</span>
                    </div>
                </div>
                <div class="reply-text" style="margin-bottom: 10px; padding-left: 42px;">
                    <p style="margin: 0; font-size: 14px; color: #334155;">${replyText}</p>
                </div>
                <div class="reply-actions" style="padding-left: 42px; display: flex; gap: 16px;">
                    <div class="reply-action like-reply ${isLiked ? 'active' : ''}" data-reply-id="${reply.id}" data-type="reply" style="cursor: pointer; font-size: 13px; color: ${isLiked ? '#149ddd' : '#64748b'}; transition: all 0.2s;">
                        <i class="fas fa-thumbs-up"></i> <span class="like-count">${reply.likes || 0}</span>
                    </div>
                    <div class="reply-action dislike-reply ${isDisliked ? 'active' : ''}" data-reply-id="${reply.id}" data-type="reply" style="cursor: pointer; font-size: 13px; color: ${isDisliked ? '#ff6b6b' : '#64748b'}; transition: all 0.2s;">
                        <i class="fas fa-thumbs-down"></i> <span class="dislike-count">${reply.dislikes || 0}</span>
                    </div>
                </div>
            </div>
        `;
        
        repliesContainer.insertAdjacentHTML('beforeend', replyHtml);
        const newReply = repliesContainer.lastElementChild;
        if (newReply) {
            newReply.style.animation = 'fadeInUp 0.3s ease';
        }
        
        attachReplyLikeDislikeButtons();
    }
    
    // ============================================================
    // 10. LIKE/DISLIKE - HƏR İSTİFADƏÇİ 1 DƏFƏ
    // ============================================================
    async function handleLike(reviewId, type, btnElement) {
        // Əgər artıq like edibsə, like-ı geri al
        if (hasLiked(reviewId, type)) {
            const result = await sendRequest(type === 'review' ? 'like_review' : 'like_reply', { review_id: reviewId });
            if (result.status === 'success') {
                setLiked(reviewId, false, type);
                updateVoteUI(btnElement, result.likes, result.dislikes);
                showNotification('Bəyənmə geri alındı', 'info');
            }
            return;
        }
        
        // Əgər dislike edibsə, əvvəl dislike-ı geri al
        if (hasDisliked(reviewId, type)) {
            await sendRequest(type === 'review' ? 'dislike_review' : 'dislike_reply', { review_id: reviewId });
            setDisliked(reviewId, false, type);
        }
        
        // Like göndər
        const result = await sendRequest(type === 'review' ? 'like_review' : 'like_reply', { review_id: reviewId });
        if (result.status === 'success') {
            setLiked(reviewId, true, type);
            updateVoteUI(btnElement, result.likes, result.dislikes);
            showNotification('Bəyənildi!', 'success');
        }
    }
    
    async function handleDislike(reviewId, type, btnElement) {
        // Əgər artıq dislike edibsə, dislike-ı geri al
        if (hasDisliked(reviewId, type)) {
            const result = await sendRequest(type === 'review' ? 'dislike_review' : 'dislike_reply', { review_id: reviewId });
            if (result.status === 'success') {
                setDisliked(reviewId, false, type);
                updateVoteUI(btnElement, result.likes, result.dislikes);
                showNotification('Bəyənməmə geri alındı', 'info');
            }
            return;
        }
        
        // Əgər like edibsə, əvvəl like-ı geri al
        if (hasLiked(reviewId, type)) {
            await sendRequest(type === 'review' ? 'like_review' : 'like_reply', { review_id: reviewId });
            setLiked(reviewId, false, type);
        }
        
        // Dislike göndər
        const result = await sendRequest(type === 'review' ? 'dislike_review' : 'dislike_reply', { review_id: reviewId });
        if (result.status === 'success') {
            setDisliked(reviewId, true, type);
            updateVoteUI(btnElement, result.likes, result.dislikes);
            showNotification('Bəyənilmədi', 'info');
        }
    }
    
    function updateVoteUI(btnElement, likes, dislikes) {
        const container = btnElement.closest('.comment-actions, .reply-actions');
        if (!container) return;
        
        const likeBtn = container.querySelector('.action-like, .like-reply');
        const dislikeBtn = container.querySelector('.action-dislike, .dislike-reply');
        const likeSpan = likeBtn?.querySelector('.like-count');
        const dislikeSpan = dislikeBtn?.querySelector('.dislike-count');
        
        if (likeSpan) likeSpan.textContent = likes;
        if (dislikeSpan) dislikeSpan.textContent = dislikes;
        
        // Düymələrin rənglərini yenilə
        const reviewId = btnElement.dataset.replyId || btnElement.dataset.reviewId;
        const type = btnElement.dataset.type || 'review';
        
        if (likeBtn) {
            if (hasLiked(reviewId, type)) {
                likeBtn.style.color = '#149ddd';
            } else {
                likeBtn.style.color = '#64748b';
            }
        }
        
        if (dislikeBtn) {
            if (hasDisliked(reviewId, type)) {
                dislikeBtn.style.color = '#ff6b6b';
            } else {
                dislikeBtn.style.color = '#64748b';
            }
        }
    }
    
    // ============================================================
    // 11. REVIEW SAYI
    // ============================================================
    function updateReviewCount() {
        const reviewCount = document.querySelectorAll('.comment-card').length;
        const countElements = document.querySelectorAll('#commentCount, #commentCountDisplay, .comment-count');
        countElements.forEach(el => {
            if (el) el.textContent = reviewCount;
        });
    }
    
    // ============================================================
    // 12. EVENT LİSTENERLƏR
    // ============================================================
    function attachEventListeners() {
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            const newForm = commentForm.cloneNode(true);
            commentForm.parentNode?.replaceChild(newForm, commentForm);
            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await addReview(newForm);
            });
            console.log('✅ Comment form attached');
        }
        
        document.querySelectorAll('.star-rating input').forEach(star => {
            star.addEventListener('change', function() {
                const ratingText = document.getElementById('ratingText');
                if (ratingText) ratingText.textContent = `${this.value}/5`;
            });
        });
    }
    
    function attachReplyButtons() {
        document.body.addEventListener('click', (e) => {
            const replyBtn = e.target.closest('.action-reply');
            if (replyBtn) {
                e.preventDefault();
                e.stopPropagation();
                const reviewId = replyBtn.dataset.reviewId;
                const authorName = replyBtn.dataset.authorName;
                if (reviewId) showReplyForm(reviewId, authorName);
            }
        });
    }
    
    function attachLikeDislikeButtons() {
        document.body.addEventListener('click', async (e) => {
            const likeBtn = e.target.closest('.action-like, .like-reply');
            const dislikeBtn = e.target.closest('.action-dislike, .dislike-reply');
            
            if (likeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const reviewId = likeBtn.dataset.replyId || likeBtn.dataset.reviewId;
                const type = likeBtn.dataset.type || 'review';
                await handleLike(reviewId, type, likeBtn);
            }
            
            if (dislikeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const reviewId = dislikeBtn.dataset.replyId || dislikeBtn.dataset.reviewId;
                const type = dislikeBtn.dataset.type || 'review';
                await handleDislike(reviewId, type, dislikeBtn);
            }
        });
    }
    
    function attachReplyLikeDislikeButtons() {
        document.querySelectorAll('.reply-action.like-reply, .reply-action.dislike-reply').forEach(btn => {
            if (btn.dataset.listenerAdded) return;
            btn.dataset.listenerAdded = 'true';
            
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const replyId = btn.dataset.replyId;
                const type = btn.dataset.type || 'reply';
                const isLike = btn.classList.contains('like-reply');
                
                if (isLike) {
                    await handleLike(replyId, type, btn);
                } else {
                    await handleDislike(replyId, type, btn);
                }
            });
        });
    }
    
    // ============================================================
    // 13. MUTATION OBSERVER
    // ============================================================
    let observerTimeout;
    const observer = new MutationObserver(() => {
        if (observerTimeout) clearTimeout(observerTimeout);
        observerTimeout = setTimeout(() => {
            attachReplyLikeDislikeButtons();
        }, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // ============================================================
    // 14. MÖVCUD LIKE/DISLIKE STATUSLARINI YÜKLƏ
    // ============================================================
    function loadExistingVoteStatus() {
        document.querySelectorAll('.action-like').forEach(btn => {
            const id = btn.dataset.reviewId;
            const type = btn.dataset.type || 'review';
            if (hasLiked(id, type)) {
                btn.style.color = '#149ddd';
            }
        });
        document.querySelectorAll('.action-dislike').forEach(btn => {
            const id = btn.dataset.reviewId;
            const type = btn.dataset.type || 'review';
            if (hasDisliked(id, type)) {
                btn.style.color = '#ff6b6b';
            }
        });
    }
    
    // ============================================================
    // 15. İNİTİALİZASİYA
    // ============================================================
    function init() {
        if (!document.getElementById('commentForm')) {
            console.log('Comment form not found, skipping...');
            return;
        }
        
        attachEventListeners();
        attachReplyButtons();
        attachLikeDislikeButtons();
        attachReplyLikeDislikeButtons();
        loadExistingVoteStatus();
        
        updateReviewCount();
        console.log('✅ Product Reviews System initialized - LİKE/DİSLİKE LIMITI AKTİVDİR!');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();