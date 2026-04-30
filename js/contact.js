/* ======================================== */
/* contact.js - Contact Page JavaScript     */
/* Light Theme + Performance Optimized      */
/* ======================================== */

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  setupContactForm();
  setupFAQ();
  setupCharCount();
  setupInfoCardLinks();
});

// ===== CONTACT FORM =====
function setupContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  // Real-time validation
  setupContactValidation();

  // Form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateContactForm()) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    // Simulate API call (replace with real API)
    setTimeout(function () {
      setButtonLoading(submitBtn, false);
      showContactSuccess();
      form.reset();
      resetCharCount();
    }, 1200);
  });
}

// ===== CONTACT VALIDATION =====
function setupContactValidation() {
  var nameInput = document.getElementById('cName');
  var emailInput = document.getElementById('cEmail');
  var phoneInput = document.getElementById('cPhone');
  var messageInput = document.getElementById('cMessage');

  if (nameInput) {
    nameInput.addEventListener('blur', function () {
      if (this.value.trim().length < 2) {
        showFieldError('cName', 'Please enter your full name');
      } else {
        clearFieldError('cName');
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      if (!isValidEmail(this.value.trim())) {
        showFieldError('cEmail', 'Please enter a valid email address');
      } else {
        clearFieldError('cEmail');
      }
    });
  }

  if (phoneInput) {
    // Allow only numbers
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    phoneInput.addEventListener('blur', function () {
      if (this.value.length > 0 && this.value.length < 10) {
        showFieldError('cPhone', 'Please enter valid 10-digit phone number');
      } else {
        clearFieldError('cPhone');
      }
    });
  }

  if (messageInput) {
    messageInput.addEventListener('blur', function () {
      if (this.value.trim().length < 10) {
        showFieldError('cMessage', 'Message must be at least 10 characters');
      } else {
        clearFieldError('cMessage');
      }
    });
  }
}

// ===== VALIDATE CONTACT FORM =====
function validateContactForm() {
  var name = document.getElementById('cName');
  var email = document.getElementById('cEmail');
  var message = document.getElementById('cMessage');
  var hasError = false;

  if (name && name.value.trim().length < 2) {
    showFieldError('cName', 'Please enter your full name');
    hasError = true;
  }

  if (email && !isValidEmail(email.value.trim())) {
    showFieldError('cEmail', 'Please enter a valid email address');
    hasError = true;
  }

  if (message && message.value.trim().length < 10) {
    showFieldError('cMessage', 'Message must be at least 10 characters');
    hasError = true;
  }

  return !hasError;
}

// ===== SHOW CONTACT SUCCESS =====
function showContactSuccess() {
  var alertEl = document.getElementById('contactAlert');
  if (alertEl) {
    alertEl.innerHTML =
      '<div class="alert alert-success">' +
        '<i class="fas fa-check-circle"></i>' +
        ' Message sent successfully! We will contact you within 24 hours. ✨' +
      '</div>';

    // Auto hide after 5 seconds
    setTimeout(function () {
      alertEl.innerHTML = '';
    }, 5000);
  }

  showToast('Message Sent! ✨', 'success');
}

// ===== CHARACTER COUNT =====
function setupCharCount() {
  var messageInput = document.getElementById('cMessage');
  var charCountEl = document.getElementById('charCount');

  if (!messageInput || !charCountEl) return;

  var maxChars = 500;

  messageInput.addEventListener('input', function () {
    var remaining = maxChars - this.value.length;
    charCountEl.textContent = remaining + ' characters remaining';

    if (remaining < 50) {
      charCountEl.className = 'char-count warning';
    } else {
      charCountEl.className = 'char-count';
    }
  });
}

function resetCharCount() {
  var charCountEl = document.getElementById('charCount');
  if (charCountEl) {
    charCountEl.textContent = '500 characters remaining';
    charCountEl.className = 'char-count';
  }
}

// ===== FAQ ACCORDION =====
function setupFAQ() {
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(function (faq) {
        faq.classList.remove('open');
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

// ===== INFO CARD LINKS =====
function setupInfoCardLinks() {
  // Phone click to call
  var phoneCard = document.getElementById('phoneCard');
  if (phoneCard) {
    phoneCard.addEventListener('click', function () {
      window.location.href = 'tel:+919876543210';
    });
    phoneCard.style.cursor = 'pointer';
  }

  // Email click
  var emailCard = document.getElementById('emailCard');
  if (emailCard) {
    emailCard.addEventListener('click', function () {
      window.location.href = 'mailto:info@decostock.com';
    });
    emailCard.style.cursor = 'pointer';
  }

  // WhatsApp click
  var whatsappCard = document.getElementById('whatsappCard');
  if (whatsappCard) {
    whatsappCard.addEventListener('click', function () {
      window.open('https://wa.me/919876543210', '_blank');
    });
    whatsappCard.style.cursor = 'pointer';
  }
}

// ===== EMAIL VALIDATION HELPER =====
function isValidEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}