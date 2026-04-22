// ========== COMMENT SYSTEM WITH AJAX ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Comment system with AJAX loaded');
    
    // === Elementləri tap ===
    const commentForm = document.getElementById('commentForm');
    const submitBtn = document.getElementById('submitBtn');
    const commentInput = document.getElementById('commentText');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const ratingInputs = document.querySelectorAll('.star-rating input');
    const ratingSection = document.getElementById('ratingSection');
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');
    const commentCountDisplay = document.getElementById('commentCountDisplay');
    const emptyComments = document.getElementById('emptyComments');
    const cancelReplyBtn = document.getElementById('cancelReply');
    const replyInfo = document.getElementById('replyInfo');
    const parentId = document.getElementById('parentId');
    const replyToName = document.getElementById('replyToName');
    const replyToDisplayName = document.getElementById('replyToDisplayName');
    const actionInput = document.getElementById('actionInput');
    
    // CSRF token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    // İstifadəçi məlumatları (əgər giriş edibsə)
    const currentUser = {
        id: document.body.dataset.userId || null,
        name: document.body.dataset.userName || null
    };
    
    // İstifadəçi like/dislike vəziyyətini saxlamaq üçün (sessionStorage)
    const userInteractions = JSON.parse(sessionStorage.getItem('userInteractions') || '{}');
    
    function saveUserInteractions() {
        sessionStorage.setItem('userInteractions', JSON.stringify(userInteractions));
    }
    
    // === FORM SUBMIT (YENİ COMMENT VƏ YA REPLY) ===
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = firstNameInput?.value.trim() || '';
            const surname = lastNameInput?.value.trim() || '';
            const text = commentInput?.value.trim() || '';
            const action = actionInput?.value || 'add_review';
            
            let rating = 0;
            if (action === 'add_review') {
                ratingInputs.forEach(input => {
                    if (input.checked) {
                        rating = parseInt(input.value);
                    }
                });
            }
            
            if (!name || !surname) {
                alert('Zəhmət olmasa ad və soyad daxil edin!');
                return;
            }
            
            if (action === 'add_review' && rating === 0) {
                alert('Zəhmət olmasa ulduz reyi verin!');
                return;
            }
            
            if (!text) {
                alert('Zəhmət olmasa comment yazın!');
                return;
            }
            
            const fullName = `${name} ${surname}`;
            
            const formData = new FormData();
            formData.append('action', action);
            formData.append('name', name);
            formData.append('surname', surname);
            formData.append('text', text);
            
            if (action === 'add_review') {
                formData.append('rating', rating);
            } else {
                formData.append('parent_id', parentId?.value || '');
                formData.append('reply_to_name', replyToName?.value || '');
            }
            
            formData.append('csrfmiddlewaretoken', csrfToken);
            
            fetch(window.location.href, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    if (action === 'add_review') {
                        const newComment = createCommentElement({
                            id: data.review.id,
                            name: fullName,
                            text: text,
                            rating: rating,
                            likes: 0,
                            dislikes: 0,
                            created_at: new Date().toISOString(),
                            user_id: currentUser.id
                        });
                        
                        if (commentsList) {
                            if (commentsList.firstChild) {
                                commentsList.insertBefore(newComment, commentsList.firstChild);
                            } else {
                                commentsList.appendChild(newComment);
                            }
                        }
                        
                        if (emptyComments) {
                            emptyComments.style.display = 'none';
                        }
                        
                        updateCommentCount(1);
                        
                    } else {
                        const targetComment = document.querySelector(`.comment-card[data-id="${parentId.value}"]`);
                        if (targetComment) {
                            const repliesSection = targetComment.querySelector('.replies-section');
                            if (repliesSection) {
                                const replyHtml = createReplyElement(data.reply, parentId.value);
                                repliesSection.insertAdjacentHTML('beforeend', replyHtml);
                            }
                        }
                        
                        cancelReply();
                    }
                    
                    clearCommentForm(action === 'add_reply');
                    showMessage(data.message, 'success');
                    
                    // Event listener-ları yenidən əlavə et
                    attachReplyListeners();
                    attachLikeDislikeListeners();
                    
                } else {
                    alert('Xəta baş verdi: ' + (data.message || 'Bilinməyən xəta'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Xəta baş verdi!');
            });
        });
    }
    
    // === LIKE/DISLIKE SORĞUSU GÖNDƏR ===
    window.sendLike = function(itemId, action, isReply = false) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('action', action);
            formData.append('review_id', itemId);
            formData.append('is_reply', isReply);
            formData.append('csrfmiddlewaretoken', csrfToken);
            
            fetch(window.location.href, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => reject(error));
        });
    };
    
    // === LİKE BUTTONLARINA EVENT LİSTENER ƏLAVƏ ET ===
    function attachLikeDislikeListeners() {
        // === ƏSAS RƏY LİKE BUTTONLARI ===
        document.querySelectorAll('.action-like').forEach(btn => {
            // Köhnə event listener-ları təmizlə
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            const reviewId = newBtn.dataset.id;
            const userName = newBtn.closest('.comment-card')?.dataset?.name;
            
            // İlkin vəziyyəti yoxla
            if (userInteractions[`liked_${reviewId}`]) {
                const icon = newBtn.querySelector('i');
                icon.classList.remove('far', 'fa-heart');
                icon.classList.add('fas', 'fa-heart');
                icon.style.color = '#ff4d4d';
                
                const likeSpan = newBtn.querySelector('.like-count');
                if (likeSpan && userInteractions[`likes_${reviewId}`] !== undefined) {
                    likeSpan.textContent = userInteractions[`likes_${reviewId}`];
                }
            }
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const reviewId = this.dataset.id;
                const likeSpan = this.querySelector('.like-count');
                const icon = this.querySelector('i');
                const commentCard = this.closest('.comment-card');
                const commentUserName = commentCard?.querySelector('.comment-user-name')?.textContent;
                
                // İstifadəçi öz rəyini bəyənə bilməz
                if (currentUser.name && commentUserName && commentUserName.includes(currentUser.name)) {
                    showMessage('Öz rəyinizi bəyənə bilməzsiniz!', 'warning');
                    return;
                }
                
                // Artıq like edilibsə
                if (userInteractions[`liked_${reviewId}`]) {
                    showMessage('Siz artıq bu rəyi bəyənmisiniz!', 'info');
                    return;
                }
                
                // Animasiya
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                // Like sorğusu göndər
                sendLike(reviewId, 'like_review', false)
                    .then(data => {
                        if (data.status === 'success') {
                            // Like sayını yenilə
                            if (likeSpan) {
                                likeSpan.textContent = data.likes;
                            }
                            
                            // İkonu dəyiş
                            icon.classList.remove('far', 'fa-heart');
                            icon.classList.add('fas', 'fa-heart');
                            icon.style.color = '#ff4d4d';
                            
                            // Like edildi olaraq işarələ
                            userInteractions[`liked_${reviewId}`] = true;
                            userInteractions[`likes_${reviewId}`] = data.likes;
                            
                            // Əgər əvvəllər dislike edibsə, onu sil
                            if (userInteractions[`disliked_${reviewId}`]) {
                                delete userInteractions[`disliked_${reviewId}`];
                                delete userInteractions[`dislikes_${reviewId}`];
                                
                                // Dislike button-unu yenilə
                                const dislikeBtn = this.closest('.comment-actions').querySelector('.action-dislike');
                                if (dislikeBtn) {
                                    const dislikeIcon = dislikeBtn.querySelector('i');
                                    dislikeIcon.classList.remove('fas', 'fa-thumbs-down');
                                    dislikeIcon.classList.add('far', 'fa-thumbs-down');
                                    dislikeIcon.style.color = '';
                                    
                                    const dislikeSpan = dislikeBtn.querySelector('.dislike-count');
                                    if (dislikeSpan && data.dislikes !== undefined) {
                                        dislikeSpan.textContent = data.dislikes;
                                    }
                                }
                            }
                            
                            saveUserInteractions();
                            
                            showMessage('Rəy bəyənildi!', 'success');
                        } else {
                            showMessage(data.message || 'Xəta baş verdi!', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showMessage('Xəta baş verdi!', 'error');
                    });
            });
        });
        
        // === ƏSAS RƏY DİSLİKE BUTTONLARI ===
        document.querySelectorAll('.action-dislike').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            const reviewId = newBtn.dataset.id;
            const userName = newBtn.closest('.comment-card')?.dataset?.name;
            
            if (userInteractions[`disliked_${reviewId}`]) {
                const icon = newBtn.querySelector('i');
                icon.classList.remove('far', 'fa-thumbs-down');
                icon.classList.add('fas', 'fa-thumbs-down');
                icon.style.color = '#64748b';
                
                const dislikeSpan = newBtn.querySelector('.dislike-count');
                if (dislikeSpan && userInteractions[`dislikes_${reviewId}`] !== undefined) {
                    dislikeSpan.textContent = userInteractions[`dislikes_${reviewId}`];
                }
            }
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const reviewId = this.dataset.id;
                const dislikeSpan = this.querySelector('.dislike-count');
                const icon = this.querySelector('i');
                const commentCard = this.closest('.comment-card');
                const commentUserName = commentCard?.querySelector('.comment-user-name')?.textContent;
                
                // İstifadəçi öz rəyini bəyənməyə bilməz
                if (currentUser.name && commentUserName && commentUserName.includes(currentUser.name)) {
                    showMessage('Öz rəyinizi bəyənməyə bilməzsiniz!', 'warning');
                    return;
                }
                
                if (userInteractions[`disliked_${reviewId}`]) {
                    showMessage('Siz artıq bu rəyi bəyənməmisiniz!', 'info');
                    return;
                }
                
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                sendLike(reviewId, 'dislike_review', false)
                    .then(data => {
                        if (data.status === 'success') {
                            if (dislikeSpan) {
                                dislikeSpan.textContent = data.dislikes;
                            }
                            
                            icon.classList.remove('far', 'fa-thumbs-down');
                            icon.classList.add('fas', 'fa-thumbs-down');
                            icon.style.color = '#64748b';
                            
                            userInteractions[`disliked_${reviewId}`] = true;
                            userInteractions[`dislikes_${reviewId}`] = data.dislikes;
                            
                            if (userInteractions[`liked_${reviewId}`]) {
                                delete userInteractions[`liked_${reviewId}`];
                                delete userInteractions[`likes_${reviewId}`];
                                
                                const likeBtn = this.closest('.comment-actions').querySelector('.action-like');
                                if (likeBtn) {
                                    const likeIcon = likeBtn.querySelector('i');
                                    likeIcon.classList.remove('fas', 'fa-heart');
                                    likeIcon.classList.add('far', 'fa-heart');
                                    likeIcon.style.color = '';
                                    
                                    const likeSpan = likeBtn.querySelector('.like-count');
                                    if (likeSpan && data.likes !== undefined) {
                                        likeSpan.textContent = data.likes;
                                    }
                                }
                            }
                            
                            saveUserInteractions();
                            
                            showMessage('Rəy bəyənilmədi!', 'success');
                        } else {
                            showMessage(data.message || 'Xəta baş verdi!', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showMessage('Xəta baş verdi!', 'error');
                    });
            });
        });
        
        // === REPLY LİKE BUTTONLARI ===
        document.querySelectorAll('.reply-like').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            const replyId = newBtn.dataset.replyId;
            
            if (userInteractions[`reply_liked_${replyId}`]) {
                const icon = newBtn.querySelector('i');
                icon.classList.remove('far', 'fa-heart');
                icon.classList.add('fas', 'fa-heart');
                icon.style.color = '#ff4d4d';
                
                const likeSpan = newBtn.querySelector('.reply-like-count');
                if (likeSpan && userInteractions[`reply_likes_${replyId}`] !== undefined) {
                    likeSpan.textContent = userInteractions[`reply_likes_${replyId}`];
                }
            }
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const replyId = this.dataset.replyId;
                const likeSpan = this.querySelector('.reply-like-count');
                const icon = this.querySelector('i');
                const replyCard = this.closest('.reply-card');
                const replyName = replyCard?.querySelector('.reply-name')?.textContent;
                
                // İstifadəçi öz cavabını bəyənə bilməz
                if (currentUser.name && replyName && replyName.includes(currentUser.name)) {
                    showMessage('Öz cavabınızı bəyənə bilməzsiniz!', 'warning');
                    return;
                }
                
                if (userInteractions[`reply_liked_${replyId}`]) {
                    showMessage('Siz artıq bu cavabı bəyənmisiniz!', 'info');
                    return;
                }
                
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                sendLike(replyId, 'like_reply', true)
                    .then(data => {
                        if (data.status === 'success') {
                            if (likeSpan) {
                                likeSpan.textContent = data.likes;
                            }
                            
                            icon.classList.remove('far', 'fa-heart');
                            icon.classList.add('fas', 'fa-heart');
                            icon.style.color = '#ff4d4d';
                            
                            userInteractions[`reply_liked_${replyId}`] = true;
                            userInteractions[`reply_likes_${replyId}`] = data.likes;
                            
                            if (userInteractions[`reply_disliked_${replyId}`]) {
                                delete userInteractions[`reply_disliked_${replyId}`];
                                delete userInteractions[`reply_dislikes_${replyId}`];
                                
                                const dislikeBtn = this.closest('.reply-actions').querySelector('.reply-dislike');
                                if (dislikeBtn) {
                                    const dislikeIcon = dislikeBtn.querySelector('i');
                                    dislikeIcon.classList.remove('fas', 'fa-thumbs-down');
                                    dislikeIcon.classList.add('far', 'fa-thumbs-down');
                                    dislikeIcon.style.color = '';
                                    
                                    const dislikeSpan = dislikeBtn.querySelector('.reply-dislike-count');
                                    if (dislikeSpan && data.dislikes !== undefined) {
                                        dislikeSpan.textContent = data.dislikes;
                                    }
                                }
                            }
                            
                            saveUserInteractions();
                            
                            showMessage('Cavab bəyənildi!', 'success');
                        } else {
                            showMessage(data.message || 'Xəta baş verdi!', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showMessage('Xəta baş verdi!', 'error');
                    });
            });
        });
        
        // === REPLY DİSLİKE BUTTONLARI ===
        document.querySelectorAll('.reply-dislike').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            const replyId = newBtn.dataset.replyId;
            
            if (userInteractions[`reply_disliked_${replyId}`]) {
                const icon = newBtn.querySelector('i');
                icon.classList.remove('far', 'fa-thumbs-down');
                icon.classList.add('fas', 'fa-thumbs-down');
                icon.style.color = '#64748b';
                
                const dislikeSpan = newBtn.querySelector('.reply-dislike-count');
                if (dislikeSpan && userInteractions[`reply_dislikes_${replyId}`] !== undefined) {
                    dislikeSpan.textContent = userInteractions[`reply_dislikes_${replyId}`];
                }
            }
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const replyId = this.dataset.replyId;
                const dislikeSpan = this.querySelector('.reply-dislike-count');
                const icon = this.querySelector('i');
                const replyCard = this.closest('.reply-card');
                const replyName = replyCard?.querySelector('.reply-name')?.textContent;
                
                if (currentUser.name && replyName && replyName.includes(currentUser.name)) {
                    showMessage('Öz cavabınızı bəyənməyə bilməzsiniz!', 'warning');
                    return;
                }
                
                if (userInteractions[`reply_disliked_${replyId}`]) {
                    showMessage('Siz artıq bu cavabı bəyənməmisiniz!', 'info');
                    return;
                }
                
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                sendLike(replyId, 'dislike_reply', true)
                    .then(data => {
                        if (data.status === 'success') {
                            if (dislikeSpan) {
                                dislikeSpan.textContent = data.dislikes;
                            }
                            
                            icon.classList.remove('far', 'fa-thumbs-down');
                            icon.classList.add('fas', 'fa-thumbs-down');
                            icon.style.color = '#64748b';
                            
                            userInteractions[`reply_disliked_${replyId}`] = true;
                            userInteractions[`reply_dislikes_${replyId}`] = data.dislikes;
                            
                            if (userInteractions[`reply_liked_${replyId}`]) {
                                delete userInteractions[`reply_liked_${replyId}`];
                                delete userInteractions[`reply_likes_${replyId}`];
                                
                                const likeBtn = this.closest('.reply-actions').querySelector('.reply-like');
                                if (likeBtn) {
                                    const likeIcon = likeBtn.querySelector('i');
                                    likeIcon.classList.remove('fas', 'fa-heart');
                                    likeIcon.classList.add('far', 'fa-heart');
                                    likeIcon.style.color = '';
                                    
                                    const likeSpan = likeBtn.querySelector('.reply-like-count');
                                    if (likeSpan && data.likes !== undefined) {
                                        likeSpan.textContent = data.likes;
                                    }
                                }
                            }
                            
                            saveUserInteractions();
                            
                            showMessage('Cavab bəyənilmədi!', 'success');
                        } else {
                            showMessage(data.message || 'Xəta baş verdi!', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showMessage('Xəta baş verdi!', 'error');
                    });
            });
        });
    }
    
    // === REPLY GÖNDƏR ===
    window.sendReply = function(parentIdValue, text, replyToNameValue = '') {
        const formData = new FormData();
        formData.append('action', 'add_reply');
        formData.append('parent_id', parentIdValue);
        formData.append('text', text);
        formData.append('reply_to_name', replyToNameValue);
        formData.append('csrfmiddlewaretoken', csrfToken);
        
        return fetch(window.location.href, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json());
    };
    
    // === REPLY BUTTONLARINA EVENT LİSTENER ƏLAVƏ ET ===
    function attachReplyListeners() {
        document.querySelectorAll('.comment-actions .action-reply').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function() {
                const commentCard = this.closest('.comment-card');
                const commentId = commentCard.dataset.id;
                const commentName = commentCard.querySelector('.comment-user-name').textContent;
                showReplyForm(commentId, commentName);
            });
        });
        
        document.querySelectorAll('.reply-to-reply').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function() {
                const replyId = this.dataset.replyId;
                const replyName = this.dataset.replyName;
                const commentId = this.dataset.commentId;
                showReplyForm(replyId, replyName, commentId);
            });
        });
    }
    
    // === REPLY FORMUNU GÖSTƏR ===
    function showReplyForm(id, name, commentId = null) {
        if (replyInfo && parentId && replyToName && replyToDisplayName && actionInput && commentInput && ratingSection) {
            replyToDisplayName.textContent = name;
            parentId.value = id;
            replyToName.value = name;
            actionInput.value = 'add_reply';
            replyInfo.style.display = 'flex';
            ratingSection.style.display = 'none';
            commentInput.focus();
            
            if (cancelReplyBtn) {
                cancelReplyBtn.onclick = function() {
                    cancelReply();
                };
            }
        }
    }
    
    // === REPLY-İ LƏĞV ET ===
    window.cancelReply = function() {
        if (replyInfo) replyInfo.style.display = 'none';
        if (parentId) parentId.value = '';
        if (replyToName) replyToName.value = '';
        if (actionInput) actionInput.value = 'add_review';
        if (ratingSection) ratingSection.style.display = 'flex';
    };
    
    // === REPLY-İ GÖNDƏR ===
    window.submitReply = function() {
        const parentIdValue = parentId?.value;
        const replyToNameValue = replyToName?.value;
        const replyText = commentInput?.value.trim();
        
        if (!parentIdValue || !replyText) {
            alert('Zəhmət olmasa reply yazın!');
            return;
        }
        
        sendReply(parentIdValue, replyText, replyToNameValue)
            .then(data => {
                if (data.status === 'success') {
                    const targetComment = document.querySelector(`.comment-card[data-id="${parentIdValue}"]`);
                    if (targetComment) {
                        const repliesSection = targetComment.querySelector('.replies-section');
                        if (repliesSection) {
                            const replyHtml = createReplyElement(data.reply, parentIdValue);
                            repliesSection.insertAdjacentHTML('beforeend', replyHtml);
                        }
                    }
                    
                    cancelReply();
                    if (commentInput) commentInput.value = '';
                    showMessage(data.message, 'success');
                    
                    attachReplyListeners();
                    attachLikeDislikeListeners();
                } else {
                    alert('Xəta: ' + (data.message || 'Bilinməyən xəta'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Xəta baş verdi!');
            });
    };
    
    // === SUBMIT REPLY BUTTONU ÜÇÜN EVENT LİSTENER ===
    function attachSubmitReplyListener() {
        const submitReplyBtn = document.querySelector('.submit-reply');
        if (submitReplyBtn) {
            const newBtn = submitReplyBtn.cloneNode(true);
            submitReplyBtn.parentNode.replaceChild(newBtn, submitReplyBtn);
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                submitReply();
            });
        }
    }
    
    // === COMMENT ELEMENTİ YARAT ===
    function createCommentElement(review) {
        const div = document.createElement('div');
        div.className = 'comment-card';
        div.dataset.id = review.id;
        div.dataset.name = review.name;
        
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHtml += '<i class="fas fa-star" style="color: #ffc107;"></i>';
            } else {
                starsHtml += '<i class="far fa-star" style="color: #e2e8f0;"></i>';
            }
        }
        
        const date = new Date(review.created_at);
        const timeAgo = formatTimeAgo(date);
        
        div.innerHTML = `
            <div class="comment-header">
                <div class="comment-user">
                    <div class="comment-avatar avatar-blue">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="comment-user-info">
                        <div class="comment-user-name">${escapeHtml(review.name)}</div>
                        <div class="comment-date">
                            <i class="far fa-clock"></i>
                            ${timeAgo}
                        </div>
                    </div>
                </div>
                <div class="comment-badge">
                    <i class="fas fa-crown"></i>
                    Contributor
                </div>
            </div>

            <div class="comment-rating">
                <div class="rating-display">
                    <div class="stars-display">
                        ${starsHtml}
                    </div>
                    <span class="rating-score">${review.rating}.0</span>
                </div>
            </div>

            <div class="comment-content">
                <div class="comment-text">
                    ${escapeHtml(review.text)}
                </div>
            </div>

            <div class="comment-actions">
                <div class="comment-action action-like" data-id="${review.id}">
                    <i class="far fa-heart"></i>
                    <span class="like-count">${review.likes}</span>
                </div>
                <div class="comment-action action-dislike" data-id="${review.id}">
                    <i class="far fa-thumbs-down"></i>
                    <span class="dislike-count">${review.dislikes}</span>
                </div>
                <div class="comment-action action-reply" data-id="${review.id}" data-name="${escapeHtml(review.name)}">
                    <i class="far fa-comment"></i>
                    <span>Reply</span>
                </div>
            </div>
            
            <div class="replies-section" id="replies-${review.id}"></div>
        `;
        
        return div;
    }
    
    // === REPLY ELEMENTİ YARAT (CAVAB ÜÇÜN) ===
    function createReplyElement(reply, commentId) {
        const date = new Date(reply.created_at);
        const timeAgo = formatTimeAgo(date);
        
        const replyToHtml = reply.reply_to_name ? 
            `<span class="reply-to">@${escapeHtml(reply.reply_to_name)}</span>` : '';
        
        return `
            <div class="reply-card" data-reply-id="${reply.id}" data-comment-id="${commentId}" data-reply-name="${escapeHtml(reply.name)}">
                <div class="reply-avatar avatar-green">
                    <i class="fas fa-user"></i>
                </div>
                <div class="reply-content">
                    <div class="reply-header">
                        <span class="reply-name">${escapeHtml(reply.name)}</span>
                        <span class="reply-date">${timeAgo}</span>
                    </div>
                    <div class="reply-text">
                        ${replyToHtml} ${escapeHtml(reply.text)}
                    </div>
                    <div class="reply-actions">
                        <!-- REPLY LIKE BUTTONU -->
                        <span class="reply-action reply-like" data-reply-id="${reply.id}">
                            <i class="far fa-heart"></i> 
                            <span class="reply-like-count">${reply.likes || 0}</span>
                        </span>
                        <!-- REPLY DISLIKE BUTTONU -->
                        <span class="reply-action reply-dislike" data-reply-id="${reply.id}">
                            <i class="far fa-thumbs-down"></i> 
                            <span class="reply-dislike-count">${reply.dislikes || 0}</span>
                        </span>
                        <!-- REPLY REPLY BUTTONU -->
                        <span class="reply-action reply-to-reply" 
                              data-reply-id="${reply.id}" 
                              data-reply-name="${escapeHtml(reply.name)}" 
                              data-comment-id="${commentId}">
                            <i class="far fa-comment"></i> Reply
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // === COMMENT SAYINI YENİLƏ ===
    function updateCommentCount(increment = 1) {
        const countElements = [commentCount, commentCountDisplay];
        countElements.forEach(el => {
            if (el) {
                const current = parseInt(el.textContent) || 0;
                el.textContent = current + increment;
            }
        });
    }
    
    // === FORMU TƏMİZLƏ ===
    function clearCommentForm(isReply = false) {
        if (commentInput) commentInput.value = '';
        if (firstNameInput) firstNameInput.value = '';
        if (lastNameInput) lastNameInput.value = '';
        
        if (!isReply) {
            ratingInputs.forEach(input => {
                input.checked = false;
            });
            
            const ratingText = document.querySelector('.rating-text');
            if (ratingText) ratingText.textContent = '0/5';
            
            document.querySelectorAll('.star-rating label').forEach(label => {
                label.style.color = '#e2e8f0';
            });
        }
    }
    
    // === TIME AGO FORMATI ===
    function formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }
    
    // === HTML ESCAPE ===
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // === MESSAGE GÖSTƏR ===
    window.showMessage = function(text, type = 'info') {
        const msg = document.createElement('div');
        
        let bgColor = '#149ddd'; // info
        if (type === 'success') bgColor = '#28a745';
        if (type === 'error') bgColor = '#dc3545';
        if (type === 'warning') bgColor = '#ffc107';
        
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${bgColor};
            color: white;
            border-radius: 5px;
            z-index: 9999;
            animation: slideIn 0.3s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        msg.textContent = text;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'slideOut 0.3s';
            setTimeout(() => {
                msg.remove();
            }, 300);
        }, 3000);
    };
    
    // === EVENT LİSTENERLƏRİ BAŞLAT ===
    attachReplyListeners();
    attachLikeDislikeListeners();
    attachSubmitReplyListener();
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            alert('Load more comments - demo mode');
        });
    }
});

// ========== STAR RATING SYSTEM ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Star rating system loaded');
    
    const starInputs = document.querySelectorAll('.star-rating input');
    const starLabels = document.querySelectorAll('.star-rating label');
    const ratingText = document.querySelector('.rating-text');
    const ratingContainer = document.querySelector('.rating-stars');
    
    if (!starInputs.length || !starLabels.length) return;
    
    const sortedInputs = Array.from(starInputs).sort((a, b) => parseInt(a.value) - parseInt(b.value));
    const sortedLabels = Array.from(starLabels).sort((a, b) => {
        const aId = a.getAttribute('for').replace('star', '');
        const bId = b.getAttribute('for').replace('star', '');
        return parseInt(aId) - parseInt(bId);
    });
    
    function resetStars() {
        sortedLabels.forEach(label => {
            label.style.color = '#e2e8f0';
        });
    }
    
    function lightStars(count) {
        resetStars();
        for (let i = 0; i < count; i++) {
            if (sortedLabels[i]) {
                sortedLabels[i].style.color = '#ffc107';
            }
        }
    }
    
    sortedLabels.forEach((label, index) => {
        label.addEventListener('mouseenter', function() {
            lightStars(index + 1);
        });
        
        label.addEventListener('mouseleave', function() {
            const checkedInput = document.querySelector('.star-rating input:checked');
            if (checkedInput) {
                lightStars(parseInt(checkedInput.value));
            } else {
                resetStars();
            }
        });
    });
    
    sortedInputs.forEach(input => {
        input.addEventListener('change', function() {
            const value = parseInt(this.value);
            lightStars(value);
            
            if (ratingText) {
                ratingText.textContent = `${value}/5`;
                ratingText.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    ratingText.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
    
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            const checkedInput = document.querySelector('.star-rating input:checked');
            if (checkedInput) {
                lightStars(parseInt(checkedInput.value));
            } else {
                resetStars();
            }
        });
    }
    
    const checkedInput = document.querySelector('.star-rating input:checked');
    if (checkedInput) {
        lightStars(parseInt(checkedInput.value));
        if (ratingText) {
            ratingText.textContent = `${checkedInput.value}/5`;
        }
    } else {
        resetStars();
        if (ratingText) {
            ratingText.textContent = '0/5';
        }
    }
});

// Animasiyalar üçün CSS əlavə et
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .action-like, .action-dislike, .reply-like, .reply-dislike {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .action-like:hover i, .reply-like:hover i {
        color: #ff4d4d !important;
        transform: scale(1.1);
    }
    
    .action-dislike:hover i, .reply-dislike:hover i {
        color: #64748b !important;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

console.log('✅ comment.js fully loaded - Reply like/dislike fixed!');





// ========== MY ACCOUNT PAGE - TAM VERSİYA ==========
// Bu JavaScript HEÇ NƏYİ DƏYİŞMİR, sadəcə HTML-i idarə edir

(function() {
    // Səhifə tam yükləndikdə işə düş
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('✅ Account page initialized');
        
        // Elementləri tap
        const tabs = document.querySelectorAll('.sidebar-menu li[data-tab]');
        const contents = document.querySelectorAll('.tab-content');
        
        if (!tabs.length || !contents.length) {
            console.warn('⚠️ Tab elements not found');
            return;
        }
        
        // ===== 1. TAB SİSTEMİ =====
        function switchTab(tabId) {
            console.log('Switching to tab:', tabId);
            
            // Bütün tabları deaktiv et
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Bütün məzmunları gizlət
            contents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Seçilmiş tabı aktiv et
            const activeTab = document.querySelector(`.sidebar-menu li[data-tab="${tabId}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
            
            // Seçilmiş məzmunu göstər
            const activeContent = document.getElementById(tabId + '-tab');
            if (activeContent) {
                activeContent.classList.add('active');
                activeContent.style.display = 'block';
                
                // Tab dəyişdikdə scroll-u sıfırla
                const wrapper = activeContent.querySelector('.products-table-wrapper');
                if (wrapper) {
                    wrapper.scrollTop = 0;
                }
            }
            
            // URL-i yenilə
            const url = new URL(window.location);
            url.searchParams.set('tab', tabId);
            history.replaceState({}, '', url);
        }
        
        // Klik hadisələrini əlavə et
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                const tabId = this.dataset.tab;
                
                // Logout xüsusi haldır
                if (this.classList.contains('logout')) {
                    const logoutUrl = this.querySelector('a')?.getAttribute('href');
                    if (logoutUrl) {
                        window.location.href = logoutUrl;
                    }
                    return;
                }
                
                if (tabId) {
                    switchTab(tabId);
                }
            });
        });
        
        // Hansı tab göstərilsin?
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        
        if (urlTab && document.getElementById(urlTab + '-tab')) {
            switchTab(urlTab);
        } else {
            // Default olaraq wishlist
            switchTab('wishlist');
        }
        
        // ===== 2. AXTARIŞ =====
        const wishlistSearch = document.getElementById('wishlist-search');
        if (wishlistSearch) {
            wishlistSearch.addEventListener('keyup', function() {
                const term = this.value.toLowerCase();
                const rows = document.querySelectorAll('#wishlist-table-body tr');
                const wrapper = document.querySelector('#wishlist-tab .products-table-wrapper');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    if (text.includes(term)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                // Scroll indikatorunu yenilə
                if (wrapper) {
                    setTimeout(() => checkScrollIndicator(wrapper), 50);
                }
            });
        }
        
        const cartSearch = document.getElementById('cart-search');
        if (cartSearch) {
            cartSearch.addEventListener('keyup', function() {
                const term = this.value.toLowerCase();
                const rows = document.querySelectorAll('#cart-table-body tr');
                const wrapper = document.querySelector('#carts-tab .products-table-wrapper');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    if (text.includes(term)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                // Scroll indikatorunu yenilə
                if (wrapper) {
                    setTimeout(() => checkScrollIndicator(wrapper), 50);
                }
            });
        }
        
        // ===== 3. PROFİL ŞƏKLİ VƏ FORM FUNKSİYALARI =====
        window.previewImage = function(input) {
            if (input && input.files && input.files[0]) {
                const file = input.files[0];
                
                // Şəkil yoxlaması
                if (!file.type.startsWith('image/')) {
                    showNotification('Zəhmət olmasa şəkil faylı seçin', 'error');
                    input.value = '';
                    return;
                }
                
                // Ölçü yoxlaması (2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showNotification('Fayl ölçüsü 2MB-dan kiçik olmalıdır', 'error');
                    input.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Profil tab-dakı böyük şəkil
                    const mainPreview = document.getElementById('profile-image-preview');
                    if (mainPreview) {
                        mainPreview.style.opacity = '0.5';
                        mainPreview.src = e.target.result;
                        
                        setTimeout(() => {
                            mainPreview.style.opacity = '1';
                        }, 300);
                    }
                    
                    // Sidebar-dakı kiçik profil şəkli
                    const sidebarImage = document.getElementById('sidebar-profile-image');
                    if (sidebarImage) {
                        sidebarImage.style.opacity = '0.5';
                        sidebarImage.src = e.target.result;
                        
                        setTimeout(() => {
                            sidebarImage.style.opacity = '1';
                        }, 300);
                    }
                    
                    showNotification('Şəkil seçildi. Yadda saxlamaq üçün formu göndərin.', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        
        // Profil şəklini silmək üçün təsdiq
        window.confirmDeleteImage = function() {
            if (confirm('Profil şəklinizi silmək istədiyinizə əminsiniz?')) {
                document.getElementById('delete-image-form').submit();
            }
        };
        
        // Form reset
        window.resetProfileForm = function() {
            if (confirm('Dəyişiklikləri ləğv etmək istədiyinizə əminsiniz?')) {
                const form = document.getElementById('profile-form');
                form.reset();
                
                // Orijinal şəkli qaytar
                const mainPreview = document.getElementById('profile-image-preview');
                const sidebarImage = document.getElementById('sidebar-profile-image');
                const originalSrc = mainPreview?.getAttribute('data-original-src');
                
                if (originalSrc) {
                    if (mainPreview) mainPreview.src = originalSrc;
                    if (sidebarImage) sidebarImage.src = originalSrc;
                }
                
                showNotification('Dəyişikliklər ləğv edildi', 'info');
            }
        };
        
        // Bildiriş göstərmə funksiyası
        function showNotification(message, type = 'success') {
            // Köhnə bildirişi sil
            const oldNotification = document.querySelector('.custom-notification');
            if (oldNotification) {
                oldNotification.remove();
            }
            
            // Yeni bildiriş yarat
            const notification = document.createElement('div');
            notification.className = `custom-notification notification-${type}`;
            
            let icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'warning') icon = 'exclamation-triangle';
            if (type === 'info') icon = 'info-circle';
            
            notification.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            // 3 saniyə sonra sil
            setTimeout(() => {
                notification.style.animation = 'notificationSlideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // Form validasiyası
        function initProfileValidation() {
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', function(e) {
                    const phone = this.querySelector('input[name="phone"]')?.value;
                    if (phone) {
                        // Sadə telefon validasiyası
                        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
                        if (!phoneRegex.test(phone)) {
                            e.preventDefault();
                            showNotification('Zəhmət olmasa düzgün telefon nömrəsi daxil edin', 'error');
                        }
                    }
                });
                
                // Orijinal şəkli yadda saxla
                const mainPreview = document.getElementById('profile-image-preview');
                if (mainPreview) {
                    mainPreview.setAttribute('data-original-src', mainPreview.src);
                }
                
                const sidebarImage = document.getElementById('sidebar-profile-image');
                if (sidebarImage) {
                    sidebarImage.setAttribute('data-original-src', sidebarImage.src);
                }
            }
        }
        
        // Form submit olduqda sidebar məlumatlarını yenilə (ƏLAVƏ)
        function updateSidebarOnSubmit() {
            const profileForm = document.getElementById('profile-form');
            if (!profileForm) return;
            
            profileForm.addEventListener('submit', function() {
                // Form submit olduqdan sonra məlumatları yenilə (səhifə refresh olacaq, amma yenə də əlavə edirik)
                const firstName = this.querySelector('input[name="first_name"]')?.value || '';
                const lastName = this.querySelector('input[name="last_name"]')?.value || '';
                const phone = this.querySelector('input[name="phone"]')?.value || '';
                
                // SessionStorage-a yaz ki, refresh-dən sonra da işləsin
                if (firstName || lastName) {
                    sessionStorage.setItem('user_name', `${firstName} ${lastName}`.trim());
                }
                if (phone) {
                    sessionStorage.setItem('user_phone', phone);
                }
            });
        }
        
        // Səhifə yüklənəndə sessionStorage-dan məlumatları qaytar (ƏLAVə)
        function loadFromSessionStorage() {
            const savedName = sessionStorage.getItem('user_name');
            const savedPhone = sessionStorage.getItem('user_phone');
            
            if (savedName) {
                const sidebarName = document.getElementById('sidebar-user-name');
                if (sidebarName) sidebarName.textContent = savedName;
            }
            
            if (savedPhone) {
                const sidebarPhone = document.getElementById('sidebar-user-phone');
                if (sidebarPhone) {
                    sidebarPhone.innerHTML = `<i class="fas fa-phone"></i> ${savedPhone}`;
                    sidebarPhone.style.display = 'block';
                }
            }
            
            // SessionStorage-i təmizlə (bir dəfə istifadə etmək üçün)
            setTimeout(() => {
                sessionStorage.removeItem('user_name');
                sessionStorage.removeItem('user_phone');
            }, 1000);
        }
        
        // ===== 4. SƏBƏT MİQDARI =====
        window.updateQuantity = function(btn, change) {
            const form = btn.closest('form');
            if (!form) return;
            
            const qtySpan = form.querySelector('.qty-value');
            const qtyInput = form.querySelector('.quantity-input');
            
            if (!qtySpan || !qtyInput) return;
            
            // Scroll mövqeyini yadda saxla
            const wrapper = btn.closest('.tab-content')?.querySelector('.products-table-wrapper');
            let scrollPos = 0;
            if (wrapper) {
                scrollPos = wrapper.scrollTop;
            }
            
            let currentQty = parseInt(qtySpan.textContent) || 1;
            let newQty = currentQty + change;
            
            if (newQty > 0) {
                qtySpan.textContent = newQty;
                qtyInput.value = newQty;
                form.submit();
            } else if (newQty === 0) {
                if (confirm('Məhsulu səbətdən silmək istədiyinizə əminsiniz?')) {
                    qtyInput.value = 0;
                    form.submit();
                }
            }
            
            // Scroll mövqeyini bərpa et (form submit olunarsa, bu işləməyəcək)
            setTimeout(() => {
                if (wrapper) {
                    wrapper.scrollTop = scrollPos;
                }
            }, 10);
        };
        
        // ===== 5. MESAJLARI GİZLƏ =====
        setTimeout(() => {
            document.querySelectorAll('.alert').forEach(alert => {
                alert.style.transition = 'opacity 0.5s';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            });
        }, 5000);
        
        // ===== 6. DATA ATTRIBUTE-LARINI YENİLƏ =====
        document.querySelectorAll('.wishlist-item, .cart-item').forEach(item => {
            const nameEl = item.querySelector('.product-name');
            const skuEl = item.querySelector('.product-sku');
            
            if (nameEl) {
                item.dataset.productName = nameEl.textContent.toLowerCase();
            }
            if (skuEl) {
                item.dataset.productSku = skuEl.textContent.toLowerCase();
            }
        });
        
        // ===== 7. SCROLLABLE TABLES ENHANCEMENT =====
        function initScrollableTables() {
            console.log('✅ Scrollable tables enhancement initialized');
            
            // Bütün table wrapperlarını tap
            const tableWrappers = document.querySelectorAll('.products-table-wrapper');
            
            if (!tableWrappers.length) {
                console.warn('⚠️ No table wrappers found');
                return;
            }
            
            // Scroll indikatorunu yoxla
            function checkScrollIndicator(wrapper) {
                if (!wrapper) return;
                
                const hasScroll = wrapper.scrollHeight > wrapper.clientHeight + 5;
                if (hasScroll) {
                    wrapper.classList.add('can-scroll-down');
                } else {
                    wrapper.classList.remove('can-scroll-down');
                }
            }
            
            // Hər bir wrapper üçün scroll hadisəsi əlavə et
            tableWrappers.forEach(wrapper => {
                // Scroll hadisəsini izlə
                wrapper.addEventListener('scroll', function() {
                    // Header-a scroll effekti əlavə et
                    const thead = this.querySelector('thead');
                    if (thead) {
                        if (this.scrollTop > 5) {
                            thead.classList.add('scrolled');
                        } else {
                            thead.classList.remove('scrolled');
                        }
                    }
                    
                    // Scroll indikatoru üçün yoxlama
                    checkScrollIndicator(this);
                });
                
                // İlkin scroll indikatoru yoxlaması
                setTimeout(() => checkScrollIndicator(wrapper), 100);
                
                // Pəncərə ölçüsü dəyişdikdə scroll indikatorunu yenilə
                window.addEventListener('resize', () => checkScrollIndicator(wrapper));
            });
            
            // Tab dəyişdikdə scroll-u sıfırla (əlavə təminat)
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    setTimeout(() => {
                        const activeTab = document.querySelector('.tab-content.active');
                        if (activeTab) {
                            const wrapper = activeTab.querySelector('.products-table-wrapper');
                            if (wrapper) {
                                wrapper.scrollTop = 0;
                                checkScrollIndicator(wrapper);
                            }
                        }
                    }, 100);
                });
            });
            
            // İlkin yoxlama
            setTimeout(() => {
                tableWrappers.forEach(wrapper => checkScrollIndicator(wrapper));
            }, 200);
        }
        
        // Scrollable tables-ı işə sal
        initScrollableTables();
        
        // ===== 8. SƏBƏT CƏMLƏRİNİ YENİLƏ =====
        function updateCartTotal() {
            const cartRows = document.querySelectorAll('#cart-table-body tr');
            let total = 0;
            
            cartRows.forEach(row => {
                if (row.style.display !== 'none') {
                    const totalPriceEl = row.querySelector('.total-price');
                    if (totalPriceEl) {
                        const priceText = totalPriceEl.textContent.replace('$', '');
                        total += parseFloat(priceText) || 0;
                    }
                }
            });
            
            const totalFooter = document.querySelector('.cart-table tfoot');
            if (totalFooter) {
                const totalCell = totalFooter.querySelector('td strong');
                if (totalCell) {
                    totalCell.textContent = `Total: $${total.toFixed(2)}`;
                }
            }
        }
        
        // Axtarış zamanı cəmi yenilə
        if (cartSearch) {
            cartSearch.addEventListener('keyup', function() {
                setTimeout(updateCartTotal, 50);
            });
        }
        
        // ===== 9. KEYBOARD NAVIGATION =====
        document.addEventListener('keydown', function(e) {
            // Escape düyməsi ilə axtarışı təmizlə
            if (e.key === 'Escape') {
                const activeSearch = document.querySelector('.tab-content.active .search-box input');
                if (activeSearch && document.activeElement === activeSearch) {
                    activeSearch.value = '';
                    activeSearch.dispatchEvent(new Event('keyup'));
                    showNotification('Axtarış təmizləndi', 'info');
                }
            }
        });
        
        // ===== 10. RESPONSIVE MENU =====
        function checkMobileView() {
            if (window.innerWidth <= 1000) {
                document.querySelector('.account-sidebar')?.classList.add('mobile');
            } else {
                document.querySelector('.account-sidebar')?.classList.remove('mobile');
            }
        }
        
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        
        // ===== 11. PROFİL VALİDASİYASINI İŞƏ SAL =====
        initProfileValidation();
        
        // ===== 12. SIDEBAR YENİLƏMƏ FUNKSİYALARI ===== (YENİ)
        updateSidebarOnSubmit();
        loadFromSessionStorage();
        
        console.log('✅ All systems ready');
    }
})();

