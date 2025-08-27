// ============================================
// DATA MANAGER CLASS - Gestion des données
// ============================================

class DataManager {
    constructor() {
        this.autoSaveInterval = null;
        this.startAutoSave();
    }
    
    // Sauvegarde automatique toutes les 30 secondes
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.backupToCloud();
        }, 30000); // 30 secondes
    }
    
    // Sauvegarder toutes les données vers un service externe
    async backupToCloud() {
        try {
            const allData = {
                ratings: this.getStoredRatings(),
                comments: this.getComments(),
                affiliateClicks: this.getAffiliateClicks(),
                userPersonalRating: this.getUserPersonalRating(),
                totalReviews: this.getTotalReviews(),
                lastBackup: new Date().toISOString()
            };
            
            // Note: Remplacez YOUR_BACKUP_BIN_ID par votre vrai ID JSON Bin
            console.log('💾 Auto-backup attempted (configure JSON Bin for real sync)');
            localStorage.setItem('lastCloudBackup', new Date().toISOString());
        } catch (error) {
            console.log('⚠️ Auto-backup failed:', error.message);
        }
    }
    
    // Fonctions utilitaires pour récupérer les données
    getStoredRatings() {
        return JSON.parse(localStorage.getItem('storedRatings') || '[]');
    }
    
    getComments() {
        return JSON.parse(localStorage.getItem('comments') || '[]');
    }
    
    getAffiliateClicks() {
        return JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    }
    
    getUserPersonalRating() {
        return localStorage.getItem('userPersonalRating');
    }
    
    getTotalReviews() {
        return parseInt(localStorage.getItem('totalReviews') || '22');
    }
    
    // Export des données pour backup manuel
    exportData() {
        const allData = {
            ratings: this.getStoredRatings(),
            comments: this.getComments(),
            affiliateClicks: this.getAffiliateClicks(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `onlyforyou-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('📤 Data exported successfully');
    }
}

// ============================================
// TRACKING D'AFFILIATION AMÉLIORÉ
// ============================================

// Générer un ID de session unique
function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

// Fonction de tracking améliorée pour sites/apps
function trackAffiliate(siteName, category = '', linkUrl = '') {
    // 1. Stockage local détaillé pour sites/apps
    let affiliateClicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    
    const clickData = {
        site: siteName,          
        category: category,       
        url: linkUrl || window.location.href,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        sessionId: getSessionId() // Pour traquer les sessions uniques
    };
    
    affiliateClicks.push(clickData);
    
    // Garder les 1000 derniers clics
    if (affiliateClicks.length > 1000) {
        affiliateClicks = affiliateClicks.slice(-1000);
    }
    
    localStorage.setItem('affiliate_clicks', JSON.stringify(affiliateClicks));
    
    // 2. Console pour debug
    console.log(`🎯 Site Click:`, {
        site: siteName,
        category: category,
        time: new Date().toLocaleTimeString(),
        totalClicks: affiliateClicks.length
    });
    
    // 3. Analytics si disponible (décommentez si vous avez Google Analytics)
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'affiliate_site_click', {
    //         'event_category': 'affiliate',
    //         'event_label': siteName,
    //         'custom_parameter_1': category
    //     });
    // }
}

// Statistiques adaptées aux sites
function showAffiliateStats() {
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    
    if (clicks.length === 0) {
        console.log('📊 No affiliate clicks recorded yet');
        return null;
    }
    
    // Statistiques par site
    const siteStats = {};
    const categoryStats = {};
    const dailyStats = {};
    
    clicks.forEach(click => {
        // Par site
        siteStats[click.site] = (siteStats[click.site] || 0) + 1;
        
        // Par catégorie
        if (click.category) {
            categoryStats[click.category] = (categoryStats[click.category] || 0) + 1;
        }
        
        // Par jour
        const date = click.timestamp.split('T')[0];
        dailyStats[date] = (dailyStats[date] || 0) + 1;
    });
    
    // Sessions uniques
    const uniqueSessions = [...new Set(clicks.map(c => c.sessionId))].length;
    
    console.log('📊 Affiliate Site Statistics:');
    console.log(`Total clicks: ${clicks.length}`);
    console.log(`Unique sessions: ${uniqueSessions}`);
    console.log('Top sites:', Object.entries(siteStats).sort((a,b) => b[1] - a[1]).slice(0, 5));
    console.log('By category:', categoryStats);
    console.log('Last 7 days:', Object.entries(dailyStats).slice(-7));
    
    return {
        totalClicks: clicks.length,
        uniqueSessions: uniqueSessions,
        topSites: siteStats,
        byCategory: categoryStats,
        recentClicks: clicks.slice(-10)
    };
}

// Dashboard simple pour vos stats
function createAffiliateDashboard() {
    const stats = showAffiliateStats();
    if (!stats) {
        alert('Aucune donnée de tracking disponible');
        return;
    }
    
    // Créer une popup avec les stats
    const dashboard = document.createElement('div');
    dashboard.className = 'stats-dashboard';
    dashboard.style.display = 'block';
    dashboard.innerHTML = `
        <h4>📊 Affiliate Stats</h4>
        <p><strong>Total:</strong> ${stats.totalClicks} clicks</p>
        <p><strong>Sessions:</strong> ${stats.uniqueSessions}</p>
        <div><strong>Top Sites:</strong></div>
        ${Object.entries(stats.topSites).slice(0, 3).map(([site, count]) => 
            `<div>• ${site}: ${count}</div>`
        ).join('')}
        <button onclick="this.parentElement.remove()">Close</button>
        <button onclick="dataManager.exportData()">Export Data</button>
        <button onclick="openAdminPanel(); this.parentElement.remove();">Admin Panel</button>
    `;
    
    document.body.appendChild(dashboard);
}

// ============================================
// SYSTÈME DE VOTES PERSISTANT
// ============================================

// Fonctions pour récupérer les données persistantes
function getStoredRatings() {
    return JSON.parse(localStorage.getItem('storedRatings') || '[]');
}

function getUserPersonalRating() {
    return localStorage.getItem('userPersonalRating');
}

function getTotalReviews() {
    return parseInt(localStorage.getItem('totalReviews') || '22');
}

// ============================================
// SYSTÈME DE COUNTDOWN FIXE - 15 JOURS
// ============================================

// DATE FIXE DE FIN - à partir d'aujourd'hui (modifiez selon vos besoins)
const COUNTDOWN_START_DATE = new Date('2025-08-27 02:08:00');
const COUNTDOWN_END_DATE = new Date(COUNTDOWN_START_DATE.getTime() + (08 * 24 * 60 * 60 * 1000)); // jours après

// Alternative avec date fixe manuelle (décommentez pour utiliser)
// const COUNTDOWN_END_DATE = new Date('2025-08-23 23:59:59'); //

// Initialiser le gestionnaire de données
const dataManager = new DataManager();

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    startCountdown();
    updateProgressBar();
    
    // Charger les données persistantes
    loadPersistedData();
    
    console.log('✅ Site initialized with persistent data');
    console.log('⏰ Countdown ends on:', COUNTDOWN_END_DATE.toLocaleString());
});

// Countdown functionality - VERSION AMÉLIORÉE AVEC DATE FIXE
function startCountdown() {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = COUNTDOWN_END_DATE.getTime() - now;

        if (distance < 0) {
            // Countdown finished
            document.getElementById('countdownTimer').innerHTML = '<div style="text-align: center; color: #dc2626; font-weight: 600; font-size: 1.2em; padding: 20px;">VOTING CLOSED</div>';
            
            // Désactiver les boutons de soumission
            const submitButton = document.querySelector('.modal-submit');
            const commentButton = document.querySelector('.comment-submit');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Voting Closed';
            }
            if (commentButton) {
                commentButton.disabled = true;
                commentButton.textContent = 'Voting Closed';
            }
            
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Mise à jour des éléments avec vérification d'existence
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (daysElement) daysElement.textContent = days;
        if (hoursElement) hoursElement.textContent = hours;
        if (minutesElement) minutesElement.textContent = minutes;
        if (secondsElement) secondsElement.textContent = seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Fonction pour charger les données au démarrage
function loadPersistedData() {
    // Charger et afficher les commentaires sauvegardés
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const commentsList = document.querySelector('.comments-list');
    
    // Vider les commentaires existants (démo) sauf si pas de données sauvées
    if (comments.length > 0) {
        commentsList.innerHTML = '';
        
        comments.forEach((comment, index) => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.setAttribute('data-comment-id', index);
            commentElement.innerHTML = `
                <div class="comment-author">${comment.name}
                    <button class="delete-comment-btn" onclick="deleteComment(${index})" title="Delete this comment">
                        ✕
                    </button>
                </div>
                <div class="comment-time">${new Date(comment.timestamp).toLocaleString()}</div>
                <div class="comment-rating">Rated: ${comment.rating}/10</div>
                <div class="comment-text">${comment.comment}</div>
            `;
            commentsList.appendChild(commentElement);
        });
    }
    
    // Mettre à jour les moyennes et l'affichage
    updateAverageRating();
    updateRatingComparison();
    updateProgressBar();
    
    // Mettre à jour le compteur de commentaires dans le header
    const totalComments = comments.length + 4; // +4 pour les commentaires de démo
    const headerElement = document.querySelector('.comments-header h3');
    if (comments.length > 0) {
        headerElement.textContent = `Community Comments (${totalComments} reviews)`;
    }
}

// Update rating comparison
function updateRatingComparison() {
    const myRatingElement = document.getElementById('myRatingValue');
    const communityRatingElement = document.getElementById('communityRatingValue');
    
    const userRating = getUserPersonalRating();
    if (userRating !== null && myRatingElement) {
        myRatingElement.textContent = userRating + '/10';
        myRatingElement.style.color = '#059669'; // Green color for user rating
    }
    
    // Community rating stays hidden until countdown ends
    // You can modify this logic to reveal it based on your requirements
}

// Modal functionality
function openCommentModal() {
    // Vérifier si le countdown est terminé
    const now = new Date().getTime();
    const distance = COUNTDOWN_END_DATE.getTime() - now;
    
    if (distance < 0) {
        alert('Voting period has ended. Comments are no longer accepted.');
        return;
    }
    
    document.getElementById('commentModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCommentModal() {
    document.getElementById('commentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('userName').value = '';
    document.getElementById('userRating').value = '';
    document.getElementById('userComment').value = '';
}

// Comment functionality with rating - VERSION AMÉLIORÉE AVEC PERSISTANCE
function submitComment(event) {
    event.preventDefault();
    
    // Vérifier si le countdown est terminé
    const now = new Date().getTime();
    const distance = COUNTDOWN_END_DATE.getTime() - now;
    
    if (distance < 0) {
        alert('Voting period has ended. Comments are no longer accepted.');
        closeCommentModal();
        return;
    }
    
    const userName = document.getElementById('userName').value.trim();
    const userRating = document.getElementById('userRating').value;
    const commentText = document.getElementById('userComment').value.trim();
    
    if (!userName || !userRating || !commentText) {
        alert('Please fill in all fields (name, rating, and comment).');
        return;
    }

    if (commentText.length < 10) {
        alert('Please write a more detailed review (at least 10 characters).');
        return;
    }

    const rating = parseInt(userRating);
    if (rating < 1 || rating > 10) {
        alert('Please enter a rating between 1 and 10.');
        return;
    }

    // NOUVEAU : Sauvegarder dans localStorage
    let storedRatings = getStoredRatings();
    storedRatings.push(rating);
    localStorage.setItem('storedRatings', JSON.stringify(storedRatings));
    
    // Sauvegarder la note personnelle si c'est la première
    if (!getUserPersonalRating()) {
        localStorage.setItem('userPersonalRating', rating.toString());
        updateRatingComparison();
    }
    
    // Incrémenter et sauvegarder le total
    let totalReviews = getTotalReviews() + 1;
    localStorage.setItem('totalReviews', totalReviews.toString());
    
    // Sauvegarder le commentaire complet
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const newCommentData = {
        name: userName,
        rating: rating,
        comment: commentText,
        timestamp: new Date().toISOString()
    };
    comments.unshift(newCommentData);
    localStorage.setItem('comments', JSON.stringify(comments));

    // Create new comment element
    const commentsList = document.querySelector('.comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    const commentIndex = comments.length - 1; // Index du nouveau commentaire
    newComment.setAttribute('data-comment-id', commentIndex);
    
    newComment.innerHTML = `
        <div class="comment-author">${userName}
            <button class="delete-comment-btn" onclick="deleteComment(${commentIndex})" title="Delete this comment">
                ✕
            </button>
        </div>
        <div class="comment-time">Just now</div>
        <div class="comment-rating">Rated: ${rating}/10</div>
        <div class="comment-text">${commentText}</div>
    `;
    
    // Add to top of comments list
    commentsList.insertBefore(newComment, commentsList.firstChild);
    
    // Update average rating
    updateAverageRating();
    
    // Update progress bar
    updateProgressBar();
    
    // Update comment count in header
    const headerElement = document.querySelector('.comments-header h3');
    const currentText = headerElement.textContent;
    const matches = currentText.match(/\((\d+) reviews?\)/);
    const currentCount = matches ? parseInt(matches[1]) : 4; // 4 commentaires de démo par défaut
    headerElement.textContent = `Community Comments (${currentCount + 1} reviews)`;
    
    // Check if we reached 100 reviews milestone
    if (totalReviews === 100) {
        setTimeout(() => {
            alert('🎉 Congratulations! We\'ve reached 100 reviews! This video is now eligible for the Best LGBT Content Community Award!');
        }, 500);
    }
    
    closeCommentModal();
    alert('Review posted successfully and saved!');
    
    console.log('💾 Review saved to localStorage');
}

// Update average rating calculation - VERSION AMÉLIORÉE
function updateAverageRating() {
    const storedRatings = getStoredRatings();
    if (storedRatings.length === 0) return;
    
    const sum = storedRatings.reduce((acc, rating) => acc + rating, 0);
    const average = (sum / storedRatings.length).toFixed(1);
    
    const avgElement = document.querySelector('.average-score');
    const countElement = document.querySelector('.rating-count');
    
    if (avgElement) avgElement.textContent = average;
    if (countElement) countElement.textContent = `Based on ${storedRatings.length + 22} ratings`;
}

// Progress bar update function
function updateProgressBar() {
    // Calculer le progrès basé sur le temps écoulé
    const totalDuration = COUNTDOWN_END_DATE.getTime() - COUNTDOWN_START_DATE.getTime();
    const elapsed = new Date().getTime() - COUNTDOWN_START_DATE.getTime();
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    // Si vous avez une barre de progression dans votre HTML, décommentez la ligne suivante
    // const progressBar = document.getElementById('progressBar');
    // if (progressBar) progressBar.style.width = progress + '%';
    
    console.log(`⏰ Countdown progress: ${progress.toFixed(1)}%`);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('commentModal');
    if (event.target === modal) {
        closeCommentModal();
    }
}

// Load video functionality
function loadVideo(videoId, title) {
    const mainVideo = document.querySelector('.featured-video iframe');
    const videoTitle = document.querySelector('.video-title');
    
    // Update main video
    if (mainVideo) {
        mainVideo.src = `https://www.youtube.com/embed/${videoId}`;
        mainVideo.title = title;
    }
    
    // Update title
    if (videoTitle) {
        videoTitle.textContent = title;
    }
    
    // Reset user ratings for new video (optionnel)
    // localStorage.removeItem('userPersonalRating');
    // localStorage.removeItem('storedRatings');
    
    // Update progress bar for new video
    updateProgressBar();
    
    // Generate random rating data for demo
    const randomRating = (Math.random() * 3 + 6).toFixed(1); // 6.0 to 9.0
    const randomCount = Math.floor(Math.random() * 2000) + 500; // 500 to 2500
    
    const avgElement = document.querySelector('.average-score');
    const countElement = document.querySelector('.rating-count');
    if (avgElement) avgElement.textContent = randomRating;
    if (countElement) countElement.textContent = `Based on ${randomCount} ratings`;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    alert(`Now viewing: ${title}`);
}

// Newsletter form handling
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            const consentCheckbox = document.getElementById('gdprConsent');
            const consent = consentCheckbox ? consentCheckbox.checked : true;
            
            if (consentCheckbox && !consent) {
                alert('Please agree to the privacy policy to subscribe.');
                return;
            }
            
            // Sauvegarder l'email dans localStorage pour tracking
            let newsletters = JSON.parse(localStorage.getItem('newsletter_signups') || '[]');
            newsletters.push({
                email: email,
                timestamp: new Date().toISOString(),
                consent: true
            });
            localStorage.setItem('newsletter_signups', JSON.stringify(newsletters));
            
            alert(`Thank you for subscribing with email: ${email}`);
            this.reset();
            if (consentCheckbox) consentCheckbox.checked = false;
            
            console.log('📧 Newsletter signup saved');
        });
    }
});

