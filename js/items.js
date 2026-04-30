/* ======================================== */
/* items.js - Items Page JavaScript         */
/* Light Theme + Performance Optimized      */
/* ======================================== */

// ===== STATE =====
var currentCategory = 'All';
var searchQuery = '';
var itemsList = [];
var isLoading = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  // Check URL for category param (from home page click)
  var params = new URLSearchParams(window.location.search);
  var urlCategory = params.get('category');
  if (urlCategory) {
    currentCategory = urlCategory;
    // Set active filter button
    setActiveFilter(urlCategory);
  }

  // Setup events
  setupSearch();
  setupFilters();

  // Load items
  loadItems();
});

// ===== LOAD ITEMS FROM API =====
function loadItems() {
  if (isLoading) return;
  isLoading = true;

  // Show skeleton loader
  showSkeletonLoader();

  fetch(API_URL + '/items')
    .then(function (res) {
      if (!res.ok) throw new Error('API Error');
      return res.json();
    })
    .then(function (data) {
      if (data && Array.isArray(data) && data.length > 0) {
        itemsList = data;
      } else {
        itemsList = sampleItems;
      }
      isLoading = false;
      renderItems();
    })
    .catch(function () {
      // Use sample data if API fails
      itemsList = sampleItems;
      isLoading = false;
      renderItems();
    });
}

// ===== SHOW SKELETON LOADER =====
function showSkeletonLoader() {
  var grid = document.getElementById('itemsGrid');
  if (!grid) return;

  var skeletonHTML = '';
  for (var i = 0; i < 8; i++) {
    skeletonHTML +=
      '<div class="skeleton-card">' +
        '<div class="skeleton-img"></div>' +
        '<div class="skeleton-body">' +
          '<div class="skeleton-line short"></div>' +
          '<div class="skeleton-line medium"></div>' +
          '<div class="skeleton-line long"></div>' +
          '<div class="skeleton-line short"></div>' +
        '</div>' +
      '</div>';
  }
  grid.innerHTML = skeletonHTML;
}

// ===== RENDER ITEMS =====
function renderItems() {
  var grid = document.getElementById('itemsGrid');
  var noItems = document.getElementById('noItems');
  var countEl = document.getElementById('itemsCount');

  if (!grid) return;

  // Filter items
  var filtered = filterItemsList();

  // Update count
  if (countEl) {
    countEl.textContent = filtered.length + ' item' + (filtered.length !== 1 ? 's' : '') + ' found';
  }

  // Show no items
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (noItems) noItems.style.display = 'block';
    return;
  }

  if (noItems) noItems.style.display = 'none';

  // Build HTML
  var html = '';
  for (var j = 0; j < filtered.length; j++) {
    html += buildItemCard(filtered[j]);
  }

  grid.innerHTML = html;
}

// ===== FILTER ITEMS LIST =====
function filterItemsList() {
  var filtered = [];

  for (var i = 0; i < itemsList.length; i++) {
    var item = itemsList[i];

    var matchCat = currentCategory === 'All' || item.category === currentCategory;
    var matchSearch = !searchQuery ||
      item.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
      item.category.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;

    if (matchCat && matchSearch) {
      filtered.push(item);
    }
  }

  return filtered;
}

// ===== BUILD ITEM CARD HTML =====
function buildItemCard(item) {
  var id = item._id || item.id;
  var stockBadge = getStockBadge(item.stock);
  var ratingStars = buildStars(item.rating || 4.5);
  var bookButton = '';

  if (item.stock > 0) {
    bookButton =
      '<a href="booking.html?id=' + id + '" class="book-btn">' +
        '<i class="fas fa-shopping-cart"></i> Book' +
      '</a>';
  } else {
    bookButton =
      '<button class="book-btn disabled" disabled>' +
        '<i class="fas fa-times"></i> Sold Out' +
      '</button>';
  }

  return (
    '<div class="item-card" data-id="' + id + '">' +
      '<div class="item-img">' +
        '<span class="item-emoji">' + (item.emoji || '🎁') + '</span>' +
        '<div class="stock-tag">' + stockBadge + '</div>' +
      '</div>' +
      '<div class="item-body">' +
        '<div class="item-cat">' + item.category + '</div>' +
        '<h3 title="' + item.name + '">' + item.name + '</h3>' +
        '<div class="item-rating">' +
          '<span class="rating-stars">' + ratingStars + '</span>' +
          '<span class="rating-num">' + (item.rating || 4.5) + '</span>' +
        '</div>' +
        '<div class="item-bottom">' +
          '<div class="item-price">' + formatPrice(item.price) + '</div>' +
          bookButton +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

// ===== BUILD STAR RATING =====
function buildStars(rating) {
  var html = '';
  var full = Math.floor(rating);
  var half = (rating % 1) >= 0.5 ? 1 : 0;
  var empty = 5 - full - half;

  for (var i = 0; i < full; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  if (half) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  for (var j = 0; j < empty; j++) {
    html += '<i class="far fa-star"></i>';
  }
  return html;
}

// ===== SETUP SEARCH =====
function setupSearch() {
  var searchInput = document.getElementById('searchInput');
  var clearBtn = document.getElementById('searchClear');

  if (!searchInput) return;

  // Debounced search
  var debouncedSearch = debounce(function () {
    searchQuery = searchInput.value.trim();

    // Show/hide clear button
    if (clearBtn) {
      if (searchQuery.length > 0) {
        clearBtn.classList.add('show');
      } else {
        clearBtn.classList.remove('show');
      }
    }

    renderItems();
  }, 300);

  searchInput.addEventListener('input', debouncedSearch);

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.remove('show');
      searchInput.focus();
      renderItems();
    });
  }

  // Search on Enter
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchQuery = this.value.trim();
      renderItems();
    }
  });
}

// ===== SETUP FILTERS =====
function setupFilters() {
  var filterBtns = document.querySelectorAll('.filter-btn');

  for (var i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener('click', function () {
      // Remove active from all
      for (var j = 0; j < filterBtns.length; j++) {
        filterBtns[j].classList.remove('active');
      }

      // Add active to clicked
      this.classList.add('active');
      currentCategory = this.getAttribute('data-category');

      // Re-render
      renderItems();
    });
  }
}

// ===== SET ACTIVE FILTER =====
function setActiveFilter(category) {
  var filterBtns = document.querySelectorAll('.filter-btn');

  for (var i = 0; i < filterBtns.length; i++) {
    var btn = filterBtns[i];
    btn.classList.remove('active');

    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    }
  }
}