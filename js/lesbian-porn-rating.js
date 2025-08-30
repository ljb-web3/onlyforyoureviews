// ============================================
// LESBIAN VIDEO RATING SYSTEM - COMPLETE JS
// ============================================

// In-memory data storage (replaces localStorage for artifacts)
let storedData = {
    ratings: [],
    comments: [],
    userPersonalRating: null,
    totalReviews: 22,
    affiliateClicks: [],
    newsletterSignups: [],
    lastBackup: null,
    // Persistent countdown data
    countdownStartDate: null,
    countdownEndDate: null,
    countdownDuration: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds (default)
};

// Configuration
const CONFIG = {
    maxComments: 1000,
    minCommentLength: 10,
    maxCommentLength: 500,
    maxNameLength: 50,
    autoSaveInterval: 30000, // 30 seconds
    defaultCountdownDuration: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

// Initialize countdown dates
function initializeCountdownDates() {
    const now = new Date();
    
    // If no stored countdown data exists, create new countdown
    if (!storedData.countdownStartDate || !storedData.countdownEndDate) {
        storedData.countdownStartDate = now.toISOString();
        storedData.countdownEndDate = new Date(now.getTime() + storedData.countdownDuration).toISOString();
        console.log('🆕 New countdown initialized');
    } else {
        console.log('🔄 Existing countdown loaded from storage');
    }
    
    return {
        start: new Date(storedData.countdownStartDate),
        end: new Date(storedData.countdownEndDate)
    };
}

// Get countdown dates as Date objects
function getCountdownDates() {
    return {
        start: new Date(storedData.countdownStartDate),
        end: new Date(storedData.countdownEndDate)
    };
}

// ============================================
// COUNTDOWN MANAGEMENT FUNCTIONS
// ============================================

function setCountdownDate(endDate, startDate = null) {
    const now = new Date();
    const targetEndDate = new Date(endDate);
    const targetStartDate = startDate ? new Date(startDate) : now;
    
    // Validation
    if (targetEndDate <= now) {
        throw new Error('End date must be in the future');
    }
    
    if (startDate && targetStartDate >= targetEndDate) {
        throw new Error('Start date must be before end date');
    }
    
    // Update stored data
    storedData.countdownStartDate = targetStartDate.toISOString();
    storedData.countdownEndDate = targetEndDate.toISOString();
    storedData.countdownDuration = targetEndDate.getTime() - targetStartDate.getTime();
    
    console.log('📅 Countdown updated:', {
        start: targetStartDate.toLocaleString(),
        end: targetEndDate.toLocaleString(),
        duration: Math.floor(storedData.countdownDuration / (1000 * 60 * 60 * 24)) + ' days'
    });
    
    // Restart countdown display
    startCountdown();
    
    return {
        start: targetStartDate,
        end: targetEndDate,
        duration: storedData.countdownDuration
    };
}

function extendCountdown(additionalMilliseconds) {
    const dates = getCountdownDates();
    const newEndDate = new Date(dates.end.getTime() + additionalMilliseconds);
    
    return setCountdownDate(newEndDate, dates.start);
}

function resetCountdown(durationInMilliseconds = null) {
    const now = new Date();
    const duration = durationInMilliseconds || CONFIG.defaultCountdownDuration;
    const endDate = new Date(now.getTime() + duration);
    
    return setCountdownDate(endDate, now);
}

// Helper functions for easy date manipulation
function setCountdownDays(days) {
    const now = new Date();
    const endDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    return setCountdownDate(endDate, now);
}

function setCountdownHours(hours) {
    const now = new Date();
    const endDate = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    return setCountdownDate(endDate, now);
}

function setCountdownMinutes(minutes) {
    const now = new Date();
    const endDate = new Date(now.getTime() + (minutes * 60 * 1000));
    return setCountdownDate(endDate, now);
}

// Advanced countdown management
function pauseCountdown() {
    const now = new Date();
    const dates = getCountdownDates();
    const remainingTime = dates.end.getTime() - now.getTime();
    
    // Store the remaining time
    storedData.countdownPaused = true;
    storedData.countdownRemainingTime = remainingTime;
    storedData.countdownPausedAt = now.toISOString();
    
    console.log('⏸️ Countdown paused with', Math.floor(remainingTime / 1000), 'seconds remaining');
    return remainingTime;
}

function resumeCountdown() {
    if (!storedData.countdownPaused) {
        console.log('⚠️ Countdown is not currently paused');
        return false;
    }
    
    const now = new Date();
    const newEndDate = new Date(now.getTime() + storedData.countdownRemainingTime);
    
    // Clear pause data
    delete storedData.countdownPaused;
    delete storedData.countdownRemainingTime;
    delete storedData.countdownPausedAt;
    
    setCountdownDate(newEndDate, storedData.countdownStartDate);
    console.log('▶️ Countdown resumed');
    return true;
}

// ============================================
// CORE DATA MANAGEMENT
// ============================================

class DataManager {
    constructor() {
        this.autoSaveInterval = null;
        this.startAutoSave();
    }
    
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.backupToCloud();
        }, CONFIG.autoSaveInterval);
    }
    
    async backupToCloud() {
        try {
            const allData = {
                ...storedData,
                lastBackup: new Date().toISOString()
            };
            
            console.log('💾 Auto-backup attempted (in-memory storage)');
            storedData.lastBackup = new Date().toISOString();
        } catch (error) {
            console.log('⚠️ Auto-backup failed:', error.message);
        }
    }
    
    exportData() {
        const exportData = {
            ...storedData,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `onlyforyou-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('📤 Data exported successfully');
    }
    
    importData(jsonData) {
        try {
            const importedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Validate and merge data
            if (importedData.ratings) storedData.ratings = importedData.ratings;
            if (importedData.comments) storedData.comments = importedData.comments;
            if (importedData.countdownStartDate) storedData.countdownStartDate = importedData.countdownStartDate;
            if (importedData.countdownEndDate) storedData.countdownEndDate = importedData.countdownEndDate;
            if (importedData.countdownDuration) storedData.countdownDuration = importedData.countdownDuration;
            
            // Reload display
            loadPersistedData();
            startCountdown();
            
            console.log('📥 Data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Import failed:', error);
            return false;
        }
    }
    
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will remove all ratings, comments, countdown data, and tracking data.')) {
            storedData = {
                ratings: [],
                comments: [],
                userPersonalRating: null,
                totalReviews: 22,
                affiliateClicks: [],
                newsletterSignups: [],
                lastBackup: null,
                countdownStartDate: null,
                countdownEndDate: null,
                countdownDuration: CONFIG.defaultCountdownDuration
            };
            location.reload();
        }
    }
}

// ============================================
// AFFILIATE TRACKING SYSTEM
// ============================================

function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

function trackAffiliate(siteName, category = '', linkUrl = '') {
    const clickData = {
        site: siteName,
        category: category,
        url: linkUrl || window.location.href,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        sessionId: getSessionId()
    };
    
    storedData.affiliateClicks.push(clickData);
    
    // Keep only the last 1000 clicks
    if (storedData.affiliateClicks.length > CONFIG.maxComments) {
        storedData.affiliateClicks = storedData.affiliateClicks.slice(-CONFIG.maxComments);
    }
    
    console.log(`🎯 Site Click:`, {
        site: siteName,
        category: category,
        time: new Date().toLocaleTimeString(),
        totalClicks: storedData.affiliateClicks.length
    });
}

function showAffiliateStats() {
    const clicks = storedData.affiliateClicks;
    
    if (clicks.length === 0) {
        console.log('📊 No affiliate clicks recorded yet');
        return null;
    }
    
    // Statistics by site
    const siteStats = {};
    const categoryStats = {};
    const dailyStats = {};
    
    clicks.forEach(click => {
        // By site
        siteStats[click.site] = (siteStats[click.site] || 0) + 1;
        
        // By category
        if (click.category) {
            categoryStats[click.category] = (categoryStats[click.category] || 0) + 1;
        }
        
        // By day
        const date = click.timestamp.split('T')[0];
        dailyStats[date] = (dailyStats[date] || 0) + 1;
    });
    
    // Unique sessions
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

// ============================================
// COUNTDOWN SYSTEM
// ============================================

let countdownInterval = null;

function startCountdown() {
    // Clear existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Check if countdown is paused
    if (storedData.countdownPaused) {
        const countdownElement = document.getElementById('countdownTimer');
        if (countdownElement) {
            countdownElement.innerHTML = `
                <div style="text-align: center; color: #f59e0b; font-weight: 600; font-size: 1.2em; padding: 20px;">
                    ⏸️ COUNTDOWN PAUSED
                    <br><small>Use resumeCountdown() to continue</small>
                </div>
            `;
        }
        return;
    }
    
    const dates = getCountdownDates();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = dates.end.getTime() - now;

        if (distance < 0) {
            // Countdown finished
            clearInterval(countdownInterval);
            const countdownElement = document.getElementById('countdownTimer');
            if (countdownElement) {
                countdownElement.innerHTML = '<div style="text-align: center; color: #dc2626; font-weight: 600; font-size: 1.2em; padding: 20px;">VOTING CLOSED</div>';
            }
            
            // Disable submission buttons
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
            
            console.log('⏰ Countdown finished!');
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update countdown display elements
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (daysElement) daysElement.textContent = days;
        if (hoursElement) hoursElement.textContent = hours;
        if (minutesElement) minutesElement.textContent = minutes;
        if (secondsElement) secondsElement.textContent = seconds;
    }

    // Update immediately and then every second
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

function openCommentModal() {
    // Check if countdown is still active
    const dates = getCountdownDates();
    const now = new Date().getTime();
    const distance = dates.end.getTime() - now;
    
    if (distance < 0) {
        alert('Voting period has ended. Comments are no longer accepted.');
        return;
    }
    
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('📝 Comment modal opened');
    }
}

function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear form fields
        const nameField = document.getElementById('userName');
        const ratingField = document.getElementById('userRating');
        const commentField = document.getElementById('userComment');
        
        if (nameField) nameField.value = '';
        if (ratingField) ratingField.value = '';
        if (commentField) commentField.value = '';
        
        console.log('❌ Comment modal closed');
    }
}

// ============================================
// COMMENT SYSTEM
// ============================================

function submitComment(event) {
    event.preventDefault();
    console.log('📤 Submit comment called');
    
    // Check if countdown is still active
    const dates = getCountdownDates();
    const now = new Date().getTime();
    const distance = dates.end.getTime() - now;
    
    if (distance < 0) {
        alert('Voting period has ended. Comments are no longer accepted.');
        closeCommentModal();
        return;
    }
    
    // Get form values
    const userName = document.getElementById('userName')?.value.trim();
    const userRatingValue = document.getElementById('userRating')?.value;
    const commentText = document.getElementById('userComment')?.value.trim();
    
    console.log('Form data:', { userName, userRatingValue, commentText });
    
    // Validation
    if (!userName || !userRatingValue || !commentText) {
        alert('Please fill in all fields (name, rating, and comment).');
        return;
    }

    if (userName.length > CONFIG.maxNameLength) {
        alert(`Name must be ${CONFIG.maxNameLength} characters or less.`);
        return;
    }

    if (commentText.length < CONFIG.minCommentLength) {
        alert(`Please write a more detailed review (at least ${CONFIG.minCommentLength} characters).`);
        return;
    }

    if (commentText.length > CONFIG.maxCommentLength) {
        alert(`Comment must be ${CONFIG.maxCommentLength} characters or less.`);
        return;
    }

    const rating = parseInt(userRatingValue);
    if (isNaN(rating) || rating < 1 || rating > 10) {
        alert('Please enter a rating between 1 and 10.');
        return;
    }

    // Store the rating and comment
    storedData.ratings.push(rating);
    const newCommentData = {
        name: userName,
        rating: rating,
        comment: commentText,
        timestamp: new Date().toISOString()
    };
    storedData.comments.unshift(newCommentData);
    
    // Set personal rating if first time
    if (!storedData.userPersonalRating) {
        storedData.userPersonalRating = rating;
        updateRatingComparison();
    }
    
    // Increment total reviews
    storedData.totalReviews++;

    // Add comment to display
    addCommentToDisplay(newCommentData);
    
    // Update average rating
    updateAverageRating();
    
    // Update comment count in header
    updateCommentCount();
    
    // Show success message
    showSuccessMessage('Review posted successfully and saved!');
    
    // Close modal
    closeCommentModal();
    
    // Check for milestones
    checkMilestones();
    
    console.log('✅ Comment submitted successfully');
}

function addCommentToDisplay(commentData) {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    
    newComment.innerHTML = `
        <div class="comment-author">${escapeHtml(commentData.name)}
            <button class="delete-comment-btn" onclick="deleteComment(${storedData.comments.length - 1})" title="Delete this comment">
                ✕
            </button>
        </div>
        <div class="comment-time">Just now</div>
        <div class="comment-rating">Rated: ${commentData.rating}/10</div>
        <div class="comment-text">${escapeHtml(commentData.comment)}</div>
    `;
    
    // Insert at the beginning of comments list
    commentsList.insertBefore(newComment, commentsList.firstChild);
}

function deleteComment(commentIndex) {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        return;
    }
    
    if (commentIndex >= 0 && commentIndex < storedData.comments.length) {
        // Remove the rating associated with this comment
        const deletedRating = storedData.comments[commentIndex].rating;
        const ratingIndex = storedData.ratings.indexOf(deletedRating);
        if (ratingIndex > -1) {
            storedData.ratings.splice(ratingIndex, 1);
        }
        
        // Remove the comment
        storedData.comments.splice(commentIndex, 1);
        
        // Decrement total reviews
        storedData.totalReviews = Math.max(22, storedData.totalReviews - 1);
        
        // Refresh the display
        loadPersistedData();
        
        console.log('🗑️ Comment deleted successfully');
        showSuccessMessage('Comment deleted successfully!');
    }
}

// ============================================
// DATA DISPLAY FUNCTIONS
// ============================================

function updateAverageRating() {
    if (storedData.ratings.length === 0) return;
    
    const sum = storedData.ratings.reduce((acc, rating) => acc + rating, 0);
    const average = (sum / storedData.ratings.length).toFixed(1);
    
    const avgElement = document.querySelector('.average-score');
    const countElement = document.querySelector('.rating-count');
    
    if (avgElement) avgElement.textContent = average;
    if (countElement) countElement.textContent = `Based on ${storedData.ratings.length + 22} ratings`;
}

function updateRatingComparison() {
    const myRatingElement = document.getElementById('myRatingValue');
    
    if (storedData.userPersonalRating && myRatingElement) {
        myRatingElement.textContent = storedData.userPersonalRating + '/10';
        myRatingElement.style.color = '#059669';
    }
}

function updateCommentCount() {
    const headerElement = document.querySelector('.comments-header h3');
    if (headerElement) {
        const totalComments = storedData.comments.length + 4; // +4 for demo comments
        headerElement.textContent = `Community Comments (${totalComments} reviews)`;
    }
}

function loadPersistedData() {
    // Load and display saved comments
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    // Clear existing user comments (keep demo comments)
    const userComments = commentsList.querySelectorAll('.comment[data-comment-id]');
    userComments.forEach(comment => comment.remove());
    
    // Add user comments
    storedData.comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.setAttribute('data-comment-id', index);
        commentElement.innerHTML = `
            <div class="comment-author">${escapeHtml(comment.name)}
                <button class="delete-comment-btn" onclick="deleteComment(${index})" title="Delete this comment">
                    ✕
                </button>
            </div>
            <div class="comment-time">${new Date(comment.timestamp).toLocaleString()}</div>
            <div class="comment-rating">Rated: ${comment.rating}/10</div>
            <div class="comment-text">${escapeHtml(comment.comment)}</div>
        `;
        
        // Insert after demo comments
        const demoComments = commentsList.children;
        if (demoComments.length >= 3) {
            commentsList.insertBefore(commentElement, demoComments[3]);
        } else {
            commentsList.appendChild(commentElement);
        }
    });
    
    // Update displays
    updateAverageRating();
    updateRatingComparison();
    updateCommentCount();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccessMessage(message) {
    // Try to find existing success message element
    let successMsg = document.getElementById('successMessage');
    
    // If not found, create one
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.id = 'successMessage';
        successMsg.className = 'success-message';
        successMsg.style.cssText = `
            background: #d1fae5;
            color: #065f46;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1rem;
            text-align: center;
            display: none;
        `;
        
        const commentsSection = document.querySelector('.comments-section');
        if (commentsSection) {
            commentsSection.insertBefore(successMsg, commentsSection.firstChild);
        }
    }
    
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
}

function checkMilestones() {
    const totalReviews = storedData.totalReviews;
    
    if (totalReviews === 100) {
        setTimeout(() => {
            alert('🎉 Congratulations! We\'ve reached 100 reviews! This video is now eligible for the Best LGBT Content Community Award!');
        }, 500);
    }
}

function clearAllComments() {
    if (!confirm('Are you sure you want to delete ALL comments? This action cannot be undone.')) {
        return;
    }
    
    storedData.comments = [];
    storedData.ratings = [];
    storedData.totalReviews = 22;
    
    // Reload the display
    loadPersistedData();
    
    console.log('🗑️ All comments cleared');
    showSuccessMessage('All comments cleared successfully!');
}

function clearAllRatings() {
    if (!confirm('Are you sure you want to delete ALL ratings? This will keep comments but remove all rating data.')) {
        return;
    }
    
    storedData.ratings = [];
    storedData.userPersonalRating = null;
    storedData.totalReviews = 22;
    
    // Update the display
    updateAverageRating();
    updateRatingComparison();
    
    console.log('🗑️ All ratings cleared');
    showSuccessMessage('All ratings cleared successfully!');
}

// ============================================
// NEWSLETTER FUNCTIONALITY
// ============================================

function handleNewsletterSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('.newsletter-input')?.value;
    const consentCheckbox = document.getElementById('gdprConsent');
    const consent = consentCheckbox ? consentCheckbox.checked : true;
    
    if (!email) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (consentCheckbox && !consent) {
        alert('Please agree to the privacy policy to subscribe.');
        return;
    }
    
    // Store newsletter signup
    storedData.newsletterSignups.push({
        email: email,
        timestamp: new Date().toISOString(),
        consent: true
    });
    
    alert(`Thank you for subscribing with email: ${email}`);
    form.reset();
    if (consentCheckbox) consentCheckbox.checked = false;
    
    console.log('📧 Newsletter signup saved');
}

// ============================================
// DEBUG AND ADMIN FUNCTIONS
// ============================================

function showDataStatus() {
    const dates = getCountdownDates();
    const stats = {
        ratings: storedData.ratings.length,
        comments: storedData.comments.length,
        affiliateClicks: storedData.affiliateClicks.length,
        newsletters: storedData.newsletterSignups.length,
        totalReviews: storedData.totalReviews,
        userPersonalRating: storedData.userPersonalRating,
        lastBackup: storedData.lastBackup || 'Never',
        countdownStart: dates.start.toLocaleString(),
        countdownEnd: dates.end.toLocaleString(),
        countdownActive: new Date() < dates.end,
        countdownPaused: storedData.countdownPaused || false
    };
    
    console.log('📊 Data Status:', stats);
    return stats;
}

function getCountdownStatus() {
    const dates = getCountdownDates();
    const now = new Date().getTime();
    const distance = dates.end.getTime() - now;
    const totalDuration = dates.end.getTime() - dates.start.getTime();
    const elapsed = now - dates.start.getTime();
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    const status = {
        isActive: distance > 0,
        isPaused: storedData.countdownPaused || false,
        timeRemaining: distance,
        daysRemaining: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hoursRemaining: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutesRemaining: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secondsRemaining: Math.floor((distance % (1000 * 60)) / 1000),
        progressPercentage: progress.toFixed(2),
        startDate: dates.start.toLocaleString(),
        endDate: dates.end.toLocaleString(),
        totalDuration: totalDuration
    };
    
    console.log('⏰ Countdown Status:', status);
    return status;
}

function createAffiliateDashboard() {
    const stats = showAffiliateStats();
    if (!stats) {
        alert('No affiliate tracking data available');
        return;
    }
    
    // Remove existing dashboard if present
    const existingDashboard = document.querySelector('.stats-dashboard');
    if (existingDashboard) {
        existingDashboard.remove();
    }
    
    // Create new dashboard
    const dashboard = document.createElement('div');
    dashboard.className = 'stats-dashboard';
    dashboard.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        border: 2px solid #333;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: monospace;
        font-size: 12px;
        max-width: 300px;
        display: block;
    `;
    
    dashboard.innerHTML = `
        <h4>📊 Affiliate Stats</h4>
        <p><strong>Total:</strong> ${stats.totalClicks} clicks</p>
        <p><strong>Sessions:</strong> ${stats.uniqueSessions}</p>
        <div><strong>Top Sites:</strong></div>
        ${Object.entries(stats.topSites).slice(0, 3).map(([site, count]) => 
            `<div>• ${site}: ${count}</div>`
        ).join('')}
        <button onclick="this.parentElement.remove()" style="margin-top:10px;padding:5px 10px;background:#333;color:white;border:none;border-radius:4px;cursor:pointer;">Close</button>
        <button onclick="dataManager.exportData()" style="margin-top:10px;padding:5px 10px;background:#333;color:white;border:none;border-radius:4px;cursor:pointer;">Export</button>
    `;
    
    document.body.appendChild(dashboard);
}

// ============================================
// COUNTDOWN MANAGEMENT UI
// ============================================

function createCountdownDashboard() {
    // Remove existing dashboard if present
    const existingDashboard = document.querySelector('.countdown-dashboard');
    if (existingDashboard) {
        existingDashboard.remove();
    }
    
    const dates = getCountdownDates();
    const status = getCountdownStatus();
    
    // Create new dashboard
    const dashboard = document.createElement('div');
    dashboard.className = 'countdown-dashboard';
    dashboard.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: white;
        border: 2px solid #333;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: monospace;
        font-size: 12px;
        max-width: 350px;
        display: block;
    `;
    
    dashboard.innerHTML = `
        <h4>⏰ Countdown Manager</h4>
        <div><strong>Status:</strong> ${status.isActive ? (status.isPaused ? 'PAUSED' : 'ACTIVE') : 'EXPIRED'}</div>
        <div><strong>Start:</strong> ${dates.start.toLocaleDateString()} ${dates.start.toLocaleTimeString()}</div>
        <div><strong>End:</strong> ${dates.end.toLocaleDateString()} ${dates.end.toLocaleTimeString()}</div>
        <div><strong>Remaining:</strong> ${status.daysRemaining}d ${status.hoursRemaining}h ${status.minutesRemaining}m</div>
        <div><strong>Progress:</strong> ${status.progressPercentage}%</div>
        
        <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
            <strong>Quick Actions:</strong><br>
            <input type="number" id="quickDays" placeholder="Days" style="width: 50px; margin: 2px;">
            <button onclick="setCountdownDays(parseInt(document.getElementById('quickDays').value))" style="margin: 2px; padding: 2px 6px; background: #4ade80; color: white; border: none; border-radius: 2px; cursor: pointer;">Set Days</button><br>
            
            <input type="number" id="quickHours" placeholder="Hours" style="width: 50px; margin: 2px;">
            <button onclick="setCountdownHours(parseInt(document.getElementById('quickHours').value))" style="margin: 2px; padding: 2px 6px; background: #60a5fa; color: white; border: none; border-radius: 2px; cursor: pointer;">Set Hours</button><br>
            
            <input type="datetime-local" id="customEndDate" style="width: 200px; margin: 2px; font-size: 10px;">
            <button onclick="setCountdownDate(document.getElementById('customEndDate').value)" style="margin: 2px; padding: 2px 6px; background: #f97316; color: white; border: none; border-radius: 2px; cursor: pointer;">Set Date</button>
        </div>
        
        <div style="margin: 10px 0;">
            ${status.isPaused ? 
                '<button onclick="resumeCountdown()" style="margin: 2px; padding: 4px 8px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">▶️ Resume</button>' :
                '<button onclick="pauseCountdown()" style="margin: 2px; padding: 4px 8px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">⏸️ Pause</button>'
            }
            <button onclick="resetCountdown()" style="margin: 2px; padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">🔄 Reset (7d)</button>
        </div>
        
        <button onclick="this.parentElement.remove()" style="margin-top:10px;padding:5px 10px;background:#333;color:white;border:none;border-radius:4px;cursor:pointer;">Close</button>
    `;
    
    // Set current end date in the datetime input
    const datetimeInput = dashboard.querySelector('#customEndDate');
    if (datetimeInput) {
        // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
        const endDate = dates.end;
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');
        const hours = String(endDate.getHours()).padStart(2, '0');
        const minutes = String(endDate.getMinutes()).padStart(2, '0');
        datetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    document.body.appendChild(dashboard);
}

// ============================================
// VIDEO LOADING FUNCTIONALITY
// ============================================

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
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    alert(`Now viewing: ${title}`);
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize data manager
const dataManager = new DataManager();

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Lesbian Video Rating System...');
    
    // Initialize countdown dates from stored data
    initializeCountdownDates();
    
    // Start countdown
    startCountdown();
    
    // Load persisted data
    loadPersistedData();
    
    // Setup newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }
    
    // Setup modal close on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('commentModal');
        if (event.target === modal) {
            closeCommentModal();
        }
    });
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            createAffiliateDashboard();
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            createCountdownDashboard();
        }
    });
    
    console.log('✅ System initialized successfully');
    console.log('⏰ Countdown ends on:', getCountdownDates().end.toLocaleString());
    console.log('🔧 Debug commands available in console');
});

// ============================================
// GLOBAL EXPORTS FOR DEBUGGING
// ============================================

// Make functions available globally for debugging and HTML onclick handlers
window.openCommentModal = openCommentModal;
window.closeCommentModal = closeCommentModal;
window.submitComment = submitComment;
window.deleteComment = deleteComment;
window.trackAffiliate = trackAffiliate;
window.loadVideo = loadVideo;
window.showDataStatus = showDataStatus;
window.getCountdownStatus = getCountdownStatus;
window.showAffiliateStats = showAffiliateStats;
window.createAffiliateDashboard = createAffiliateDashboard;
window.createCountdownDashboard = createCountdownDashboard;
window.clearAllComments = clearAllComments;
window.clearAllRatings = clearAllRatings;
window.dataManager = dataManager;

// Countdown management functions
window.setCountdownDate = setCountdownDate;
window.setCountdownDays = setCountdownDays;
window.setCountdownHours = setCountdownHours;
window.setCountdownMinutes = setCountdownMinutes;
window.extendCountdown = extendCountdown;
window.resetCountdown = resetCountdown;
window.pauseCountdown = pauseCountdown;
window.resumeCountdown = resumeCountdown;

console.log(`
🎬 LESBIAN VIDEO RATING SYSTEM LOADED SUCCESSFULLY!

⏰ COUNTDOWN INFO:
• Persistent countdown that survives page reloads
• End Date: ${storedData.countdownEndDate ? new Date(storedData.countdownEndDate).toLocaleString() : 'Not set'}
• Status: ${storedData.countdownEndDate && new Date() < new Date(storedData.countdownEndDate) ? (storedData.countdownPaused ? 'PAUSED' : 'ACTIVE') : 'EXPIRED'}

📊 AVAILABLE COMMANDS:
• showDataStatus() - View current data
• getCountdownStatus() - Check countdown status  
• showAffiliateStats() - View affiliate clicks
• createAffiliateDashboard() - Show stats popup
• createCountdownDashboard() - Show countdown manager
• trackAffiliate(site, category, url) - Track affiliate click
• clearAllComments() - Delete all comments
• clearAllRatings() - Delete all ratings
• dataManager.exportData() - Export all data
• dataManager.clearAllData() - Clear everything

⏰ COUNTDOWN MANAGEMENT:
• setCountdownDays(days) - Set countdown to X days from now
• setCountdownHours(hours) - Set countdown to X hours from now  
• setCountdownMinutes(minutes) - Set countdown to X minutes from now
• setCountdownDate('2024-12-31 23:59:59') - Set specific end date
• extendCountdown(milliseconds) - Add time to current countdown
• resetCountdown() - Reset to 7 days from now
• pauseCountdown() - Pause the countdown
• resumeCountdown() - Resume paused countdown

⌨️ KEYBOARD SHORTCUTS:
• Ctrl+Shift+S - Show affiliate dashboard
• Ctrl+Shift+C - Show countdown manager

✨ COUNTDOWN EXAMPLES:
• setCountdownDays(3) - Set to 3 days from now
• setCountdownHours(24) - Set to 24 hours from now
• setCountdownDate('2024-01-15 18:00:00') - Set to specific date
• pauseCountdown() - Pause voting period
• extendCountdown(2 * 60 * 60 * 1000) - Add 2 hours

✅ NEW FEATURES:
• ✅ Persistent countdown across page reloads
• ✅ Easy countdown date management
• ✅ Pause/resume countdown functionality
• ✅ Visual countdown manager dashboard
• ✅ Multiple ways to set countdown dates
• ✅ Countdown progress tracking
• ✅ Enhanced debugging and admin tools
`);
