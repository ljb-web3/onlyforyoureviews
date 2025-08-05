  // Form submission handler
    document.getElementById('newsletterForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const btnText = document.getElementById('btnText');
      const loading = document.getElementById('loading');
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;
      const interests = document.getElementById('interests').value;
      const consent = document.getElementById('consent').checked;
      
      // Validation
      if (!email || !consent) {
        alert('Please fill in your email and agree to the terms.');
        return;
      }
      
      // Show loading state
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      loading.style.display = 'inline-block';
      
      // Simulate API call
      setTimeout(() => {
        // Hide form and show success message
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
        // In real implementation, this would send data to your email service
        console.log('Newsletter signup:', {
          email: email,
          name: name || 'Subscriber',
          interests: interests || 'all',
          timestamp: new Date().toISOString()
        });
        
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loading.style.display = 'none';
      }, 2000);
    });
    
    // Reset form function
    function resetForm() {
      document.getElementById('signup-form').style.display = 'block';
      document.getElementById('successMessage').style.display = 'none';
      document.getElementById('newsletterForm').reset();
    }
    
    // Input validation and styling
    document.getElementById('email').addEventListener('input', function() {
      const email = this.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (email && !emailRegex.test(email)) {
        this.style.borderColor = '#ef4444';
      } else {
        this.style.borderColor = '#e5e7eb';
      }
    });
    
    // Animate stats on load
    function animateStats() {
      const stats = document.querySelectorAll('.stat-number');
      
      stats.forEach((stat, index) => {
        setTimeout(() => {
          stat.style.transform = 'scale(1.1)';
          setTimeout(() => {
            stat.style.transform = 'scale(1)';
          }, 200);
        }, index * 100);
      });
    }
    
    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(animateStats, 500);
      
      // Add focus effects to form inputs
      document.querySelectorAll('.form-input, .form-select').forEach(input => {
        input.addEventListener('focus', function() {
          this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
          this.parentElement.style.transform = 'translateY(0)';
        });
      });
    });
    
    // Add some interactive effects
    document.querySelector('.newsletter-icon').addEventListener('click', function() {
      this.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        this.style.transform = 'rotate(0deg)';
      }, 500);
    });
