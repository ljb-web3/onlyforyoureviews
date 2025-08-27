// Voting functionality - starts with zero votes
let votingData = {
  hasVoted: false,
  userVote: null,
  yesVotes: 0,
  noVotes: 0
};

let commentCount = 4;

function vote(choice) {
  if (votingData.hasVoted) {
    alert('You have already voted for this creator!');
    return;
  }

  votingData.hasVoted = true;
  votingData.userVote = choice;

  // Update vote counts
  if (choice === 'yes') {
    votingData.yesVotes++;
  } else {
    votingData.noVotes++;
  }

  const totalVotes = votingData.yesVotes + votingData.noVotes;
  
  // Calculate percentages (handle division by zero)
  let yesPercentage = 0;
  let noPercentage = 0;
  
  if (totalVotes > 0) {
    yesPercentage = Math.round((votingData.yesVotes / totalVotes) * 100);
    noPercentage = 100 - yesPercentage;
  }

  // Update button states
  const yesBtn = document.getElementById('vote-yes-btn');
  const noBtn = document.getElementById('vote-no-btn');
  
  // Reset button styles
  yesBtn.classList.remove('voted');
  noBtn.classList.remove('voted');
  
  // Mark voted button
  if (choice === 'yes') {
    yesBtn.classList.add('voted');
  } else {
    noBtn.classList.add('voted');
  }

  // Disable buttons
  yesBtn.disabled = true;
  noBtn.disabled = true;

  // Update vote display
  updateVoteDisplay(yesPercentage, noPercentage, votingData.yesVotes, votingData.noVotes);

  // Show confirmation
  if (choice === 'yes') {
    alert('✅ Vote recorded: YES YES YES 💦');
  } else {
    alert('❌ Vote recorded: Probably really straight');
  }
}

function updateVoteDisplay(yesPercentage, noPercentage, yesCount, noCount) {
  document.getElementById('yes-fill').style.width = yesPercentage + '%';
  document.getElementById('no-fill').style.width = noPercentage + '%';
  
  document.getElementById('yes-result-text').textContent = 
    `Yes: ${yesPercentage}% (${yesCount.toLocaleString()} vote${yesCount === 1 ? '' : 's'})`;
  document.getElementById('no-result-text').textContent = 
    `Probably Not: ${noPercentage}% (${noCount.toLocaleString()} vote${noCount === 1 ? '' : 's'})`;
}

function handleSubscribe() {
  if (confirm('This will redirect you to the creator\'s page. Continue?')) {
    alert('Redirecting... (In real implementation, this would open the page)');
  }
}

function trackAffiliate(productId) {
  console.log('Tracking affiliate click for:', productId);
  alert('Redirecting to affiliate content...');
}

// Modal functionality
function openCommentModal() {
  document.getElementById('commentModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeCommentModal() {
  document.getElementById('commentModal').style.display = 'none';
  document.body.style.overflow = 'auto';
  // Clear form
  document.getElementById('userName').value = '';
  document.getElementById('userComment').value = '';
}

// Comment functionality
function submitComment(event) {
  event.preventDefault();
  
  const userName = document.getElementById('userName').value.trim();
  const commentText = document.getElementById('userComment').value.trim();
  
  if (!userName || !commentText) {
    alert('Please fill in both name and comment fields.');
    return;
  }

  if (commentText.length < 10) {
    alert('Please write a more detailed comment (at least 10 characters).');
    return;
  }

  // Create new comment element
  const commentsList = document.getElementById('comments-list');
  const newComment = document.createElement('div');
  newComment.className = 'comment';
  
  newComment.innerHTML = `
    <div class="comment-author">${userName}</div>
    <div class="comment-time">Just now</div>
    <div class="comment-text">${commentText}</div>
  `;
  
  // Add to top of comments list
  commentsList.insertBefore(newComment, commentsList.firstChild);
  
  // Update comment count
  commentCount++;
  document.getElementById('comments-count').textContent = `Community Discussion (${commentCount} comments)`;
  
  // Close modal and show success
  closeCommentModal();
  alert('Comment posted successfully!');
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('commentModal');
  if (event.target === modal) {
    closeCommentModal();
  }
}

// Previous creator functionality
function viewCreatorDetails(creatorId) {
  alert(`Viewing details for ${creatorId}. This would redirect to their results page.`);
}


const START_DATE = new Date('2025-08-27 02:09:00');
const COUNTDOWN_END_DATE = new Date(START_DATE.getTime() + (30 * 24 * 60 * 60 * 1000)); 


// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  startCountdown();
  updateProgressBar();
});

// Countdown functionality
function startCountdown() {
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = COUNTDOWN_END_DATE.getTime() - now;

    if (distance < 0) {
      // Countdown finished
      document.getElementById('countdownTimer').innerHTML = '<div style="text-align: center; color: #dc2626; font-weight: 600; font-size: 1.2em; padding: 20px;">VOTING CLOSED</div>';
      
      // Désactiver les boutons de vote
      const yesBtn = document.getElementById('vote-yes-btn');
      const noBtn = document.getElementById('vote-no-btn');
      if (yesBtn) yesBtn.disabled = true;
      if (noBtn) noBtn.disabled = true;
      
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Mise à jour des éléments avec vérification d'existence
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    if (daysElement) daysElement.textContent = days;
    if (hoursElement) hoursElement.textContent = hours;
    if (minutesElement) minutesElement.textContent = minutes;
    if (secondsElement) secondsElement.textContent = seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Progress bar functionality (optionnel)
function updateProgressBar() {
  const START_DATE = new Date('2025-08-08 00:00:00'); // Même date de début que pour le countdown
  const totalDuration = COUNTDOWN_END_DATE.getTime() - START_DATE.getTime();
  const elapsed = new Date().getTime() - START_DATE.getTime();
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  
  // Si vous avez une barre de progression dans votre HTML, décommentez la ligne suivante
  // document.getElementById('progressBar').style.width = progress + '%';
}

// Newsletter functionality
document.addEventListener('DOMContentLoaded', function() {
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      const consentCheckbox = document.getElementById('gdprConsent');
      const consent = consentCheckbox ? consentCheckbox.checked : true;
      
      if (consentCheckbox && !consent) {
        alert('Please agree to receive marketing emails.');
        return;
      }
      
      alert('Thank you for subscribing!');
      this.querySelector('input[type="email"]').value = '';
      if (consentCheckbox) consentCheckbox.checked = false;
    });
  }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Initialize vote display starting at 0%
  updateVoteDisplay(0, 0, 0, 0);
  
  // Start countdown
  startCountdown();
  
  // Add interactive effects to vote buttons
  const voteButtons = document.querySelectorAll('.vote-btn');
  voteButtons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      if (!this.disabled) {
        this.style.transform = 'translateY(-2px)';
      }
    });
    
    btn.addEventListener('mouseleave', function() {
      if (!this.disabled) {
        this.style.transform = 'translateY(0)';
      }
    });
  });

  // Afficher la date de fin dans la console pour vérification
  console.log('Countdown will end on:', COUNTDOWN_END_DATE.toLocaleString());
  console.log('Current time:', new Date().toLocaleString());
  console.log('Time remaining (ms):', COUNTDOWN_END_DATE.getTime() - new Date().getTime());
});
