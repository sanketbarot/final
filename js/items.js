/* ======================================== */
/* items.js - Items Page JavaScript Only    */
/* ======================================== */

var currentCategory = 'All';
var searchQuery = '';
var itemsList = [];

// Load Items
function loadItems() {
  // Try API first
  fetch(API_URL + '/items')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.length > 0) {
        itemsList = data;
      } else {
        itemsList = sampleItems;
      }
      renderItems();
    })
    .catch(function () {
      itemsList = sampleItems;
      renderItems();
    });
}

// Render Items
function renderItems() {
  var grid = document.getElementById('itemsGrid');
  var noItems = document.getElementById('noItems');
  var html = '';

  var filtered = [];
  for (var i = 0; i < itemsList.length; i++) {
    var item = itemsList[i];
    var matchCat = currentCategory === 'All' || item.category === currentCategory;
    var matchSearch = item.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
    if (matchCat && matchSearch) {
      filtered.push(item);
    }
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noItems.style.display = 'block';
    return;
  }

  noItems.style.display = 'none';

  for (var j = 0; j < filtered.length; j++) {
    var item = filtered[j];
    var stockBadge = getStockBadge(item.stock);
    var bookButton = '';

    if (item.stock > 0) {
      bookButton = '<a href="booking.html?id=' + item._id + '" class="book-btn"><i class="fas fa-shopping-cart"></i> Book</a>';
    } else {
      bookButton = '<button class="book-btn disabled" disabled>Unavailable</button>';
    }

    html += '<div class="item-card glass">' +
      '<div class="item-img">' + (item.emoji || '🎁') + '<div class="stock-tag">' + stockBadge + '</div></div>' +
      '<div class="item-body">' +
      '<div class="item-cat">' + item.category + '</div>' +
      '<h3>' + item.name + '</h3>' +
      '<div class="item-rating">⭐ <span>' + (item.rating || 4.5) + '</span></div>' +
      '<div class="item-bottom">' +
      '<div class="item-price gold-text">' + formatPrice(item.price) + '</div>' +
      bookButton +
      '</div></div></div>';
  }

  grid.innerHTML = html;
}

// Filter Click
document.addEventListener('DOMContentLoaded', function () {
  var filterBtns = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener('click', function () {
      for (var j = 0; j < filterBtns.length; j++) {
        filterBtns[j].classList.remove('active');
      }
      this.classList.add('active');
      currentCategory = this.getAttribute('data-category');
      renderItems();
    });
  }

  // Search
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = this.value;
      renderItems();
    });
  }

  // Load
  loadItems();
});