/* =========================================================
   Cam Shows Reviews – Main Script (no alerts, real actions)
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
   (call with onclick="filterByCategory('solo', event)")
------------------------- */
function filterByCategory(category, evt) {
  // Active styling
  document.querySelectorAll(".category-link").forEach(link => {
    link.classList.remove("active");
    link.style.background = "";
    link.style.color = "";
  });
  
  if (evt?.currentTarget) {
    evt.currentTarget.classList.add("active");
    evt.currentTarget.style.background = "var(--lilac)";
    evt.currentTarget.style.color = "white";
  } else {
    // Find by data attribute or text content
    const active = document.querySelector(`.category-link[data-category="${CSS.escape(category)}"]`) ||
                   Array.from(document.querySelectorAll('.category-link')).find(link => 
                     link.querySelector('span')?.textContent.toLowerCase().includes(category.toLowerCase())
                   );
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
   Post Navigation (Cam Shows Specific)
------------------------- */
function openPost(postId) {
  // Navigate to a dedicated cam show review page
  window.location.href = `/all-cam-shows-reviews/${encodeURIComponent(postId)}`;
  // For SPA, you could instead do:
  // history.pushState({}, "", `/all-cam-shows-reviews/${encodeURIComponent(postId)}`);
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
    btn.classList.toggle("active", btn.textContent.trim() == String(currentPage));
  });

  // Load content for this page
  if (typeof loadPage === "function") {
    loadPage(currentPage);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* -------------------------
   Newsletter Subscription (Cam Shows Context)
------------------------- */
async function subscribeNewsletter(event) {
  event.preventDefault();
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const gdprCheckbox = form.querySelector('input[type="checkbox"]');
  const email = (emailInput?.value || "").trim();
  
  if (!email) {
    showMessage(form, "Please enter a valid email address.", "error");
    return;
  }
  
  if (gdprCheckbox && !gdprCheckbox.checked) {
    showMessage(form, "Please agree to receive marketing emails.", "error");
    return;
  }

  try {
    // TODO: Replace with your real API call
    // await fetch('/api/cam-shows-newsletter', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' }, 
    //   body: JSON.stringify({ email, source: 'cam-shows-reviews' }) 
    // });

    // Inline success message
    showMessage(form, `Thanks! ${email} subscribed to cam show updates.`, "success");

    // Optional: persist locally
    try {
      const list = JSON.parse(localStorage.getItem("cam_shows_newsletter_signups") || "[]");
      list.push({ 
        email, 
        timestamp: new Date().toISOString(), 
        consent: true,
        source: 'cam-shows-reviews'
      });
      localStorage.setItem("cam_shows_newsletter_signups", JSON.stringify(list));
    } catch { /* ignore localStorage errors */ }

    form.reset();
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    showMessage(form, "Something went wrong. Please try again.", "error");
  }
}

function showMessage(form, text, type) {
  let msg = form.querySelector(".newsletter-message");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "newsletter-message";
    msg.style.cssText = `
      margin-top: 8px; 
      padding: 8px 12px; 
      border-radius: 8px; 
      font-size: 0.85rem;
      text-align: center;
    `;
    form.appendChild(msg);
  }
  
  msg.textContent = text;
  msg.style.backgroundColor = type === "error" ? "#fee2e2" : "#dcfce7";
  msg.style.color = type === "error" ? "#dc2626" : "#166534";
  msg.style.border = type === "error" ? "1px solid #fca5a5" : "1px solid #86efac";
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (msg.parentNode) msg.remove();
  }, 5000);
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
   Affiliate Link Tracking (Optional)
------------------------- */
function trackAffiliate(platform, type, url) {
  // Track cam show affiliate clicks
  try {
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'affiliate_click', {
        'platform': platform,
        'type': type,
        'source': 'cam-shows-reviews'
      });
    }
    
    // Store locally for reference
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    clicks.push({
      platform,
      type,
      url,
      timestamp: new Date().toISOString(),
      source: 'cam-shows-reviews'
    });
    localStorage.setItem('affiliate_clicks', JSON.stringify(clicks.slice(-100))); // Keep last 100
  } catch (error) {
    console.log('Tracking error:', error);
  }
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

  // Newsletter form handlers
  document.querySelectorAll('form[name="sidebar-newsletter"], #newsletterForm').forEach(form => {
    form.addEventListener('submit', subscribeNewsletter);
  });

  // Search input suggestions
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", function () {
      if (this.value.length > 2) {
        // Hook: showSuggestions(this.value)
        console.log("Searching cam shows for:", this.value);
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
    const active = Array.from(document.querySelectorAll('.category-link')).find(link => 
      link.querySelector('span')?.textContent.toLowerCase().includes(cat.toLowerCase())
    );
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
      btn.classList.toggle("active", btn.textContent.trim() == String(currentPage));
    });
  }
});

/* -------------------------
   Cam Show Specific Functions (implement as needed)
------------------------- */
function filterPostsBySearch(term) {
  // Implement client-side filtering for cam show reviews
  const posts = document.querySelectorAll('.blog-post');
  const lowerTerm = term.toLowerCase();
  
  posts.forEach(post => {
    const title = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
    const excerpt = post.querySelector('.post-excerpt')?.textContent.toLowerCase() || '';
    const tags = Array.from(post.querySelectorAll('.post-tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
    const performer = post.querySelector('.creator-details h4')?.textContent.toLowerCase() || '';
    
    const matches = title.includes(lowerTerm) || 
                   excerpt.includes(lowerTerm) || 
                   tags.includes(lowerTerm) ||
                   performer.includes(lowerTerm);
    
    post.style.display = matches ? 'block' : 'none';
  });
  
  console.log("[cam-shows] filterPostsBySearch:", term);
}

function applyCategoryFilter(category) {
  const posts = document.querySelectorAll('.blog-post');
  
  if (category === 'all') {
    posts.forEach(post => post.style.display = 'block');
  } else {
    posts.forEach(post => {
      const tags = Array.from(post.querySelectorAll('.post-tag')).map(tag => 
        tag.textContent.toLowerCase().replace(/\s+/g, '')
      );
      const stats = Array.from(post.querySelectorAll('.stat-item')).map(stat => 
        stat.textContent.toLowerCase().replace(/\s+/g, '')
      );
      
      const categoryMap = {
        'solo': ['soloshows', 'solo'],
        'couple': ['coupleshows', 'couple'],
        'interactive': ['interactive'],
        'gg': ['g/gshows', 'ggaction', 'g/gaction'],
        'roleplay': ['roleplay'],
        'hd': ['hdquality', 'hd'],
        'toys': ['toyshows', 'toys'],
        'budget': ['budgetfriendly', 'budget']
      };
      
      const searchTerms = categoryMap[category] || [category];
      const matches = searchTerms.some(term => 
        tags.some(tag => tag.includes(term)) || 
        stats.some(stat => stat.includes(term))
      );
      
      post.style.display = matches ? 'block' : 'none';
    });
  }
  
  console.log("[cam-shows] applyCategoryFilter:", category);
}

function loadPage(pageNumber) {
  // Implement pagination for cam show reviews
  // This would typically involve an API call to fetch more reviews
  console.log("[cam-shows] loadPage:", pageNumber);
}

/* -------------------------
   Expose functions to global scope
------------------------- */
window.searchReviews = searchReviews;
window.filterByCategory = filterByCategory;
window.openPost = openPost;
window.changePage = changePage;
window.subscribeNewsletter = subscribeNewsletter;
window.trackAffiliate = trackAffiliate;
