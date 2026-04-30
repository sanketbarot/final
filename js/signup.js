/* ======================================== */
/* signup.js - Signup Page JavaScript       */
/* Light Theme + Performance Optimized      */
/* ======================================== */

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  setupPasswordToggle();
  setupPasswordStrength();
  setupSignupForm();
  checkAlreadyLoggedIn();
});

// ===== CHECK ALREADY LOGGED IN =====
function checkAlreadyLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

// ===== PASSWORD TOGGLE =====
function setupPasswordToggle() {
  // Main password
  var eyeIcon = document.getElementById('eyeIcon');
  var passInput = document.getElementById('sPass');

  if (eyeIcon && passInput) {
    eyeIcon.addEventListener('click', function () {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        this.className = 'fas fa-eye-slash eye-icon';
      } else {
        passInput.type = 'password';
        this.className = 'fas fa-eye eye-icon';
      }
    });
  }

  // Confirm password
  var eyeIcon2 = document.getElementById('eyeIcon2');
  var passInput2 = document.getElementById('sCPass');

  if (eyeIcon2 && passInput2) {
    eyeIcon2.addEventListener('click', function () {
      if (passInput2.type === 'password') {
        passInput2.type = 'text';
        this.className = 'fas fa-eye-slash eye-icon';
      } else {
        passInput2.type = 'password';
        this.className = 'fas fa-eye eye-icon';
      }
    });
  }
}

// ===== PASSWORD STRENGTH =====
function setupPasswordStrength() {
  var passInput = document.getElementById('sPass');
  if (!passInput) return;

  passInput.addEventListener('input', function () {
    updatePasswordStrength(this.value);
  });
}

function updatePasswordStrength(password) {
  var segments = document.querySelectorAll('.strength-segment');
  var strengthText = document.getElementById('strengthText');

  if (!segments.length) return;

  // Reset all
  segments.forEach(function (seg) {
    seg.className = 'strength-segment';
  });

  if (!password) {
    if (strengthText) {
      strengthText.textContent = '';
      strengthText.className = 'strength-text';
    }
    return;
  }

  // Calculate strength
  var score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  var level = '';
  var activeSegments = 0;

  if (score <= 2) {
    level = 'weak';
    activeSegments = 1;
  } else if (score <= 3) {
    level = 'medium';
    activeSegments = 2;
  } else {
    level = 'strong';
    activeSegments = 3;
  }

  // Update segments
  for (var i = 0; i < activeSegments; i++) {
    if (segments[i]) {
      segments[i].classList.add(level);
    }
  }

  // Update text
  if (strengthText) {
    var labels = {
      weak: '⚠️ Weak password',
      medium: '👍 Medium password',
      strong: '✅ Strong password'
    };
    strengthText.textContent = labels[level];
    strengthText.className = 'strength-text ' + level;
  }
}

// ===== SIGNUP FORM =====
function setupSignupForm() {
  var form = document.getElementById('signupForm');
  if (!form) return;

  // Real-time validation
  setupFieldValidation();

  // Form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = getVal('sName');
    var email = getVal('sEmail');
    var phone = getVal('sPhone');
    var password = getVal('sPass');
    var cpass = getVal('sCPass');

    if (!validateSignupForm(name, email, phone, password, cpass)) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    submitSignup(name, email, phone, password, submitBtn);
  });
}

// ===== FIELD VALIDATION SETUP =====
function setupFieldValidation() {
  // Name
  var nameInput = document.getElementById('sName');
  if (nameInput) {
    nameInput.addEventListener('blur', function () {
      if (this.value.trim().length < 2) {
        showFieldError('sName', 'Please enter your full name');
      } else {
        clearFieldError('sName');
      }
    });
  }

  // Email
  var emailInput = document.getElementById('sEmail');
  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      if (!isValidEmailFormat(this.value.trim())) {
        showFieldError('sEmail', 'Please enter a valid email address');
      } else {
        clearFieldError('sEmail');
      }
    });
  }

  // Phone - numbers only
  var phoneInput = document.getElementById('sPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    phoneInput.addEventListener('blur', function () {
      if (this.value.length < 10) {
        showFieldError('sPhone', 'Please enter valid 10-digit phone number');
      } else {
        clearFieldError('sPhone');
      }
    });
  }

  // Password
  var passInput = document.getElementById('sPass');
  if (passInput) {
    passInput.addEventListener('blur', function () {
      if (this.value.length < 6) {
        showFieldError('sPass', 'Password must be at least 6 characters');
      } else {
        clearFieldError('sPass');
      }
    });
  }

  // Confirm Password
  var cpassInput = document.getElementById('sCPass');
  if (cpassInput) {
    cpassInput.addEventListener('blur', function () {
      var pass = getVal('sPass');
      if (this.value !== pass) {
        showFieldError('sCPass', 'Passwords do not match');
      } else {
        clearFieldError('sCPass');
      }
    });
  }
}

// ===== VALIDATE SIGNUP FORM =====
function validateSignupForm(name, email, phone, password, cpass) {
  var hasError = false;

  if (name.length < 2) {
    showFieldError('sName', 'Please enter your full name');
    hasError = true;
  }

  if (!isValidEmailFormat(email)) {
    showFieldError('sEmail', 'Please enter a valid email address');
    hasError = true;
  }

  if (phone.replace(/\D/g, '').length < 10) {
    showFieldError('sPhone', 'Please enter valid 10-digit phone number');
    hasError = true;
  }

  if (password.length < 6) {
    showFieldError('sPass', 'Password must be at least 6 characters');
    hasError = true;
  }

  if (password !== cpass) {
    showFieldError('sCPass', 'Passwords do not match');
    hasError = true;
  }

  return !hasError;
}

// ===== SUBMIT SIGNUP =====
function submitSignup(name, email, phone, password, submitBtn) {
  fetch(API_URL + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      email: email,
      phone: phone,
      password: password
    })
  })
  .then(function (res) {
    return res.json().then(function (data) {
      return { ok: res.ok, data: data };
    });
  })
  .then(function (result) {
    setButtonLoading(submitBtn, false);

    if (result.ok) {
      showToast('Account Created! Welcome to DecoStock 🎉', 'success');
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1200);
    } else {
      showSignupError(result.data.message || 'Registration failed. Try again!');
    }
  })
  .catch(function () {
    setButtonLoading(submitBtn, false);
    showSignupError('Server not running. Please start the backend first!');
  });
}

// ===== SHOW SIGNUP ERROR =====
function showSignupError(message) {
  var alertEl = document.getElementById('signupAlert');
  if (alertEl) {
    alertEl.innerHTML =
      '<div class="alert alert-danger">' +
        '<i class="fas fa-exclamation-circle"></i> ' + message +
      '</div>';

    setTimeout(function () {
      alertEl.innerHTML = '';
    }, 5000);
  }
}

// ===== HELPERS =====
function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function isValidEmailFormat(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}