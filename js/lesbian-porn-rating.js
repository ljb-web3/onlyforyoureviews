
/* -------------------------
   Persistent data storage
------------------------- */
let persistentData = {
  // Voting data
  hasVoted: false,
  userVote: null,
  yesVotes: 0,
  noVotes: 0,
  
  // Countdown data - persistent across reloads
  countdownStartDate: null,
  countdownEndDate: null,
  countdownDuration: 30 * 24 * 60 * 60 * 1000, // 30 days default
  countdownPaused: false,
  countdownRemainingTime: null,
  countdownPausedAt: null,
  
  // Other data
  commentCount: 4
};

// Try to load data from localStorage
function loadPersistedData() {
  try {
    const stored = localStorage.getItem('persistent_countdown_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(persistentData, parsed);
      console.log('Loaded persistent data from localStorage');
    }
  } catch (e) {
    console.log('Failed to load persistent data:', e);
  }
}

// Save data to localStorage
function savePersistedData() {
  try {
    localStorage.setItem('persistent_countdown_data', JSON.stringify(persistentData));
  } catch (e) {
    console.log('Failed to save persistent data:', e);
  }
}

// Initialize countdown dates
function initializeCountdownDates() {
  const now = new Date();
  
  // If no stored countdown data exists, create new countdown
  if (!persistentData.countdownStartDate || !persistentData.countdownEndDate) {
    persistentData.countdownStartDate = now.toISOString();
    persistentData.countdownEndDate = new Date(now.getTime() + persistentData.countdownDuration).toISOString();
    savePersistedData();
    console.log('New countdown initialized for 30 days');
  } else {
    console.log('Existing countdown loaded from storage');
  }
  
  return {
    start: new Date(persistentData.countdownStartDate),
    end: new Date(persistentData.countdownEndDate)
  };
}

// Get countdown dates as Date objects
function getCountdownDates() {
  return {
    start: new Date(persistentData.countdownStartDate),
    end: new Date(persistentData.countdownEndDate)
  };
}

/* -------------------------
   Countdown management functions
------------------------- */
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
  persistentData.countdownStartDate = targetStartDate.toISOString();
  persistentData.countdownEndDate = targetEndDate.toISOString();
  persistentData.countdownDuration = targetEndDate.getTime() - targetStartDate.getTime();
  persistentData.countdownPaused = false;
  
  savePersistedData();
  
  console.log('Countdown updated:', {
    start: targetStartDate.toLocaleString(),
    end: targetEndDate.toLocaleString(),
    duration: Math.floor(persistentData.countdownDuration / (1000 * 60 * 60 * 24)) + ' days'
  });
  
  // Restart countdown display
  startCountdown();
  
  return {
    start: targetStartDate,
    end: targetEndDate,
    duration: persistentData.countdownDuration
  };
}

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

function pauseCountdown() {
  const now = new Date();
  const dates = getCountdownDates();
  const remainingTime = dates.end.getTime() - now.getTime();
  
  // Store the remaining time
  persistentData.countdownPaused = true;
  persistentData.countdownRemainingTime = remainingTime;
  persistentData.countdownPausedAt = now.toISOString();
  
  savePersistedData();
  console.log('Countdown paused with', Math.floor(remainingTime / 1000), 'seconds remaining');
  return remainingTime;
}

function resumeCountdown() {
  if (!persistentData.countdownPaused) {
    console.log('Countdown is not currently paused');
    return false;
  }
  
  const now = new Date();
  const newEndDate = new Date(now.getTime() + persistentData.countdownRemainingTime);
  
  // Clear pause data
  persistentData.countdownPaused = false;
  delete persistentData.countdownRemainingTime;
  delete persistentData.countdownPausedAt;
  
  setCountdownDate(newEndDate, persistentData.countdownStartDate);
  console.log('Countdown resumed');
  return true;
}

/* -------------------------
   Small UI helper: toast
------------------------- */
function showToast(msg, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.setAttribute("role", "status");
  toast.style.position = "fixed";
  toast.style.zIndex = "9999";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.bottom = "24px";
  toast.style.padding = "10px 14px";
  toast.style.borderRadius = "10px";
  toast.style.fontSize = "14px";
  toast.style.lineHeight = "1.2";
  toast.style.boxShadow = "0 6px 20px rgba(0,0,0,.18)";
  toast.style.background = type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#111827";
  toast.style.color = "#fff";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity .25s ease, transform .25s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(6px)";
    setTimeout(() => toast.remove(), 250);
  }, 1600);
}