// ===== 13. SCROLL İNDİKATORU ÜÇÜN STİL ƏLAVƏ ET =====
(function addScrollIndicatorStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .products-table-wrapper {
            position: relative;
        }
        
        .products-table-wrapper.can-scroll-down::after {
            content: '';
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            background: linear-gradient(to top, rgba(255,255,255,0.95), transparent);
            pointer-events: none;
            display: block;
            margin-top: -30px;
            z-index: 4;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .products-table-wrapper.can-scroll-down::after {
            opacity: 1;
        }
        
        .products-table thead.scrolled th {
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
            .products-table-wrapper {
                max-height: 400px;
            }
        }
        
        @media (max-width: 480px) {
            .products-table-wrapper {
                max-height: 350px;
            }
        }
    `;
    document.head.appendChild(style);
})();

// ===== 14. NOTİFİKASİYA ANİMASİYALARI ÜÇÜN STİL =====
(function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            animation: notificationSlideIn 0.3s ease;
            max-width: 350px;
            color: white;
        }
        
        .notification-success {
            background: #10b981;
        }
        
        .notification-error {
            background: #ef4444;
        }
        
        .notification-warning {
            background: #f97316;
        }
        
        .notification-info {
            background: #3b82f6;
        }
        
        @keyframes notificationSlideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes notificationSlideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();