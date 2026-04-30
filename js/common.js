/* ======================================== */
/* common.js - Shared JavaScript All Pages  */
/* Light Theme + Glass UI Version           */
/* Performance Optimized + Full Responsive  */
/* ======================================== */

// ===== API BASE URL =====
var API_URL = 'http://localhost:5000/api';

// ===== DEBOUNCE (Performance) =====
function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

// ===== NAVBAR SCROLL EFFECT (Optimized) =====
var lastScroll = 0;
var navScrollHandler = debounce(function () {
  var nav = document.getElementById('navbar');
  if (!nav) return;

  var currentScroll = window.scrollY;

  if (currentScroll > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Hide/Show navbar on scroll direction
  if (currentScroll > 300) {
    if (currentScroll > lastScroll) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
  } else {
    nav.style.transform = 'translateY(0)';
  }

  lastScroll = currentScroll;
}, 10);

window.addEventListener('scroll', navScrollHandler, { passive: true });

// ===== MOBILE NAV TOGGLE =====
document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    // Toggle menu
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navMenu.classList.toggle('open');

      // Toggle icon
      if (navMenu.classList.contains('open')) {
        navToggle.innerHTML = '<i class="fas fa-times"></i>';
        document.body.style.overflow = 'hidden'; // Prevent scroll
      } else {
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
      }
    });

    // Close on link click
    var links = navMenu.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
      });
    }

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
      }
    });

    // Close on resize (if screen becomes desktop)
    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth > 768) {
        navMenu.classList.remove('open');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
      }
    }, 200));
  }
});

// ===== TOAST NOTIFICATION =====
function showToast(message, type) {
  var toast = document.getElementById('toast');
  if (!toast) return;

  type = type || 'success';
  var icon = type === 'success' ? 'check-circle' : 'exclamation-circle';

  toast.className = 'toast toast-' + type + ' show';
  toast.innerHTML = '<i class="fas fa-' + icon + '"></i> ' + message;

  // Auto hide
  setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}

// ===== FORMAT PRICE =====
function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}

// ===== STOCK BADGE =====
function getStockBadge(stock) {
  if (stock === 0) {
    return '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Out of Stock</span>';
  } else if (stock <= 5) {
    return '<span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Only ' + stock + ' left!</span>';
  } else {
    return '<span class="badge badge-success"><i class="fas fa-check-circle"></i> ' + stock + ' In Stock</span>';
  }
}

// ===== STAR RATING =====
function getStarRating(rating) {
  var html = '';
  var full = Math.floor(rating);
  var half = rating % 1 >= 0.5 ? 1 : 0;
  var empty = 5 - full - half;

  for (var i = 0; i < full; i++) {
    html += '<i class="fas fa-star" style="color:#fdcb6e;"></i>';
  }
  if (half) {
    html += '<i class="fas fa-star-half-alt" style="color:#fdcb6e;"></i>';
  }
  for (var j = 0; j < empty; j++) {
    html += '<i class="far fa-star" style="color:#dfe6e9;"></i>';
  }

  return html + ' <span style="color:var(--text-secondary);font-weight:600;margin-left:4px;">' + rating + '</span>';
}

// ===== AUTH HELPERS =====
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  var user = getUser();
  return user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully!', 'success');
  setTimeout(function () {
    window.location.href = 'login.html';
  }, 800);
}

// ===== UPDATE NAVBAR IF LOGGED IN =====
document.addEventListener('DOMContentLoaded', function () {
  var user = getUser();
  var navMenu = document.getElementById('navMenu');
  if (!navMenu || !user) return;

  var loginBtn = navMenu.querySelector('.btn-nav-login');
  var signupBtn = navMenu.querySelector('.btn-nav-signup');

  if (loginBtn) {
    loginBtn.innerHTML = '<i class="fas fa-user-circle"></i> ' + user.name.split(' ')[0];
    loginBtn.href = 'my-bookings.html';
    loginBtn.style.color = '#6c5ce7';
  }

  if (signupBtn) {
    signupBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    signupBtn.href = '#';
    signupBtn.style.background = 'linear-gradient(135deg, #d63031, #ff7675)';
    signupBtn.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
    });
  }

  // Show admin link if admin
  if (user.role === 'admin') {
    var adminLink = document.createElement('li');
    adminLink.innerHTML = '<a href="admin.html" style="color:#00b894;font-weight:600;"><i class="fas fa-cog"></i> Admin</a>';
    if (loginBtn && loginBtn.parentElement) {
      navMenu.insertBefore(adminLink, loginBtn.parentElement);
    }
  }

  // Show My Bookings link
  var bookingsLink = document.createElement('li');
  bookingsLink.innerHTML = '<a href="my-bookings.html"><i class="fas fa-calendar-alt"></i> My Bookings</a>';
  if (loginBtn && loginBtn.parentElement) {
    navMenu.insertBefore(bookingsLink, loginBtn.parentElement);
  }
});

// ===== SCROLL ANIMATION (Performance Optimized) =====
document.addEventListener('DOMContentLoaded', function () {
  var elements = document.querySelectorAll('.glass, .glass-strong, .animate-on-scroll');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          // Stop observing once animated (better performance)
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(25px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  } else {
    // Fallback for old browsers
    elements.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
});

// ===== LAZY LOAD IMAGES (Performance) =====
document.addEventListener('DOMContentLoaded', function () {
  var lazyImages = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    var imageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(function (img) {
      imageObserver.observe(img);
    });
  } else {
    // Fallback
    lazyImages.forEach(function (img) {
      img.src = img.getAttribute('data-src');
    });
  }
});

