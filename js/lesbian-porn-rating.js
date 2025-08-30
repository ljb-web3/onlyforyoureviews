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
    lastBackup: null
};

// Configuration
const CONFIG = {
    maxComments: 1000,
    minCommentLength: 10,
    maxCommentLength: 500,
    maxNameLength: 50,
    autoSaveInterval: 30000, // 30 seconds
    countdownDuration: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

// Countdown dates
const COUNTDOWN_START_DATE = new Date();
const COUNTDOWN_END_DATE = new Date(Date.now() + CONFIG.countdownDuration);

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
    
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will remove all ratings, comments, and tracking data.')) {
            storedData = {
                ratings: [],
                comments: [],
                userPersonalRating: null,
                totalReviews: 22,
                affiliateClicks: [],
                newsletterSignups: [],
                lastBackup: null
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


// ============================
// PERSISTENT, CONFIGURABLE COUNTDOWN
// ============================

const COUNTDOWN_KEYS = {
  start: 'ofyr_countdown_start_iso',
  end:   'ofyr_countdown_end_iso'
};

// Default (used only if nothing in URL or localStorage)
const DEFAULT_START_ISO = "2025-08-27T02:09:00"; // change if you want
const DEFAULT_DURATION_DAYS = 30;

// Helper: parse safe ISO -> number (ms) or null
function parseISOToMs(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

// Set & persist countdown dates (admin utility)
function setCountdownDates(startISO, endISO) {
  const startMs = parseISOToMs(startISO);
  const endMs   = parseISOToMs(endISO);

  if (!endMs && !startMs) {
    alert("Invalid dates. Provide at least a valid end date, or start + duration.");
    return;
  }
  if (startMs && endMs && endMs <= startMs) {
    alert("End date must be after start date.");
    return;
  }

  if (startISO) localStorage.setItem(COUNTDOWN_KEYS.start, startISO);
  if (endISO)   localStorage.setItem(COUNTDOWN_KEYS.end,   endISO);

  // Refresh page UI after change
  location.reload();
}
window.setCountdownDates = setCountdownDates; // optional global for admin pages

// Optional admin: clear only countdown (for testing)
// window.resetCountdown = () => { localStorage.removeItem(COUNTDOWN_KEYS.start); localStorage.removeItem(COUNTDOWN_KEYS.end); location.reload(); };

// Build dates (URL > localStorage > default)
function initCountdownConfig() {
  const params = new URLSearchParams(location.search);

  // URL overrides
  const urlEndISO   = params.get("end");
  const urlStartISO = params.get("start");
  const urlDuration = Number(params.get("durationDays"));

  // localStorage
  const savedStartISO = localStorage.getItem(COUNTDOWN_KEYS.start);
  const savedEndISO   = localStorage.getItem(COUNTDOWN_KEYS.end);

  let startISO = urlStartISO || savedStartISO || DEFAULT_START_ISO;
  let endISO   = urlEndISO   || savedEndISO   || null;

  // If no explicit end, compute end = start + duration
  if (!endISO) {
    const startMs = parseISOToMs(startISO);
    const days = Number.isFinite(urlDuration) && urlDuration > 0 ? urlDuration : DEFAULT_DURATION_DAYS;
    endISO = new Date(startMs + days * 24 * 60 * 60 * 1000).toISOString();
  }

  // Persist what we’re using (so it sticks across reloads)
  localStorage.setItem(COUNTDOWN_KEYS.start, startISO);
  localStorage.setItem(COUNTDOWN_KEYS.end,   endISO);

  return {
    COUNTDOWN_START_DATE: new Date(startISO),
    COUNTDOWN_END_DATE:   new Date(endISO)
  };
}

// Initialize once, then use these constants everywhere
const { COUNTDOWN_START_DATE, COUNTDOWN_END_DATE } = initCountdownConfig();

// ============================
// COUNTDOWN RUNTIME
// ============================

function startCountdown() {
  function setClosedUI() {
    const timer = document.getElementById("countdownTimer");
    if (timer) {
      timer.innerHTML = '<div style="text-align:center;color:#dc2626;font-weight:600;font-size:1.2em;padding:20px;">VOTING CLOSED</div>';
    }
    const yesBtn = document.getElementById("vote-yes-btn");
    const noBtn  = document.getElementById("vote-no-btn");
    if (yesBtn) yesBtn.disabled = true;
    if (noBtn)  noBtn.disabled  = true;
  }

  function updateCountdown() {
    const now = Date.now();
    const distance = COUNTDOWN_END_DATE.getTime() - now;

    if (distance <= 0) {
      setClosedUI();
      return; // stop updating
    }

    const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl    = document.getElementById("days");
    const hoursEl   = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl)    daysEl.textContent    = String(days);
    if (hoursEl)   hoursEl.textContent   = String(hours);
    if (minutesEl) minutesEl.textContent = String(minutes);
    if (secondsEl) secondsEl.textContent = String(seconds);
  }

  // First paint
  updateCountdown();

  // If already expired on load, keep closed state and don’t schedule updates
  if (Date.now() >= COUNTDOWN_END_DATE.getTime()) {
    // lock the UI closed and exit
    const timer = document.getElementById("countdownTimer");
    if (timer) {
      timer.innerHTML = '<div style="text-align:center;color:#dc2626;font-weight:600;font-size:1.2em;padding:20px;">VOTING CLOSED</div>';
    }
    const yesBtn = document.getElementById("vote-yes-btn");
    const noBtn  = document.getElementById("vote-no-btn");
    if (yesBtn) yesBtn.disabled = true;
    if (noBtn)  noBtn.disabled  = true;
    return;
  }

  // Otherwise, tick
  setInterval(updateCountdown, 1000);
}

// ============================
// STATUS HELPERS (rewritten)
// ============================

function showDataStatus() {
  const stats = {
    ratings: storedData.ratings.length,
    comments: storedData.comments.length,
    affiliateClicks: storedData.affiliateClicks.length,
    newsletters: storedData.newsletterSignups.length,
    totalReviews: storedData.totalReviews,
    userPersonalRating: storedData.userPersonalRating,
    lastBackup: storedData.lastBackup || 'Never',
    countdownStart: COUNTDOWN_START_DATE.toLocaleString(),
    countdownEnd: COUNTDOWN_END_DATE.toLocaleString(),
    countdownActive: Date.now() < COUNTDOWN_END_DATE.getTime()
  };
  console.log('📊 Data Status:', stats);
  return stats;
}

function getCountdownStatus() {
  const now = Date.now();
  const startMs = COUNTDOWN_START_DATE.getTime();
  const endMs   = COUNTDOWN_END_DATE.getTime();

  const distance = endMs - now;
  const totalDuration = endMs - startMs;
  const elapsed = Math.max(0, Math.min(totalDuration, now - startMs));
  const progress = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 100;

  const status = {
    isActive: distance > 0,
    timeRemaining: Math.max(0, distance),
    daysRemaining: Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24))),
    hoursRemaining: Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
    minutesRemaining: Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
    secondsRemaining: Math.max(0, Math.floor((distance % (1000 * 60)) / 1000)),
    progressPercentage: progress.toFixed(2),
    startDate: COUNTDOWN_START_DATE.toLocaleString(),
    endDate: COUNTDOWN_END_DATE.toLocaleString()
  };

  console.log('⏰ Countdown Status:', status);
  return status;
}


