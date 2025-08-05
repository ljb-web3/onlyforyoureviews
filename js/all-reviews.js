// Search functionality
    function searchReviews(event) {
      event.preventDefault();
      const searchTerm = document.getElementById('searchInput').value;
      if (searchTerm.trim()) {
        alert(`Searching for: "${searchTerm}"`);
        // In real implementation: filter posts and reload content
      }
    }

    // Category filtering
    function filterByCategory(category) {
      alert(`Filtering by category: ${category}`);
      // In real implementation: filter posts by category
      
      // Update active category styling
      document.querySelectorAll('.category-link').forEach(link => {
        link.style.background = 'var(--light-lilac)';
        link.style.color = 'var(--black)';
      });
      
      event.target.closest('.category-link').style.background = 'var(--lilac)';
      event.target.closest('.category-link').style.color = 'white';
    }

    // Post navigation
    function openPost(postId) {
      alert(`Opening full review for: ${postId}`);
      // In real implementation: window.location.href = `/reviews/${postId}`;
    }

    // Pagination
    function changePage(page) {
      if (page === 'prev') {
        currentPage = Math.max(1, currentPage - 1);
      } else if (page === 'next') {
        currentPage = currentPage + 1;
      } else {
        currentPage = page;
      }
      
      alert(`Loading page ${currentPage}`);
      
      // Update pagination styling
      document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // In real implementation: load new content and update pagination
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Newsletter subscription
    function subscribeNewsletter(event) {
      event.preventDefault();
      const email = event.target.querySelector('input[type="email"]').value;
      alert(`Thank you for subscribing with ${email}! You'll receive our latest reviews.`);
      event.target.reset();
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      // Add hover effects to blog posts
      document.querySelectorAll('.blog-post').forEach(post => {
        post.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
        });
        
        post.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
        });
      });

      // Add click handlers to post images
      document.querySelectorAll('.post-image').forEach(img => {
        img.addEventListener('click', function() {
          this.style.transform = 'scale(1.02)';
          setTimeout(() => {
            this.style.transform = 'scale(1)';
          }, 200);
        });
      });

      // Search input functionality
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('keyup', function() {
          if (this.value.length > 2) {
            // In real implementation: show search suggestions
            console.log('Searching for:', this.value);
          }
        });
      }

      // Smooth scrolling for internal links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    });

    // Reading progress (optional enhancement)
    function updateReadingProgress() {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      // Could add a progress bar here if desired
      document.documentElement.style.setProperty('--reading-progress', progress + '%');
    }

    window.addEventListener('scroll', updateReadingProgress);

    // Stats animation on scroll
    function animateStats() {
      const stats = document.querySelectorAll('.stat-number');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const stat = entry.target;
            const finalValue = stat.textContent;
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
            
            if (!isNaN(numericValue)) {
              animateNumber(stat, 0, numericValue, finalValue);
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
        
        if (finalText.includes('K')) {
          element.textContent = (current / 1000).toFixed(1) + 'K+';
        } else if (finalText.includes('.')) {
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

    // Initialize animations
    document.addEventListener('DOMContentLoaded', animateStats);

    // FIXED: Removed problematic lazy loading code that was causing images to disappear
    // The images now load normally without any opacity manipulation

