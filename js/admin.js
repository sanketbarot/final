/* ======================================== */
/* admin.js - Admin Panel JavaScript        */
/* Light Theme + Performance Optimized      */
/* ======================================== */

// ===== STATE =====
var adminItems = [];
var adminBookings = [];
var editingItemId = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {

  // Check admin access
  if (!isLoggedIn() || !isAdmin()) {
    showToast('Admin access only!', 'error');
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 1500);
    return;
  }

  // Setup all components
  setupTabs();
  setupAddItemForm();
  setupPreviewUpdates();
  setupTableSearch();

  // Load data
  loadAllAdminData();
});

// ===== LOAD ALL DATA =====
function loadAllAdminData() {
  showTableSkeleton('itemsTableBody', 5);
  showTableSkeleton('bookingsTableBody', 4);

  loadAdminItems();
  loadAdminBookings();
  updateDashboardStats();
}

// ===== SETUP TABS =====
function setupTabs() {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = this.getAttribute('data-tab');

      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabContents.forEach(function (c) { c.classList.remove('active'); });

      this.classList.add('active');
      var targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.add('active');
    });
  });
}

// ===== LOAD ADMIN ITEMS =====
function loadAdminItems() {
  fetch(API_URL + '/items')
    .then(function (res) {
      if (!res.ok) throw new Error('Error');
      return res.json();
    })
    .then(function (data) {
      adminItems = (data && data.length > 0) ? data : sampleItems;
      renderAdminItems(adminItems);
      updateDashboardStats();
    })
    .catch(function () {
      adminItems = sampleItems;
      renderAdminItems(adminItems);
      updateDashboardStats();
    });
}

// ===== RENDER ADMIN ITEMS =====
function renderAdminItems(items) {
  var tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = getEmptyTableHTML('No items found. Add your first item!');
    return;
  }

  var html = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var id = item._id || item.id || i;

    var stockBadge = '';
    if (item.stock === 0) {
      stockBadge = '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Out</span>';
    } else if (item.stock <= 5) {
      stockBadge = '<span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> ' + item.stock + '</span>';
    } else {
      stockBadge = '<span class="badge badge-success"><i class="fas fa-check-circle"></i> ' + item.stock + '</span>';
    }

    html += '<tr>' +
      '<td style="font-size:1.3rem;">' + (item.emoji || '🎁') + '</td>' +
      '<td><strong>' + item.name + '</strong></td>' +
      '<td><span class="badge badge-primary">' + item.category + '</span></td>' +
      '<td><strong style="color:var(--primary)">' + formatPrice(item.price) + '</strong></td>' +
      '<td>' + stockBadge + '</td>' +
      '<td>' +
        '<div class="action-btns">' +
          '<button class="action-btn edit" onclick="editItem(\'' + id + '\')" title="Edit Item">' +
            '<i class="fas fa-edit"></i>' +
          '</button>' +
          '<button class="action-btn delete" onclick="deleteItem(\'' + id + '\')" title="Delete Item">' +
            '<i class="fas fa-trash"></i>' +
          '</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }

  tbody.innerHTML = html;
}

// ===== LOAD ADMIN BOOKINGS =====
function loadAdminBookings() {
  var demoBookings = [
    { _id: 'b1', name: 'Priya Sharma', phone: '9876543210', itemName: 'Golden Mandap', emoji: '🏛️', quantity: 2, totalPrice: 10000, eventDate: '2024-05-15', status: 'pending' },
    { _id: 'b2', name: 'Rajesh Patel', phone: '9876543211', itemName: 'LED Light String', emoji: '💡', quantity: 5, totalPrice: 4000, eventDate: '2024-05-20', status: 'confirmed' },
    { _id: 'b3', name: 'Anita Desai', phone: '9876543212', itemName: 'Balloon Arch', emoji: '🎈', quantity: 1, totalPrice: 1500, eventDate: '2024-05-25', status: 'pending' },
    { _id: 'b4', name: 'Vikram Shah', phone: '9876543213', itemName: 'Flower Garland', emoji: '🌸', quantity: 3, totalPrice: 3600, eventDate: '2024-04-10', status: 'completed' }
  ];

  fetch(API_URL + '/bookings', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  })
  .then(function (res) {
    if (!res.ok) throw new Error('Error');
    return res.json();
  })
  .then(function (data) {
    adminBookings = (data && data.length > 0) ? data : demoBookings;
    renderAdminBookings(adminBookings);
    updateDashboardStats();
  })
  .catch(function () {
    adminBookings = demoBookings;
    renderAdminBookings(adminBookings);
    updateDashboardStats();
  });
}

