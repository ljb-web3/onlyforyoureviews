 // Filter functionality
    function filterCreators(category, button) {
      const cards = document.querySelectorAll('.creator-card');
      const buttons = document.querySelectorAll('.filter-btn');
      
      // Update active button
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Filter cards
      cards.forEach(card => {
        if (category === 'all' || card.dataset.categories.includes(category)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Improved Carousel functionality
    let currentSlide = 0;
    const reviewsCarousel = document.getElementById('reviewsCarousel');
    let cards = [];
    let totalSlides = 0;
    let cardsVisible = 3;
    let maxSlide = 0;

    function initializeCarousel() {
      cards = reviewsCarousel.querySelectorAll('.post-card-reviews');
      totalSlides = cards.length;
      updateCardsVisible();
      updateCarousel();
    }

    function updateCardsVisible() {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        cardsVisible = 1;
      } else if (screenWidth <= 1024) {
        cardsVisible = 2;
      } else {
        cardsVisible = 3;
      }
      maxSlide = Math.max(0, totalSlides - cardsVisible);
    }

    function updateCarousel() {
      // Hide dots and disable carousel if cards fit on screen
      const dotsContainer = document.getElementById('carouselDots');
      if (totalSlides <= cardsVisible) {
        dotsContainer.style.display = 'none';
        reviewsCarousel.style.transform = 'translateX(0)';
        return;
      } else {
        dotsContainer.style.display = 'flex';
      }

      // Calculate transform based on screen size
      let translateX = 0;
      if (window.innerWidth <= 768) {
        // Mobile: full width slides
        translateX = currentSlide * 100;
      } else if (window.innerWidth <= 1024) {
        // Tablet: 50% width slides
        translateX = currentSlide * 50;
      } else {
        // Desktop: 33.333% width slides
        translateX = currentSlide * (100 / 3);
      }
      
      reviewsCarousel.style.transform = `translateX(-${translateX}%)`;
      updateDots();
    }

    function updateDots() {
      const dotsContainer = document.getElementById('carouselDots');
      dotsContainer.innerHTML = '';
      
      const slidesNeeded = Math.max(1, maxSlide + 1);
      
      for (let i = 0; i < slidesNeeded; i++) {
        const dot = document.createElement('button');
        dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
      }
    }

    function goToSlide(slideIndex) {
      currentSlide = Math.max(0, Math.min(slideIndex, maxSlide));
      updateCarousel();
    }

    function nextSlide() {
      if (currentSlide < maxSlide) {
        currentSlide++;
      } else {
        currentSlide = 0; // Loop back to start
      }
      updateCarousel();
    }

    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
      } else {
        currentSlide = maxSlide; // Loop to end
      }
      updateCarousel();
    }

    // Auto-advance carousel every 5 seconds
    function autoAdvance() {
      if (totalSlides > cardsVisible) {
        nextSlide();
      }
    }

    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;

    reviewsCarousel.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    });

    reviewsCarousel.addEventListener('touchend', function(e) {
      endX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    function handleSwipe() {
      const threshold = 50; // Minimum swipe distance
      const diff = startX - endX;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe left - next slide
          nextSlide();
        } else {
          // Swipe right - previous slide
          prevSlide();
        }
      }
    }

    // Initialize carousel on page load
    document.addEventListener('DOMContentLoaded', function() {
      initializeCarousel();
      initializeVideoCarousels();
      
      // Only auto-advance if there are more cards than visible
      if (totalSlides > cardsVisible) {
        setInterval(autoAdvance, 5000);
      }
    });

    // Update carousel on window resize
    window.addEventListener('resize', function() {
      updateCardsVisible();
      
      // Adjust current slide if needed
      if (currentSlide > maxSlide) {
        currentSlide = maxSlide;
      }
      
      updateCarousel();
    });

    // Video carousel functionality
    const videoCarousels = {
      ersties: {
        currentSlide: 0,
        totalSlides: 4,
        carousel: null,
        dots: null
      },
      sheseducedme: {
        currentSlide: 0,
        totalSlides: 4,
        carousel: null,
        dots: null
      }
    };

    function initializeVideoCarousels() {
      // Initialize Ersties carousel
      videoCarousels.ersties.carousel = document.getElementById('erstiesCarousel');
      videoCarousels.ersties.dots = document.getElementById('erstiesDots');
      createVideoDots('ersties');
      
      // Initialize SheSeducedMe carousel
      videoCarousels.sheseducedme.carousel = document.getElementById('sheseducedmeCarousel');
      videoCarousels.sheseducedme.dots = document.getElementById('sheseducedmeDots');
      createVideoDots('sheseducedme');
      
      // Start auto-advance for both carousels
      setInterval(() => autoAdvanceVideo('ersties'), 4000);
      setInterval(() => autoAdvanceVideo('sheseducedme'), 4500); // Slightly different timing
    }

    function createVideoDots(carouselName) {
      const dotsContainer = videoCarousels[carouselName].dots;
      dotsContainer.innerHTML = '';
      
      for (let i = 0; i < videoCarousels[carouselName].totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `video-dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => goToVideoSlide(carouselName, i);
        dotsContainer.appendChild(dot);
      }
    }

    function updateVideoCarousel(carouselName) {
      const carousel = videoCarousels[carouselName];
      const translateX = carousel.currentSlide * 100;
      carousel.carousel.style.transform = `translateX(-${translateX}%)`;
      
      // Update dots
      const dots = carousel.dots.querySelectorAll('.video-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === carousel.currentSlide);
      });
    }

    function nextVideoSlide(carouselName) {
      const carousel = videoCarousels[carouselName];
      carousel.currentSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
      updateVideoCarousel(carouselName);
    }

    function prevVideoSlide(carouselName) {
      const carousel = videoCarousels[carouselName];
      carousel.currentSlide = carousel.currentSlide === 0 ? carousel.totalSlides - 1 : carousel.currentSlide - 1;
      updateVideoCarousel(carouselName);
    }

    function goToVideoSlide(carouselName, slideIndex) {
      videoCarousels[carouselName].currentSlide = slideIndex;
      updateVideoCarousel(carouselName);
    }

    function autoAdvanceVideo(carouselName) {
      nextVideoSlide(carouselName);
    }

    // Placeholder functions
    function generateDetailedMatches() {
      alert('Match generation coming soon!');
    }
    function generateDetailedMatches() {
      alert('Match generation coming soon!');
    }

    function openReview(creatorId) {
      alert(`Opening review for ${creatorId}`);
    }

    function viewAllReviews() {
      alert('Navigating to all reviews page...');
    }

    function trackAffiliate(product) {
      console.log(`Tracking affiliate click for ${product}`);
    }

    // Newsletter form
    document.getElementById('newsletterForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('.newsletter-input').value;
      const consent = document.getElementById('gdprConsent').checked;
      
      if (!consent) {
        alert('Please agree to receive marketing emails.');
        return;
      }
      
      alert(`Thank you for subscribing with ${email}!`);
      this.reset();
      document.getElementById('gdprConsent').checked = false;
    });
