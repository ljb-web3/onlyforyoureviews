/* =========================================================
   Reviews – Voting, Comments, Affiliate, Countdown (No alerts)
   ========================================================= */

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
   Voting state
------------------------- */
let votingData = {
  hasVoted: false,
  userVote: null,
  yesVotes: 0,
  noVotes: 0
};

let commentCount = 4;

/* -------------------------
   Voting actions
------------------------- */
function vote(choice) {
  if (votingData.hasVoted) {
    showToast("You have already voted for this creator!", "error");
    return;
  }

  votingData.hasVoted = true;
  votingData.userVote = choice;

  // Update counts
  if (choice === "yes") votingData.yesVotes++;
  else votingData.noVotes++;

  const totalVotes = votingData.yesVotes + votingData.noVotes;

  // Percentages
  let yesPercentage = 0;
  let noPercentage = 0;
  if (totalVotes > 0) {
    yesPercentage = Math.round((votingData.yesVotes / totalVotes) * 100);
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
  updateVoteDisplay(yesPercentage, noPercentage, votingData.yesVotes, votingData.noVotes);

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
  commentCount++;
  const counter = document.getElementById("comments-count");
  if (counter) counter.textContent = `Community Discussion (${commentCount} comments)`;

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
   Countdown + progress
------------------------- */
const START_DATE = new Date("2025-08-27T02:09:00"); // ISO for reliability
const COUNTDOWN_END_DATE = new Date(START_DATE.getTime() + 30 * 24 * 60 * 60 * 1000);

function startCountdown() {
  function updateCountdown() {
    const now = Date.now();
    const distance = COUNTDOWN_END_DATE.getTime() - now;

    if (distance < 0) {
      const timer = document.getElementById("countdownTimer");
      if (timer) {
        timer.innerHTML =
          '<div style="text-align:center;color:#dc2626;font-weight:600;font-size:1.2em;padding:20px;">VOTING CLOSED</div>';
      }
      const yesBtn = document.getElementById("vote-yes-btn");
      const noBtn = document.getElementById("vote-no-btn");
      if (yesBtn) yesBtn.disabled = true;
      if (noBtn) noBtn.disabled = true;
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
  setInterval(updateCountdown, 1000);
}

function updateProgressBar() {
  const total = COUNTDOWN_END_DATE.getTime() - START_DATE.getTime();
  const elapsed = Date.now() - START_DATE.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = progress.toFixed(2) + "%";
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
  // Initialize vote display
  updateVoteDisplay(0, 0, 0, 0);

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

  console.log("Countdown will end on:", COUNTDOWN_END_DATE.toLocaleString());
  console.log("Current time:", new Date().toLocaleString());
  console.log("Time remaining (ms):", COUNTDOWN_END_DATE.getTime() - Date.now());
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