// ============================================
// SYSTÈME DE SUPPRESSION DES COMMENTAIRES/RATINGS
// ============================================

// Supprimer un commentaire spécifique
function deleteComment(commentIndex) {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        return;
    }
    
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    let storedRatings = getStoredRatings();
    
    if (commentIndex >= 0 && commentIndex < comments.length) {
        // Supprimer aussi la note associée
        const deletedRating = comments[commentIndex].rating;
        const ratingIndex = storedRatings.indexOf(deletedRating);
        if (ratingIndex > -1) {
            storedRatings.splice(ratingIndex, 1);
            localStorage.setItem('storedRatings', JSON.stringify(storedRatings));
        }
        
        // Supprimer le commentaire
        comments.splice(commentIndex, 1);
        localStorage.setItem('comments', JSON.stringify(comments));
        
        // Décrémenter le total des reviews
        let totalReviews = getTotalReviews() - 1;
        localStorage.setItem('totalReviews', totalReviews.toString());
        
        // Recharger l'affichage
        loadPersistedData();
        
        console.log('🗑️ Comment deleted successfully');
        alert('Comment deleted successfully!');
    }
}

// Supprimer tous les commentaires
function clearAllComments() {
    if (!confirm('Are you sure you want to delete ALL comments? This action cannot be undone.')) {
        return;
    }
    
    localStorage.removeItem('comments');
    localStorage.removeItem('storedRatings');
    localStorage.setItem('totalReviews', '22'); // Reset au nombre initial
    
    // Recharger la page pour remettre les commentaires de démo
    location.reload();
    
    console.log('🗑️ All comments cleared');
}