// ===== DETECT DEVICE TYPE =====
function isMobile() {
  return window.innerWidth <= 768;
}

function isTablet() {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isDesktop() {
  return window.innerWidth > 1024;
}

// ===== SMOOTH SCROLL TO ELEMENT =====
function scrollToElement(elementId) {
  var el = document.getElementById(elementId);
  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// ===== FORM VALIDATION HELPERS =====
function isValidEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone) {
  var re = /^[6-9]\d{9}$/;
  return re.test(phone);
}

function showFieldError(inputId, message) {
  var input = document.getElementById(inputId);
  if (!input) return;

  // Remove old error
  var oldError = input.parentElement.querySelector('.field-error');
  if (oldError) oldError.remove();

  // Add new error
  input.style.borderColor = '#d63031';
  var errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.style.cssText = 'color:#d63031;font-size:0.78rem;margin-top:5px;display:flex;align-items:center;gap:4px;';
  errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
  input.parentElement.appendChild(errorDiv);
}

function clearFieldError(inputId) {
  var input = document.getElementById(inputId);
  if (!input) return;

  input.style.borderColor = '#e0e6f0';
  var oldError = input.parentElement.querySelector('.field-error');
  if (oldError) oldError.remove();
}

// ===== LOADING STATE FOR BUTTONS =====
function setButtonLoading(btn, loading) {
  if (!btn) return;

  if (loading) {
    btn.setAttribute('data-original-text', btn.innerHTML);
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  } else {
    btn.innerHTML = btn.getAttribute('data-original-text') || btn.innerHTML;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// ===== DATE HELPERS =====
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  var d = new Date(dateStr);
  var options = { day: '2-digit', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('en-IN', options);
}

// ===== PRINT RESPONSIVE INFO (Debug) =====
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.addEventListener('resize', debounce(function () {
    console.log('📱 Window: ' + window.innerWidth + 'x' + window.innerHeight +
      ' | ' + (isMobile() ? 'Mobile' : (isTablet() ? 'Tablet' : 'Desktop')));
  }, 500));
}

// ===== SAMPLE ITEMS DATA (Shared) =====
var sampleItems = [
  {
    _id: '1',
    name: 'Golden Mandap Set',
    category: 'Mandap',
    price: 5000,
    stock: 8,
    emoji: '🏛️',
    rating: 4.8,
    description: 'Beautiful golden mandap set for wedding ceremonies. Includes pillars, top cover, and decorative elements.',
    image: ''
  },
  {
    _id: '2',
    name: 'LED Light String',
    category: 'Lighting',
    price: 800,
    stock: 25,
    emoji: '💡',
    rating: 4.5,
    description: 'Colorful LED string lights with multiple color modes. Perfect for any decoration.',
    image: ''
  },
  {
    _id: '3',
    name: 'Flower Garland Pack',
    category: 'Flowers',
    price: 1200,
    stock: 15,
    emoji: '🌸',
    rating: 4.9,
    description: 'Fresh and beautiful flower garlands for all types of occasions and celebrations.',
    image: ''
  },
  {
    _id: '4',
    name: 'Red Carpet Roll',
    category: 'Setup',
    price: 2500,
    stock: 5,
    emoji: '🔴',
    rating: 4.7,
    description: 'Premium quality red carpet roll for grand events, weddings and corporate functions.',
    image: ''
  },
  {
    _id: '5',
    name: 'Crystal Chandelier',
    category: 'Lighting',
    price: 8000,
    stock: 3,
    emoji: '✨',
    rating: 5.0,
    description: 'Elegant crystal chandelier for wedding halls, banquet rooms and luxury venues.',
    image: ''
  },
  {
    _id: '6',
    name: 'Balloon Arch Kit',
    category: 'Party',
    price: 1500,
    stock: 20,
    emoji: '🎈',
    rating: 4.3,
    description: 'Complete balloon arch kit with all colors and accessories for parties.',
    image: ''
  },
  {
    _id: '7',
    name: 'Wedding Stage Frame',
    category: 'Mandap',
    price: 12000,
    stock: 2,
    emoji: '🎭',
    rating: 4.9,
    description: 'Grand wedding stage frame with integrated LED lights and floral attachment points.',
    image: ''
  },
  {
    _id: '8',
    name: 'Table Centerpiece',
    category: 'Setup',
    price: 3000,
    stock: 12,
    emoji: '🏺',
    rating: 4.6,
    description: 'Elegant table centerpiece set perfect for reception dinners and formal events.',
    image: ''
  },
  {
    _id: '9',
    name: 'Confetti Cannon',
    category: 'Party',
    price: 600,
    stock: 0,
    emoji: '🎉',
    rating: 4.2,
    description: 'Party confetti cannon with colorful metallic confetti for celebrations.',
    image: ''
  },
  {
    _id: '10',
    name: 'Silk Draping Cloth',
    category: 'Setup',
    price: 4500,
    stock: 7,
    emoji: '🎀',
    rating: 4.8,
    description: 'Premium silk draping cloth available in multiple colors for stage decoration.',
    image: ''
  },
  {
    _id: '11',
    name: 'DJ Light Set',
    category: 'Lighting',
    price: 6000,
    stock: 4,
    emoji: '🔦',
    rating: 4.4,
    description: 'Professional DJ light set with moving heads, strobes and laser effects.',
    image: ''
  },
  {
    _id: '12',
    name: 'Gift Box Set',
    category: 'Party',
    price: 900,
    stock: 30,
    emoji: '🎁',
    rating: 4.1,
    description: 'Beautiful gift box set in various sizes for all occasions and celebrations.',
    image: ''
  }
];