// ===== RENDER ADMIN BOOKINGS =====
function renderAdminBookings(bookings) {
  var tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = getEmptyTableHTML('No bookings found yet.');
    return;
  }

  var html = '';
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var id = b._id || i;
    var cName = b.userId ? b.userId.name : (b.name || 'Customer');
    var cPhone = b.userId ? b.userId.phone : (b.phone || 'N/A');
    var iName = b.itemId ? b.itemId.name : (b.itemName || 'Item');
    var iEmoji = b.itemId ? (b.itemId.emoji || '🎁') : (b.emoji || '🎁');

    var statusClass = '';
    if (b.status === 'confirmed') statusClass = 'badge-success';
    else if (b.status === 'cancelled') statusClass = 'badge-danger';
    else if (b.status === 'completed') statusClass = 'badge-primary';
    else statusClass = 'badge-warning';

    var eventDate = b.eventDate
      ? new Date(b.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    html += '<tr>' +
      '<td>' +
        '<strong>' + cName + '</strong>' +
        '<br><span style="font-size:0.75rem;color:var(--text-light);">' + cPhone + '</span>' +
      '</td>' +
      '<td>' + iEmoji + ' ' + iName + '</td>' +
      '<td style="text-align:center;">' + (b.quantity || 1) + '</td>' +
      '<td><strong style="color:var(--primary)">' + formatPrice(b.totalPrice || 0) + '</strong></td>' +
      '<td>' + eventDate + '</td>' +
      '<td><span class="badge ' + statusClass + '">' + capitalizeFirst(b.status || 'pending') + '</span></td>' +
      '<td>' +
        '<div class="action-btns">' +
          (b.status === 'pending' ? (
            '<button class="action-btn approve" onclick="updateBookingStatus(\'' + id + '\', \'confirmed\')" title="Confirm Booking">' +
              '<i class="fas fa-check"></i>' +
            '</button>'
          ) : '') +
          '<button class="action-btn delete" onclick="updateBookingStatus(\'' + id + '\', \'cancelled\')" title="Cancel Booking">' +
            '<i class="fas fa-times"></i>' +
          '</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }

  tbody.innerHTML = html;
}

// ===== UPDATE DASHBOARD STATS =====
function updateDashboardStats() {
  var totalItems = adminItems.length;
  var totalBookings = adminBookings.length;
  var pendingBookings = adminBookings.filter(function (b) { return b.status === 'pending'; }).length;
  var totalRevenue = adminBookings.reduce(function (sum, b) {
    return b.status !== 'cancelled' ? sum + (b.totalPrice || 0) : sum;
  }, 0);

  setStatValue('totalItems', totalItems);
  setStatValue('totalBookings', totalBookings);
  setStatValue('pendingBookings', pendingBookings);
  setStatValue('totalRevenue', formatPrice(totalRevenue));
}

