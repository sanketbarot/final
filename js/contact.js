/* ======================================== */
/* contact.js - Contact Page JavaScript     */
/* Fixed + Performance Optimized            */
/* ======================================== */

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

  setupContactValidation();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateContactForm()) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    setTimeout(function () {
      setButtonLoading(submitBtn, false);
      showContactSuccess();
      form.reset();
      resetCharCount();
    }, 1000);
  });
}

// ===== VALIDATION =====
function setupContactValidation() {
  var nameInput = document.getElementById('cName');
  var emailInput = document.getElementById('cEmail');
  var phoneInput = document.getElementById('cPhone');
  var messageInput = document.getElementById('cMessage');

  if (nameInput) {
    nameInput.addEventListener('blur', function () {
      if (this.value.trim().length < 2) {
        showFieldError('cName', 'Enter your full name');
      } else {
        clearFieldError('cName');
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      if (!isValidContactEmail(this.value.trim())) {
        showFieldError('cEmail', 'Enter a valid email');
      } else {
        clearFieldError('cEmail');
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
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

function validateContactForm() {
  var name = document.getElementById('cName');
  var email = document.getElementById('cEmail');
  var subject = document.getElementById('cSubject');
  var message = document.getElementById('cMessage');
  var hasError = false;

  if (name && name.value.trim().length < 2) {
    showFieldError('cName', 'Enter your full name');
    hasError = true;
  }

  if (email && !isValidContactEmail(email.value.trim())) {
    showFieldError('cEmail', 'Enter a valid email');
    hasError = true;
  }

  if (subject && !subject.value) {
    showFieldError('cSubject', 'Please select a subject');
    hasError = true;
  }

  if (message && message.value.trim().length < 10) {
    showFieldError('cMessage', 'Message must be at least 10 characters');
    hasError = true;
  }

  return !hasError;
}

// ===== SUCCESS =====
function showContactSuccess() {
  var alertEl = document.getElementById('contactAlert');
  if (alertEl) {
    alertEl.innerHTML =
      '<div class="alert alert-success">' +
        '<i class="fas fa-check-circle"></i> ' +
        'Message sent successfully! We\'ll respond within 24 hours. ✨' +
      '</div>';

    alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

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

  messageInput.addEventListener('input', function () {
    var remaining = 500 - this.value.length;
    charCountEl.textContent = remaining + ' characters remaining';
    charCountEl.className = remaining < 50 ? 'char-count warning' : 'char-count';
  });
}

function resetCharCount() {
  var el = document.getElementById('charCount');
  if (el) {
    el.textContent = '500 characters remaining';
    el.className = 'char-count';
  }
}

// ===== FAQ =====
function setupFAQ() {
  var items = document.querySelectorAll('.faq-item');

  items.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close all
      items.forEach(function (faq) { faq.classList.remove('open'); });

      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ===== INFO CARD LINKS =====
function setupInfoCardLinks() {
  var phoneCard = document.getElementById('phoneCard');
  var emailCard = document.getElementById('emailCard');
  var whatsappCard = document.getElementById('whatsappCard');

  if (phoneCard) {
    phoneCard.addEventListener('click', function () {
      window.location.href = 'tel:+919876543210';
    });
  }

  if (emailCard) {
    emailCard.addEventListener('click', function () {
      window.location.href = 'mailto:info@decostock.com';
    });
  }

  if (whatsappCard) {
    whatsappCard.addEventListener('click', function () {
      window.open('https://wa.me/919876543210', '_blank');
    });
  }
}

// ===== EMAIL HELPER =====
function isValidContactEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}