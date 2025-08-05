// Smooth scrolling for table of contents links
    document.querySelectorAll('.toc a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Newsletter form handling
    document.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      if (email) {
        alert(`Thank you for subscribing with ${email}! You'll receive our latest reviews.`);
        this.reset();
      }
    });

    // Reading progress indicator (optional enhancement)
    function updateReadingProgress() {
      const article = document.querySelector('.article-body');
      const scrollTop = window.pageYOffset;
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      
      const progress = Math.min(Math.max((scrollTop - articleTop + windowHeight * 0.1) / articleHeight, 0), 1);
      
      // You could add a progress bar here if desired
    }

    window.addEventListener('scroll', updateReadingProgress);

    // Related review click tracking
    document.querySelectorAll('.related-review').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const creatorName = this.querySelector('h4').textContent;
        alert(`Opening review for ${creatorName}...`);
      });
    });

    // Copy link functionality for sharing
    function copyArticleLink() {
      navigator.clipboard.writeText(window.location.href).then(function() {
        alert('Article link copied to clipboard!');
      });
    }

    // Add copy link button to article meta (optional)
    document.addEventListener('DOMContentLoaded', function() {
      const articleMeta = document.querySelector('.article-meta');
      const shareButton = document.createElement('div');
      shareButton.className = 'meta-item';
      shareButton.innerHTML = '<span>🔗</span><span style="cursor: pointer;" onclick="copyArticleLink()">Share</span>';
      shareButton.style.cursor = 'pointer';
      articleMeta.appendChild(shareButton);
    });

    // Animate rating bars on scroll
    function animateRatings() {
      const ratingBars = document.querySelectorAll('.rating-fill');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
              bar.style.width = width;
            }, 100);
          }
        });
      }, { threshold: 0.5 });

      ratingBars.forEach(bar => observer.observe(bar));
    }

    // Initialize animations
    document.addEventListener('DOMContentLoaded', animateRatings);