function setStatValue(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ===== SETUP ADD ITEM FORM =====
function setupAddItemForm() {
  var addForm = document.getElementById('addItemForm');
  if (!addForm) return;

  addForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var submitBtn = addForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    var itemData = {
      name: document.getElementById('aName').value.trim(),
      category: document.getElementById('aCategory').value,
      price: Number(document.getElementById('aPrice').value),
      stock: Number(document.getElementById('aStock').value),
      emoji: document.getElementById('aEmoji').value.trim() || '🎁',
      description: document.getElementById('aDesc').value.trim()
    };

    fetch(API_URL + '/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify(itemData)
    })
    .then(function (res) { return res.json(); })
    .then(function () {
      setButtonLoading(submitBtn, false);
      showToast('Item added successfully! ✨', 'success');
      addForm.reset();
      resetPreview();
      loadAdminItems();

      // Switch to items tab
      var itemsTab = document.querySelector('[data-tab="tabItems"]');
      if (itemsTab) itemsTab.click();
    })
    .catch(function () {
      setButtonLoading(submitBtn, false);

      // Demo mode
      var newItem = Object.assign({}, itemData, { _id: 'new_' + Date.now() });
      adminItems.push(newItem);
      renderAdminItems(adminItems);
      updateDashboardStats();

      showToast('Item added! (Demo mode) ✨', 'success');
      addForm.reset();
      resetPreview();

      var itemsTab = document.querySelector('[data-tab="tabItems"]');
      if (itemsTab) itemsTab.click();
    });
  });
}

// ===== SETUP PREVIEW UPDATES =====
function setupPreviewUpdates() {
  var fields = ['aName', 'aPrice', 'aEmoji', 'aCategory', 'aStock'];

  fields.forEach(function (fieldId) {
    var el = document.getElementById(fieldId);
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });
}

function updatePreview() {
  var name = getFieldValue('aName') || 'Item Name';
  var price = getFieldValue('aPrice') || '0';
  var emoji = getFieldValue('aEmoji') || '🎁';
  var category = getFieldValue('aCategory') || 'Category';
  var stock = getFieldValue('aStock') || '0';

  var previewEmoji = document.getElementById('previewEmoji');
  var previewName = document.getElementById('previewName');
  var previewPrice = document.getElementById('previewPrice');
  var previewCat = document.getElementById('previewCat');
  var previewStock = document.getElementById('previewStock');

  if (previewEmoji) previewEmoji.textContent = emoji;
  if (previewName) previewName.textContent = name;
  if (previewPrice) previewPrice.textContent = formatPrice(Number(price));
  if (previewCat && category) {
    previewCat.textContent = category;
  }
  if (previewStock) {
    previewStock.innerHTML = getStockBadge(Number(stock));
  }
}

function getFieldValue(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

function resetPreview() {
  var previewEmoji = document.getElementById('previewEmoji');
  var previewName = document.getElementById('previewName');
  var previewPrice = document.getElementById('previewPrice');
  var previewCat = document.getElementById('previewCat');

  if (previewEmoji) previewEmoji.textContent = '🎁';
  if (previewName) previewName.textContent = 'Item Name';
  if (previewPrice) previewPrice.textContent = '₹0';
  if (previewCat) previewCat.textContent = 'Category';
}

// ===== EDIT ITEM =====
function editItem(itemId) {
  var item = null;
  for (var i = 0; i < adminItems.length; i++) {
    if ((adminItems[i]._id || adminItems[i].id) == itemId) {
      item = adminItems[i];
      break;
    }
  }
  if (!item) return;

  editingItemId = itemId;

  // Switch to add tab and fill values
  var addTab = document.querySelector('[data-tab="tabAddItem"]');
  if (addTab) addTab.click();

  setTimeout(function () {
    setFieldValue('aName', item.name);
    setFieldValue('aCategory', item.category);
    setFieldValue('aPrice', item.price);
    setFieldValue('aStock', item.stock);
    setFieldValue('aEmoji', item.emoji || '🎁');
    setFieldValue('aDesc', item.description || '');
    updatePreview();

    // Change form title and button
    var formTitle = document.querySelector('.add-item-form h3');
    var submitBtn = document.querySelector('#addItemForm button[type="submit"]');
    if (formTitle) formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Item';
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';

    showToast('Edit mode: Make your changes and save', 'success');
  }, 300);
}

function setFieldValue(id, value) {
  var el = document.getElementById(id);
  if (el) el.value = value;
}

// ===== DELETE ITEM =====
function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  fetch(API_URL + '/items/' + itemId, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  })
  .then(function () {
    adminItems = adminItems.filter(function (item) {
      return (item._id || item.id) != itemId;
    });
    renderAdminItems(adminItems);
    updateDashboardStats();
    showToast('Item deleted!', 'success');
  })
  .catch(function () {
    adminItems = adminItems.filter(function (item) {
      return (item._id || item.id) != itemId;
    });
    renderAdminItems(adminItems);
    updateDashboardStats();
    showToast('Item deleted! (Demo)', 'success');
  });
}

