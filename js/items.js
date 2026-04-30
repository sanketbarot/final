/* ======================================== */
/* items.js - Items Page JavaScript         */
/* ⚡ PERFORMANCE OPTIMIZED VERSION         */
/* ======================================== */

// ===== STATE =====
var currentCategory = 'All';
var searchQuery = '';
var itemsList = [];
var isLoading = false;
var gridElement = null;
var noItemsElement = null;
var countElement = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {

  // Cache DOM elements (no repeated querySelector)
  gridElement = document.getElementById('itemsGrid');
  noItemsElement = document.getElementById('noItems');
  countElement = document.getElementById('itemsCount');

  // Check URL for category param
  var params = new URLSearchParams(window.location.search);
  var urlCategory = params.get('category');
  if (urlCategory) {
    currentCategory = urlCategory;
    setActiveFilter(urlCategory);
  }

  // Setup events
  setupSearch();
  setupFilters();

  // Load items IMMEDIATELY with sample data first
  itemsList = sampleItems;
  renderItems();

  // Then try API in background (non-blocking)
  loadFromAPI();
});

// ===== LOAD FROM API (Background - Non Blocking) =====
function loadFromAPI() {
  // Use timeout to prevent hanging
  var controller = null;
  var timeoutId = null;

  // AbortController for timeout
  if (window.AbortController) {
    controller = new AbortController();
    timeoutId = setTimeout(function () {
      controller.abort();
    }, 3000); // 3 second timeout
  }

  var fetchOptions = {};
  if (controller) {
    fetchOptions.signal = controller.signal;
  }

  fetch(API_URL + '/items', fetchOptions)
    .then(function (res) {
      if (!res.ok) throw new Error('API Error');
      return res.json();
    })
    .then(function (data) {
      clearTimeout(timeoutId);
      if (data && Array.isArray(data) && data.length > 0) {
        itemsList = data;
        renderItems();
      }
    })
    .catch(function () {
      clearTimeout(timeoutId);
      // Already showing sample data, do nothing
    });
}

// ===== RENDER ITEMS (Optimized) =====
function renderItems() {
  if (!gridElement) return;

  // Filter items
  var filtered = getFilteredItems();

  // Update count
  if (countElement) {
    countElement.textContent = filtered.length + ' item' + (filtered.length !== 1 ? 's' : '');
  }

  // No items
  if (filtered.length === 0) {
    gridElement.innerHTML = '';
    if (noItemsElement) noItemsElement.style.display = 'block';
    return;
  }

  if (noItemsElement) noItemsElement.style.display = 'none';

  // Build HTML using array join (faster than string concat)
  var parts = [];
  var len = filtered.length;

  for (var i = 0; i < len; i++) {
    parts.push(buildCard(filtered[i]));
  }

  // Single DOM update (fastest)
  gridElement.innerHTML = parts.join('');
}

// ===== GET FILTERED ITEMS =====
function getFilteredItems() {
  var filtered = [];
  var len = itemsList.length;
  var query = searchQuery.toLowerCase();
  var cat = currentCategory;

  for (var i = 0; i < len; i++) {
    var item = itemsList[i];

    // Category check
    if (cat !== 'All' && item.category !== cat) continue;

    // Search check
    if (query) {
      var name = item.name.toLowerCase();
      var category = item.category.toLowerCase();
      if (name.indexOf(query) === -1 && category.indexOf(query) === -1) continue;
    }

    filtered.push(item);
  }

  return filtered;
}

// ===== BUILD CARD HTML (Optimized - No unnecessary stuff) =====
function buildCard(item) {
  var id = item._id || item.id;
  var stock = item.stock || 0;
  var emoji = item.emoji || '🎁';
  var rating = item.rating || 4.5;
  var price = item.price || 0;

  // Stock badge - simple inline
  var stockHTML = '';
  if (stock === 0) {
    stockHTML = '<span class="stag sd"><i class="fas fa-times-circle"></i> Out</span>';
  } else if (stock <= 5) {
    stockHTML = '<span class="stag sw"><i class="fas fa-exclamation-triangle"></i> ' + stock + ' left</span>';
  } else {
    stockHTML = '<span class="stag ss"><i class="fas fa-check-circle"></i> ' + stock + '</span>';
  }

  // Book button
  var btnHTML = stock > 0
    ? '<a href="booking.html?id=' + id + '" class="bbtn"><i class="fas fa-shopping-cart"></i> Book</a>'
    : '<button class="bbtn dis" disabled>Sold Out</button>';

  // Price formatted
  var priceStr = '₹' + price.toLocaleString('en-IN');

  // Stars - simple
  var starsHTML = getQuickStars(rating);

  return '<div class="icard">' +
    '<div class="iimg">' +
      '<span class="iemoji">' + emoji + '</span>' +
      '<div class="stag-wrap">' + stockHTML + '</div>' +
    '</div>' +
    '<div class="ibody">' +
      '<span class="icat">' + item.category + '</span>' +
      '<h3 class="iname">' + item.name + '</h3>' +
      '<div class="irate">' + starsHTML + ' <b>' + rating + '</b></div>' +
      '<div class="ibot">' +
        '<span class="iprice">' + priceStr + '</span>' +
        btnHTML +
      '</div>' +
    '</div>' +
  '</div>';
}

// ===== QUICK STAR RATING (No loops) =====
function getQuickStars(r) {
  var s = '';
  var full = Math.floor(r);
  var half = (r % 1) >= 0.5;

  if (full >= 1) s += '★';
  if (full >= 2) s += '★';
  if (full >= 3) s += '★';
  if (full >= 4) s += '★';
  if (full >= 5) s += '★';
  if (half && full < 5) s += '½';

  return '<span class="stars">' + s + '</span>';
}

// ===== SETUP SEARCH (Debounced) =====
function setupSearch() {
  var input = document.getElementById('searchInput');
  var clearBtn = document.getElementById('searchClear');
  if (!input) return;

  var timer = null;

  input.addEventListener('input', function () {
    var val = this.value;

    // Show/hide clear
    if (clearBtn) {
      clearBtn.style.display = val.length > 0 ? 'block' : 'none';
    }

    // Debounce 200ms
    clearTimeout(timer);
    timer = setTimeout(function () {
      searchQuery = val.trim();
      renderItems();
    }, 200);
  });

  // Clear button
  if (clearBtn) {
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', function () {
      input.value = '';
      searchQuery = '';
      this.style.display = 'none';
      input.focus();
      renderItems();
    });
  }

  // Enter key
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(timer);
      searchQuery = this.value.trim();
      renderItems();
    }
  });
}

// ===== SETUP FILTERS =====
function setupFilters() {
  var btns = document.querySelectorAll('.filter-btn');
  var len = btns.length;

  for (var i = 0; i < len; i++) {
    btns[i].addEventListener('click', handleFilterClick);
  }
}

function handleFilterClick() {
  // Remove active from all
  var btns = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }

  this.classList.add('active');
  currentCategory = this.getAttribute('data-category');
  renderItems();
}

// ===== SET ACTIVE FILTER =====
function setActiveFilter(category) {
  var btns = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
    if (btns[i].getAttribute('data-category') === category) {
      btns[i].classList.add('active');
    }
  }
}