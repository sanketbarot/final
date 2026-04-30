/* ======================================== */
/* login.js - Login Page JavaScript         */
/* Light Theme + Performance Optimized      */
/* ======================================== */

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  setupPasswordToggle();
  setupLoginForm();
  setupRememberMe();
  checkAlreadyLoggedIn();
});

// ===== CHECK ALREADY LOGGED IN =====
function checkAlreadyLoggedIn() {
  if (isLoggedIn()) {
    var user = getUser();
    if (user && user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  }
}

// ===== REMEMBER ME =====
function setupRememberMe() {
  var emailInput = document.getElementById('loginEmail');
  var rememberCheckbox = document.getElementById('rememberMe');

  // Load saved email
  var savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }
}

// ===== PASSWORD TOGGLE =====
function setupPasswordToggle() {
  var eyeIcon = document.getElementById('eyeIcon');
  var passInput = document.getElementById('loginPass');

  if (eyeIcon && passInput) {
    eyeIcon.addEventListener('click', function () {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        this.className = 'fas fa-eye-slash eye-icon';
      } else {
        passInput.type = 'password';
        this.className = 'fas fa-eye eye-icon';
      }
      passInput.focus();
    });
  }
}

// ===== LOGIN FORM =====
function setupLoginForm() {
  var form = document.getElementById('loginForm');
  if (!form) return;

  // Real-time field validation
  var emailInput = document.getElementById('loginEmail');
  var passInput = document.getElementById('loginPass');

  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      if (!isValidEmailFormat(this.value.trim())) {
        showFieldError('loginEmail', 'Please enter a valid email address');
      } else {
        clearFieldError('loginEmail');
      }
    });
  }

  if (passInput) {
    passInput.addEventListener('blur', function () {
      if (this.value.length < 6) {
        showFieldError('loginPass', 'Password must be at least 6 characters');
      } else {
        clearFieldError('loginPass');
      }
    });
  }

  // Form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = emailInput ? emailInput.value.trim() : '';
    var password = passInput ? passInput.value : '';

    // Validate
    var hasError = false;

    if (!isValidEmailFormat(email)) {
      showFieldError('loginEmail', 'Please enter a valid email address');
      hasError = true;
    }

    if (password.length < 6) {
      showFieldError('loginPass', 'Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) return;

    // Submit
    var submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    // Remember email
    var rememberCheckbox = document.getElementById('rememberMe');
    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    submitLogin(email, password, submitBtn);
  });
}

// ===== SUBMIT LOGIN =====
function submitLogin(email, password, submitBtn) {
  fetch(API_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(function (res) {
    return res.json().then(function (data) {
      return { ok: res.ok, data: data };
    });
  })
  .then(function (result) {
    setButtonLoading(submitBtn, false);

    if (result.ok && result.data.token) {
      // Save auth data
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      showToast('Welcome back! 🎉', 'success');

      setTimeout(function () {
        if (result.data.user && result.data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          // Check if there's a redirect URL
          var redirect = new URLSearchParams(window.location.search).get('redirect');
          window.location.href = redirect || 'index.html';
        }
      }, 1000);

    } else {
      showLoginError(result.data.message || 'Invalid email or password');
      setButtonLoading(submitBtn, false);
    }
  })
  .catch(function () {
    setButtonLoading(submitBtn, false);
    showLoginError('Server not running. Please start the backend first!');
  });
}

// ===== SHOW LOGIN ERROR =====
function showLoginError(message) {
  var alertEl = document.getElementById('loginAlert');
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

// ===== EMAIL VALIDATION =====
function isValidEmailFormat(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}