/* =========================================================
   Blog / Reviews – Main Script (no alerts, real actions)
   ========================================================= */

/* -------------------------
   URL State Helpers
------------------------- */
function getQueryParams() {
  return new URLSearchParams(location.search);
}

function setQueryParams(updates = {}, removeKeys = []) {
  const params = getQueryParams();
  Object.entries(updates).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") params.delete(k);
    else params.set(k, v);
  });
  removeKeys.forEach(k => params.delete(k));
  const newUrl = `${location.pathname}?${params.toString()}`;
  history.pushState({}, "", newUrl);
  return params;
}

/* -------------------------
   Search
------------------------- */
function searchReviews(event) {
  event.preventDefault();
  const searchInput = document.getElementById("searchInput");
  const searchTerm = (searchInput?.value || "").trim();
  if (!searchTerm) return;

  // Reflect in URL, reset page
  setQueryParams({ q: searchTerm }, ["page"]);

  // Trigger your render/filter
  if (typeof filterPostsBySearch === "function") {
    filterPostsBySearch(searchTerm);
  }

  const results = document.getElementById("results");
  if (results) results.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* -------------------------
   Category Filter
   (call with onclick="filterByCategory('news', event)")
------------------------- */
function filterByCategory(category, evt) {
  // Active styling
  document.querySelectorAll(".category-link").forEach(link => {
    link.classList.remove("active");
    link.style.background = "var(--light-lilac)";
    link.style.color = "var(--black)";
  });
  if (evt?.currentTarget) {
    evt.currentTarget.classList.add("active");
    evt.currentTarget.style.background = "var(--lilac)";
    evt.currentTarget.style.color = "white";
  } else {
    const active = document.querySelector(`.category-link[data-category="${CSS.escape(category)}"]`);
    if (active) {
      active.classList.add("active");
      active.style.background = "var(--lilac)";
      active.style.color = "white";
    }
  }

  // Reflect in URL, reset page
  setQueryParams({ cat: category }, ["page"]);

  // Apply real filter
  if (typeof applyCategoryFilter === "function") {
    applyCategoryFilter(category);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* -------------------------
   Post Navigation
------------------------- */
function openPost(postId) {
  // Navigate to a dedicated review page
  window.location.href = `/reviews/${encodeURIComponent(postId)}`;
  // For SPA, you could instead do:
  // history.pushState({}, "", `/reviews/${encodeURIComponent(postId)}`);
  // renderPost(postId);
}

/* -------------------------
   Pagination
------------------------- */
let currentPage = (() => {
  const p = getQueryParams();
  return Number(p.get("page")) > 0 ? Number(p.get("page")) : 1;
})();

function changePage(page) {
  if (page === "prev") currentPage = Math.max(1, currentPage - 1);
  else if (page === "next") currentPage = currentPage + 1;
  else currentPage = Number(page) || 1;

  // Reflect in URL
  setQueryParams({ page: currentPage });

  // Update active button styling
  document.querySelectorAll(".pagination-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page == String(currentPage));
  });

  // Load content for this page
  if (typeof loadPage === "function") {
    loadPage(currentPage);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* -------------------------
   Newsletter Subscription
------------------------- */
async function subscribeNewsletter(event) {
  event.preventDefault();
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const email = (emailInput?.value || "").trim();
  if (!email) return;

  // TODO: Replace with your real API call if/when ready
  // await fetch('/api/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });

  // Inline success message
  let msg = form.querySelector(".newsletter-message");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "newsletter-message";
    msg.style.marginTop = "8px";
    form.appendChild(msg);
  }
  msg.textContent = `Thanks! ${email} subscribed.`;

  // Optional: persist locally
  try {
    const list = JSON.parse(localStorage.getItem("newsletter_signups") || "[]");
    list.push({ email, timestamp: new Date().toISOString(), consent: true });
    localStorage.setItem("newsletter_signups", JSON.stringify(list));
  } catch { /* ignore */ }

  form.reset();
}

/* -------------------------
   Reading Progress (Optional)
------------------------- */
function updateReadingProgress() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.documentElement.style.setProperty("--reading-progress", progress + "%");
}
window.addEventListener("scroll", updateReadingProgress);

/* -------------------------
   Stat Count Animations
------------------------- */
function animateStats() {
  const stats = document.querySelectorAll(".stat-number");
  if (!("IntersectionObserver" in window)) return; // graceful degrade

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stat = entry.target;
        const finalText = stat.textContent;
        const numericValue = parseInt(finalText.replace(/[^\d]/g, ""), 10);
        if (!isNaN(numericValue)) {
          animateNumber(stat, 0, numericValue, finalText);
          observer.unobserve(stat);
        }
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element, start, end, finalText) {
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);

    if (finalText.includes("K")) {
      element.textContent = (current / 1000).toFixed(1) + "K+";
    } else if (finalText.includes(".")) {
      element.textContent = (current / 10).toFixed(1);
    } else {
      element.textContent = current;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = finalText;
    }
  }

  requestAnimationFrame(update);
}

/* -------------------------
   DOMContentLoaded Setup
------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  // Hover effects on blog posts
  document.querySelectorAll(".blog-post").forEach(post => {
    post.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
    });
    post.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Click handler on post images (subtle tap feedback)
  document.querySelectorAll(".post-image").forEach(img => {
    img.addEventListener("click", function () {
      this.style.transform = "scale(1.02)";
      setTimeout(() => { this.style.transform = "scale(1)"; }, 200);
    });
  });

  // Search input suggestions (console or plug your UI)
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", function () {
      if (this.value.length > 2) {
        // Hook: showSuggestions(this.value)
        console.log("Searching for:", this.value);
      }
    });
  }

  // Smooth scrolling for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Initialize animations
  animateStats();

  // Initialize from URL (q, cat, page)
  const params = getQueryParams();
  const q = params.get("q");
  const cat = params.get("cat");
  const page = Number(params.get("page"));

  if (q && typeof filterPostsBySearch === "function") {
    const input = document.getElementById("searchInput");
    if (input) input.value = q;
    filterPostsBySearch(q);
  }

  if (cat && typeof applyCategoryFilter === "function") {
    // Style the matching category-link if present
    const active = document.querySelector(`.category-link[data-category="${CSS.escape(cat)}"]`);
    if (active) {
      active.classList.add("active");
      active.style.background = "var(--lilac)";
      active.style.color = "white";
    }
    applyCategoryFilter(cat);
  }

  if (!isNaN(page) && page > 1) {
    currentPage = page;
    if (typeof loadPage === "function") loadPage(currentPage);
    document.querySelectorAll(".pagination-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.page == String(currentPage));
    });
  }
});

/* -------------------------
   Optional: Stubs (replace with real impl)
------------------------- */
function filterPostsBySearch(term) {
  // Implement client-side filtering or server fetch
  console.log("[stub] filterPostsBySearch:", term);
}

function applyCategoryFilter(category) {
  // Implement filtering or server fetch
  console.log("[stub] applyCategoryFilter:", category);
}

function loadPage(pageNumber) {
  // Implement content loading for the requested page
  console.log("[stub] loadPage:", pageNumber);
}

/* -------------------------
   Expose functions to inline HTML (if needed)
------------------------- */
window.searchReviews = searchReviews;
window.filterByCategory = filterByCategory;
window.openPost = openPost;
window.changePage = changePage;
window.subscribeNewsletter = subscribeNewsletter;