/* -------------------------
   Voting actions
------------------------- */
function vote(choice) {
  if (persistentData.hasVoted) {
    showToast("You have already voted for this creator!", "error");
    return;
  }

  persistentData.hasVoted = true;
  persistentData.userVote = choice;

  // Update counts
  if (choice === "yes") persistentData.yesVotes++;
  else persistentData.noVotes++;

  const totalVotes = persistentData.yesVotes + persistentData.noVotes;

  // Percentages
  let yesPercentage = 0;
  let noPercentage = 0;
  if (totalVotes > 0) {
    yesPercentage = Math.round((persistentData.yesVotes / totalVotes) * 100);
    noPercentage = 100 - yesPercentage;
  }

  // Button states
  const yesBtn = document.getElementById("vote-yes-btn");
  const noBtn = document.getElementById("vote-no-btn");
  if (yesBtn) {
    yesBtn.classList.remove("voted");
    yesBtn.disabled = true;
  }
  if (noBtn) {
    noBtn.classList.remove("voted");
    noBtn.disabled = true;
  }
  if (choice === "yes" && yesBtn) yesBtn.classList.add("voted");
  if (choice !== "yes" && noBtn) noBtn.classList.add("voted");

  // Update UI
  updateVoteDisplay(yesPercentage, noPercentage, persistentData.yesVotes, persistentData.noVotes);

  // Save voting data
  savePersistedData();

  // Non-blocking feedback
  showToast(choice === "yes" ? "Vote recorded: YES" : "Vote recorded: Not this time", "success");
}

function updateVoteDisplay(yesPercentage, noPercentage, yesCount, noCount) {
  const yesFill = document.getElementById("yes-fill");
  const noFill = document.getElementById("no-fill");
  if (yesFill) yesFill.style.width = yesPercentage + "%";
  if (noFill) noFill.style.width = noPercentage + "%";

  const yesText = document.getElementById("yes-result-text");
  const noText = document.getElementById("no-result-text");
  if (yesText) {
    yesText.textContent = `Yes: ${yesPercentage}% (${yesCount.toLocaleString()} vote${yesCount === 1 ? "" : "s"})`;
  }
  if (noText) {
    noText.textContent = `Probably Not: ${noPercentage}% (${noCount.toLocaleString()} vote${noCount === 1 ? "" : "s"})`;
  }
}