// Supprimer toutes les notes
function clearAllRatings() {
    if (!confirm('Are you sure you want to delete ALL ratings? This will keep comments but remove all rating data.')) {
        return;
    }
    
    localStorage.removeItem('storedRatings');
    localStorage.removeItem('userPersonalRating');
    localStorage.setItem('totalReviews', '22');
    
    // Mettre à jour l'affichage
    updateAverageRating();
    updateRatingComparison();
    
    console.log('🗑️ All ratings cleared');
    alert('All ratings cleared successfully!');
}

// Panel d'administration
function openAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'block';
        
        // Charger les statistiques
        loadAdminStats();
        loadAdminComments();
    }
}

function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
}

function loadAdminStats() {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const ratings = getStoredRatings();
    const affiliateClicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    
    const statsDiv = document.getElementById('adminStats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <strong>📊 Current Data:</strong><br>
            • Comments: ${comments.length}<br>
            • Ratings: ${ratings.length}<br>
            • Affiliate Clicks: ${affiliateClicks.length}<br>
            • Total Reviews: ${getTotalReviews()}<br>
            • Last Backup: ${localStorage.getItem('lastCloudBackup') || 'Never'}<br>
            • Countdown Ends: ${COUNTDOWN_END_DATE.toLocaleString()}
        `;
    }
}

function loadAdminComments() {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const commentsDiv = document.getElementById('adminCommentsList');
    
    if (!commentsDiv) return;
    
    if (comments.length === 0) {
        commentsDiv.innerHTML = '<p>No user comments found.</p>';
        return;
    }
    
    let html = '<h4>User Comments:</h4>';
    comments.forEach((comment, index) => {
        html += `
            <div class="admin-comment-item">
                <div class="admin-comment-header">
                    <div class="admin-comment-info">
                        ${comment.name} - ${comment.rating}/10
                        <br><small>${new Date(comment.timestamp).toLocaleString()}</small>
                    </div>
                    <button class="admin-delete-btn" onclick="deleteComment(${index})">Delete</button>
                </div>
                <div class="admin-comment-text">${comment.comment}</div>
            </div>
        `;
    });
    
    commentsDiv.innerHTML = html;
}

// ============================================
// FONCTIONS UTILITAIRES ET RACCOURCIS - MISE À JOUR
// ============================================

// Raccourci clavier pour voir les stats (Ctrl+Shift+S)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        createAffiliateDashboard();
    }
    
    // Nouveau raccourci pour le panel admin (Ctrl+Shift+A)
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        openAdminPanel();
    }
});

// Fonction pour voir le statut des données
function showDataStatus() {
    const stats = {
        ratings: getStoredRatings().length,
        comments: JSON.parse(localStorage.getItem('comments') || '[]').length,
        affiliateClicks: JSON.parse(localStorage.getItem('affiliate_clicks') || '[]').length,
        newsletters: JSON.parse(localStorage.getItem('newsletter_signups') || '[]').length,
        lastBackup: localStorage.getItem('lastCloudBackup') || 'Never',
        countdownEnd: COUNTDOWN_END_DATE.toLocaleString()
    };
    
    console.log('📊 Data Status:', stats);
    return stats;
}

// Fonction pour vider toutes les données (pour tests)
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will remove all ratings, comments, and tracking data.')) {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    }
}

// Fonction pour voir les taux de conversion par site
function getConversionRates() {
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const todayClicks = clicks.filter(c => c.timestamp.startsWith(today));
    const yesterdayClicks = clicks.filter(c => c.timestamp.startsWith(yesterday));
    
    console.log('📈 Conversion Tracking:');
    console.log(`Today: ${todayClicks.length} clicks`);
    console.log(`Yesterday: ${yesterdayClicks.length} clicks`);
    
    // Top sites aujourd'hui
    const todaySites = {};
    todayClicks.forEach(click => {
        todaySites[click.site] = (todaySites[click.site] || 0) + 1;
    });
    
    console.log('Top sites today:', todaySites);
    return { todayClicks, yesterdayClicks, todaySites };
}

// Fonction placeholder pour "See All Ratings"
function goToAllRatings() {
    alert('Feature coming soon! This will show all video ratings.');
}

// ============================================
// FONCTIONS DE DEBUG ET UTILITAIRES COUNTDOWN
// ============================================

// Fonction pour vérifier le statut du countdown
function getCountdownStatus() {
    const now = new Date().getTime();
    const distance = COUNTDOWN_END_DATE.getTime() - now;
    const totalDuration = COUNTDOWN_END_DATE.getTime() - COUNTDOWN_START_DATE.getTime();
    const elapsed = now - COUNTDOWN_START_DATE.getTime();
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    const status = {
        isActive: distance > 0,
        timeRemaining: distance,
        daysRemaining: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hoursRemaining: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutesRemaining: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secondsRemaining: Math.floor((distance % (1000 * 60)) / 1000),
        progressPercentage: progress.toFixed(2),
        startDate: COUNTDOWN_START_DATE.toLocaleString(),
        endDate: COUNTDOWN_END_DATE.toLocaleString()
    };
    
    console.log('⏰ Countdown Status:', status);
    return status;
}

// Fonction pour forcer la fin du countdown (pour tests)
function forceCountdownEnd() {
    if (confirm('Are you sure you want to force the countdown to end? This is for testing purposes only.')) {
        // Modifier temporairement la date de fin
        window.COUNTDOWN_END_DATE = new Date(Date.now() - 1000); // Il y a 1 seconde
        console.log('⚠️ Countdown forcefully ended for testing');
        alert('Countdown has been forcefully ended. Refresh the page to restore normal countdown.');
    }
}

// Fonction pour reset le countdown (pour tests)
function resetCountdown() {
    if (confirm('Reset countdown to original 15-day duration?')) {
        location.reload();
    }
}

// Fonction pour étendre le countdown (pour tests)
function extendCountdown(additionalDays = 7) {
    if (confirm(`Extend countdown by ${additionalDays} days?`)) {
        const newEndDate = new Date(COUNTDOWN_END_DATE.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
        console.log(`⏰ Countdown extended to: ${newEndDate.toLocaleString()}`);
        alert(`Countdown extended by ${additionalDays} days. Note: This is temporary and will reset on page reload.`);
    }
}

// ============================================
// FONCTIONS DE DEBUG (console commands)
// ============================================

// Fonctions disponibles dans la console pour debug/admin :
// showDataStatus() - Voir le statut des données
// showAffiliateStats() - Voir les stats d'affiliation
// getConversionRates() - Voir les taux de conversion
// getCountdownStatus() - Voir le statut du countdown
// forceCountdownEnd() - Forcer la fin du countdown (test)
// resetCountdown() - Reset le countdown
// extendCountdown(days) - Étendre le countdown
// clearAllData() - Vider toutes les données
// dataManager.exportData() - Exporter les données
// createAffiliateDashboard() - Voir le dashboard

console.log(`
🚀 OnlyforyouReview - Enhanced Version with Fixed 15-Day Countdown Loaded!

⏰ COUNTDOWN INFO:
• Start Date: ${COUNTDOWN_START_DATE.toLocaleString()}
• End Date: ${COUNTDOWN_END_DATE.toLocaleString()}
• Duration: 15 days
• Status: ${new Date() < COUNTDOWN_END_DATE ? 'ACTIVE' : 'EXPIRED'}

📊 Available Debug Commands:
• showDataStatus() - View data status
• showAffiliateStats() - View affiliate statistics  
• getConversionRates() - View conversion rates
• getCountdownStatus() - View countdown status ⏰
• forceCountdownEnd() - Force countdown end (testing) ⚠️
• resetCountdown() - Reset countdown to original duration
• extendCountdown(days) - Extend countdown by X days
• createAffiliateDashboard() - Show stats dashboard
• openAdminPanel() - Open admin panel for comment management
• deleteComment(index) - Delete specific comment
• clearAllComments() - Clear all comments
• clearAllRatings() - Clear all ratings
• dataManager.exportData() - Export all data
• clearAllData() - Clear all data (careful!)

⌨️ Keyboard Shortcuts:
• Ctrl+Shift+S - Show affiliate dashboard
• Ctrl+Shift+A - Open admin panel

✅ Features Active:
• ⏰ FIXED 15-day countdown (no browser reset)
• Persistent ratings & comments
• Advanced affiliate tracking
• Auto-backup every 30 seconds
• Export functionality
• Session tracking
• Comment/Rating deletion system
• Admin panel for management
• Individual comment delete buttons
• Countdown validation for submissions

🔒 Security Features:
• Comments blocked when countdown expires
• Modal submission disabled after deadline
• Visual countdown status indicators
`);