// ===== UPDATE BOOKING STATUS =====
function updateBookingStatus(bookingId, newStatus) {
  var confirmMsg = newStatus === 'confirmed'
    ? 'Confirm this booking?'
    : 'Cancel this booking?';

  if (!confirm(confirmMsg)) return;

  fetch(API_URL + '/bookings/' + bookingId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    },
    body: JSON.stringify({ status: newStatus })
  })
  .then(function () {
    updateLocalBookingStatus(bookingId, newStatus);
  })
  .catch(function () {
    updateLocalBookingStatus(bookingId, newStatus);
  });
}

function updateLocalBookingStatus(bookingId, newStatus) {
  for (var i = 0; i < adminBookings.length; i++) {
    if (adminBookings[i]._id == bookingId) {
      adminBookings[i].status = newStatus;
      break;
    }
  }
  renderAdminBookings(adminBookings);
  updateDashboardStats();

  var msg = newStatus === 'confirmed'
    ? 'Booking confirmed! ✅'
    : 'Booking cancelled!';
  showToast(msg, 'success');
}

// ===== SETUP TABLE SEARCH =====
function setupTableSearch() {
  var itemSearch = document.getElementById('itemTableSearch');
  var bookingSearch = document.getElementById('bookingTableSearch');

  if (itemSearch) {
    itemSearch.addEventListener('input', debounce(function () {
      var query = this.value.toLowerCase();
      var filtered = adminItems.filter(function (item) {
        return item.name.toLowerCase().indexOf(query) !== -1 ||
          item.category.toLowerCase().indexOf(query) !== -1;
      });
      renderAdminItems(filtered);
    }, 300));
  }

  if (bookingSearch) {
    bookingSearch.addEventListener('input', debounce(function () {
      var query = this.value.toLowerCase();
      var filtered = adminBookings.filter(function (b) {
        var name = b.userId ? b.userId.name : (b.name || '');
        var item = b.itemId ? b.itemId.name : (b.itemName || '');
        return name.toLowerCase().indexOf(query) !== -1 ||
          item.toLowerCase().indexOf(query) !== -1;
      });
      renderAdminBookings(filtered);
    }, 300));
  }
}

// ===== HELPERS =====
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEmptyTableHTML(message) {
  return '<tr><td colspan="10">' +
    '<div class="table-empty">' +
      '<i class="fas fa-inbox"></i>' +
      '<p>' + message + '</p>' +
    '</div>' +
  '</td></tr>';
}

function showTableSkeleton(tbodyId, rows) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  var html = '';
  for (var i = 0; i < rows; i++) {
    html += '<tr class="skeleton-row">' +
      '<td><div class="skeleton-cell w-30"></div></td>' +
      '<td><div class="skeleton-cell w-70"></div></td>' +
      '<td><div class="skeleton-cell w-50"></div></td>' +
      '<td><div class="skeleton-cell w-30"></div></td>' +
      '<td><div class="skeleton-cell w-50"></div></td>' +
      '<td><div class="skeleton-cell w-30"></div></td>' +
    '</tr>';
  }
  tbody.innerHTML = html;
}