/* -------------------------
   Affiliate tracking + redirect
------------------------- */
function trackAffiliate(site = "", category = "", url = "") {
  try {
    const click = {
      site,
      category,
      url: url || window.location.href,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      referrer: document.referrer || "direct",
      sessionId: getSessionId()
    };
    let arr = JSON.parse(localStorage.getItem("affiliate_clicks") || "[]");
    arr.push(click);
    if (arr.length > 1000) arr = arr.slice(-1000);
    localStorage.setItem("affiliate_clicks", JSON.stringify(arr));
  } catch (e) {
    console.log("Affiliate tracking failed:", e?.message || e);
  }

  if (url) {
    // Open in a new tab without blocking dialogs
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// Unique session id helper
function getSessionId() {
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

/* -------------------------
   Subscribe action (simple)
------------------------- */
function handleSubscribe(url = "") {
  if (url) {
    // If you want to track this too:
    trackAffiliate("subscribe", "cta", url);
  }
}

/* -------------------------
   Modal: comments
------------------------- */
function openCommentModal() {
  const m = document.getElementById("commentModal");
  if (m) {
    m.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeCommentModal() {
  const m = document.getElementById("commentModal");
  if (m) {
    m.style.display = "none";
    document.body.style.overflow = "auto";
  }
  const nameEl = document.getElementById("userName");
  const txtEl = document.getElementById("userComment");
  if (nameEl) nameEl.value = "";
  if (txtEl) txtEl.value = "";
}

/* -------------------------
   Comments
------------------------- */
function submitComment(event) {
  event.preventDefault();

  const userName = (document.getElementById("userName")?.value || "").trim();
  const commentText = (document.getElementById("userComment")?.value || "").trim();

  if (!userName || !commentText) {
    showToast("Please fill in both name and comment fields.", "error");
    return;
  }
  if (commentText.length < 10) {
    showToast("Please write a more detailed comment (min 10 chars).", "error");
    return;
  }

  const list = document.getElementById("comments-list");
  if (!list) {
    showToast("Comments container not found.", "error");
    return;
  }

  // Create comment node
  const newComment = document.createElement("div");
  newComment.className = "comment";
  newComment.innerHTML = `
    <div class="comment-author">${userName}</div>
    <div class="comment-time">Just now</div>
    <div class="comment-text">${commentText}</div>
  `;

  // Add at the top
  list.insertBefore(newComment, list.firstChild);

  // Update count
  persistentData.commentCount++;
  const counter = document.getElementById("comments-count");
  if (counter) counter.textContent = `Community Discussion (${persistentData.commentCount} comments)`;

  // Save data
  savePersistedData();

  closeCommentModal();
  showToast("Comment posted!", "success");
}

/* Close modal when clicking outside */
window.addEventListener("click", function (event) {
  const modal = document.getElementById("commentModal");
  if (modal && event.target === modal) {
    closeCommentModal();
  }
});

/* -------------------------
   Creator details navigation
------------------------- */
function viewCreatorDetails(creatorId, url = "") {
  if (url) {
    window.location.href = url;
    return;
  }
  // Fallback route
  window.location.href = `/creators/${encodeURIComponent(creatorId)}`;
}

/* -------------------------
   Countdown + progress (PERSISTENT VERSION)
------------------------- */
let countdownInterval = null;

function startCountdown() {
  // Clear existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  // Check if countdown is paused
  if (persistentData.countdownPaused) {
    const countdownElement = document.getElementById("countdownTimer");
    if (countdownElement) {
      countdownElement.innerHTML = `
        <div style="text-align: center; color: #f59e0b; font-weight: 600; font-size: 1.2em; padding: 20px;">
          COUNTDOWN PAUSED<br><small>Use resumeCountdown() to continue</small>
        </div>
      `;
    }
    return;
  }
  
  const dates = getCountdownDates();
  
  function updateCountdown() {
    const now = Date.now();
    const distance = dates.end.getTime() - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      const timer = document.getElementById("countdownTimer");
      if (timer) {
        timer.innerHTML =
          '<div style="text-align:center;color:#dc2626;font-weight:600;font-size:1.2em;padding:20px;">VOTING CLOSED</div>';
      }
      const yesBtn = document.getElementById("vote-yes-btn");
      const noBtn = document.getElementById("vote-no-btn");
      if (yesBtn) yesBtn.disabled = true;
      if (noBtn) noBtn.disabled = true;
      console.log('Countdown finished!');
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl) daysEl.textContent = String(days);
    if (hoursEl) hoursEl.textContent = String(hours);
    if (minutesEl) minutesEl.textContent = String(minutes);
    if (secondsEl) secondsEl.textContent = String(seconds);
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateProgressBar() {
  const dates = getCountdownDates();
  const total = dates.end.getTime() - dates.start.getTime();
  const elapsed = Date.now() - dates.start.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = progress.toFixed(2) + "%";
}

/* -------------------------
   Status and debug functions
------------------------- */
function getCountdownStatus() {
  const dates = getCountdownDates();
  const now = new Date().getTime();
  const distance = dates.end.getTime() - now;
  const totalDuration = dates.end.getTime() - dates.start.getTime();
  const elapsed = now - dates.start.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  
  const status = {
    isActive: distance > 0,
    isPaused: persistentData.countdownPaused || false,
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
  
  console.log('Countdown Status:', status);
  return status;
}

function showDataStatus() {
  const dates = getCountdownDates();
  const stats = {
    hasVoted: persistentData.hasVoted,
    userVote: persistentData.userVote,
    yesVotes: persistentData.yesVotes,
    noVotes: persistentData.noVotes,
    commentCount: persistentData.commentCount,
    countdownStart: dates.start.toLocaleString(),
    countdownEnd: dates.end.toLocaleString(),
    countdownActive: new Date() < dates.end,
    countdownPaused: persistentData.countdownPaused || false
  };
  
  console.log('Data Status:', stats);
  return stats;
}

/* -------------------------
   Newsletter mini-handler
------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const consentCheckbox = document.getElementById("gdprConsent");
      const email = (emailInput?.value || "").trim();
      const consent = consentCheckbox ? !!consentCheckbox.checked : true;

      if (!email) {
        showToast("Please enter your email.", "error");
        return;
      }
      if (consentCheckbox && !consent) {
        showToast("Please agree to receive marketing emails.", "error");
        return;
      }

      // Optional local persistence
      try {
        const list = JSON.parse(localStorage.getItem("newsletter_signups") || "[]");
        list.push({ email, timestamp: new Date().toISOString(), consent: true });
        localStorage.setItem("newsletter_signups", JSON.stringify(list));
      } catch {}

      // Inline success
      let msg = this.querySelector(".newsletter-message");
      if (!msg) {
        msg = document.createElement("div");
        msg.className = "newsletter-message";
        msg.style.marginTop = "8px";
        this.appendChild(msg);
      }
      msg.textContent = `Thanks! ${email} subscribed.`;
      showToast("Subscribed!", "success");

      if (emailInput) emailInput.value = "";
      if (consentCheckbox) consentCheckbox.checked = false;
    });
  }
});

/* -------------------------
   Init on load
------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  // Load persistent data first
  loadPersistedData();
  
  // Initialize countdown dates from stored data
  initializeCountdownDates();
  
  // Initialize vote display with stored data
  const totalVotes = persistentData.yesVotes + persistentData.noVotes;
  let yesPercentage = 0;
  let noPercentage = 0;
  if (totalVotes > 0) {
    yesPercentage = Math.round((persistentData.yesVotes / totalVotes) * 100);
    noPercentage = 100 - yesPercentage;
  }
  updateVoteDisplay(yesPercentage, noPercentage, persistentData.yesVotes, persistentData.noVotes);
  
  // Restore voting state
  if (persistentData.hasVoted) {
    const yesBtn = document.getElementById("vote-yes-btn");
    const noBtn = document.getElementById("vote-no-btn");
    if (yesBtn) {
      yesBtn.disabled = true;
      if (persistentData.userVote === "yes") yesBtn.classList.add("voted");
    }
    if (noBtn) {
      noBtn.disabled = true;
      if (persistentData.userVote !== "yes") noBtn.classList.add("voted");
    }
  }
  
  // Update comment count
  const counter = document.getElementById("comments-count");
  if (counter) counter.textContent = `Community Discussion (${persistentData.commentCount} comments)`;

  // Start countdown & progress
  startCountdown();
  updateProgressBar();

  // Fancy hover effects on vote buttons
  document.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      if (!this.disabled) this.style.transform = "translateY(-2px)";
    });
    btn.addEventListener("mouseleave", function () {
      if (!this.disabled) this.style.transform = "translateY(0)";
    });
  });

  const dates = getCountdownDates();
  console.log("Countdown will end on:", dates.end.toLocaleString());
  console.log("Current time:", new Date().toLocaleString());
  console.log("Time remaining (ms):", dates.end.getTime() - Date.now());
  console.log("Countdown management functions available: setCountdownDays(), setCountdownHours(), pauseCountdown(), resumeCountdown()");
});

/* -------------------------
   Expose functions globally (for inline handlers)
------------------------- */
window.vote = vote;
window.updateVoteDisplay = updateVoteDisplay;
window.trackAffiliate = trackAffiliate;
window.handleSubscribe = handleSubscribe;
window.openCommentModal = openCommentModal;
window.closeCommentModal = closeCommentModal;
window.submitComment = submitComment;
window.viewCreatorDetails = viewCreatorDetails;

// Countdown management functions
window.setCountdownDate = setCountdownDate;
window.setCountdownDays = setCountdownDays;
window.setCountdownHours = setCountdownHours;
window.pauseCountdown = pauseCountdown;
window.resumeCountdown = resumeCountdown;
window.getCountdownStatus = getCountdownStatus;
window.showDataStatus = showDataStatus;
