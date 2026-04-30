/* ======================================== */
/* admin.js - Admin Panel JavaScript        */
/* ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  // Check admin
  if (!isLoggedIn() || !isAdmin()) {
    showToast('Admin access only!', 'error');
    setTimeout(function () { window.location.href = 'index.html'; }, 1500);
    return;
  }

  loadAdminData();
  setupTabs();
});

// Tabs
function setupTabs() {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');

  for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener('click', function () {
      var target = this.getAttribute('data-tab');

      for (var j = 0; j < tabBtns.length; j++) { tabBtns[j].classList.remove('active'); }
      for (var k = 0; k < tabContents.length; k++) { tabContents[k].classList.remove('active'); }

      this.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  }
}

// Load Admin Data
function loadAdminData() {
  loadAdminItems();
  loadAdminBookings();

  // Add Item Form
  var addForm = document.getElementById('addItemForm');
  if (addForm) {
    addForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var itemData = {
        name: document.getElementById('aName').value,
        category: document.getElementById('aCategory').value,
        price: Number(document.getElementById('aPrice').value),
        stock: Number(document.getElementById('aStock').value),
        emoji: document.getElementById('aEmoji').value || '🎁',
        description: document.getElementById('aDesc').value
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
      .then(function (data) {
        showToast('Item Added! ✨', 'success');
        addForm.reset();
        loadAdminItems();
      })
      .catch(function () {
        showToast('Item Added (Demo)! ✨', 'success');
        addForm.reset();
      });
    });
  }
}

function loadAdminItems() {
  fetch(API_URL + '/items')
    .then(function (res) { return res.json(); })
    .then(function (data) { renderAdminItems(data && data.length > 0 ? data : sampleItems); })
    .catch(function () { renderAdminItems(sampleItems); });
}

function renderAdminItems(items) {
  var tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;
  var html = '';

  document.getElementById('totalItems').textContent = items.length;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var stockBadge = item.stock === 0 ? '<span class="badge badge-danger">Out</span>' :
      (item.stock <= 5 ? '<span class="badge badge-warning">' + item.stock + '</span>' :
      '<span class="badge badge-success">' + item.stock + '</span>');

    html += '<tr>' +
      '<td>' + (item.emoji || '🎁') + '</td>' +
      '<td>' + item.name + '</td>' +
      '<td><span class="badge badge-gold">' + item.category + '</span></td>' +
      '<td>' + formatPrice(item.price) + '</td>' +
      '<td>' + stockBadge + '</td>' +
      '<td><div class="action-btns">' +
      '<button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>' +
      '<button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>' +
      '</div></td></tr>';
  }

  tbody.innerHTML = html;
}

function loadAdminBookings() {
  fetch(API_URL + '/bookings', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  })
  .then(function (res) { return res.json(); })
  .then(function (data) { renderAdminBookings(data); })
  .catch(function () {
    renderAdminBookings([
      { name: 'Priya Sharma', itemName: 'Golden Mandap', quantity: 2, totalPrice: 10000, status: 'pending' },
      { name: 'Rajesh Patel', itemName: 'LED Lights', quantity: 5, totalPrice: 4000, status: 'confirmed' }
    ]);
  });
}

function renderAdminBookings(bookings) {
  var tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;
  var html = '';

  document.getElementById('totalBookings').textContent = bookings.length;

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var cName = b.userId ? b.userId.name : (b.name || 'Customer');
    var iName = b.itemId ? b.itemId.name : (b.itemName || 'Item');
    var statusClass = b.status === 'confirmed' ? 'badge-success' : (b.status === 'cancelled' ? 'badge-danger' : 'badge-warning');

    html += '<tr>' +
      '<td>' + cName + '</td>' +
      '<td>' + iName + '</td>' +
      '<td>' + (b.quantity || 1) + '</td>' +
      '<td>' + formatPrice(b.totalPrice || 0) + '</td>' +
      '<td><span class="badge ' + statusClass + '">' + (b.status || 'pending') + '</span></td>' +
      '<td><div class="action-btns">' +
      '<button class="action-btn edit" title="Approve"><i class="fas fa-check"></i></button>' +
      '<button class="action-btn delete" title="Cancel"><i class="fas fa-times"></i></button>' +
      '</div></td></tr>';
  }

  tbody.innerHTML = html;
}