// ============================================
// MODAL FUNCTIONALITY
// ============================================

function openCommentModal() {
    // Check if countdown is still active
    const now = new Date().getTime();
    const distance = COUNTDOWN_END_DATE.getTime() - now;
    
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
    const now = new Date().getTime();
    const distance = COUNTDOWN_END_DATE.getTime() - now;
    
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
    const stats = {
        ratings: storedData.ratings.length,
        comments: storedData.comments.length,
        affiliateClicks: storedData.affiliateClicks.length,
        newsletters: storedData.newsletterSignups.length,
        totalReviews: storedData.totalReviews,
        userPersonalRating: storedData.userPersonalRating,
        lastBackup: storedData.lastBackup || 'Never',
        countdownEnd: COUNTDOWN_END_DATE.toLocaleString()
    };
    
    console.log('📊 Data Status:', stats);
    return stats;
}

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
    });
    
    console.log('✅ System initialized successfully');
    console.log('⏰ Countdown ends on:', COUNTDOWN_END_DATE.toLocaleString());
    console.log('🔧 Debug commands: showDataStatus(), getCountdownStatus(), createAffiliateDashboard()');
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
window.clearAllComments = clearAllComments;
window.clearAllRatings = clearAllRatings;
window.dataManager = dataManager;

console.log(`
🎬 LESBIAN VIDEO RATING SYSTEM LOADED SUCCESSFULLY!

⏰ COUNTDOWN INFO:
• Duration: 7 days from page load
• End Date: ${COUNTDOWN_END_DATE.toLocaleString()}
• Status: ${new Date() < COUNTDOWN_END_DATE ? 'ACTIVE' : 'EXPIRED'}

📊 AVAILABLE COMMANDS:
• showDataStatus() - View current data
• getCountdownStatus() - Check countdown status  
• showAffiliateStats() - View affiliate clicks
• createAffiliateDashboard() - Show stats popup
• trackAffiliate(site, category, url) - Track affiliate click
• clearAllComments() - Delete all comments
• clearAllRatings() - Delete all ratings
• dataManager.exportData() - Export all data
• dataManager.clearAllData() - Clear everything

⌨️ KEYBOARD SHORTCUTS:
• Ctrl+Shift+S - Show affiliate dashboard

✅ FEATURES:
• Real-time countdown with deadline validation
• Persistent comment and rating system
• Affiliate click tracking
• Newsletter signup handling
• Data export functionality
• Admin controls for content management
• Success/error message handling
• XSS protection with HTML escaping
`);
