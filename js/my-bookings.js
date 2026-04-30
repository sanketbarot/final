/* ======================================== */
/* my-bookings.js - My Bookings JavaScript  */
/* ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  if (!isLoggedIn()) {
    showToast('Please login first!', 'error');
    setTimeout(function () { window.location.href = 'login.html'; }, 1500);
    return;
  }

  loadMyBookings();
});

function loadMyBookings() {
  var container = document.getElementById('bookingsList');

  fetch(API_URL + '/bookings/my', {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    if (data && data.length > 0) {
      renderBookings(data);
    } else {
      showNoBookings();
    }
  })
  .catch(function () {
    // Demo data
    var demoBookings = [
      { itemName: 'Golden Mandap Set', emoji: '🏛️', quantity: 2, eventDate: '2024-03-15', totalPrice: 10000, status: 'confirmed' },
      { itemName: 'LED Light String', emoji: '💡', quantity: 5, eventDate: '2024-03-20', totalPrice: 4000, status: 'pending' }
    ];
    renderBookings(demoBookings);
  });
}

function renderBookings(bookings) {
  var container = document.getElementById('bookingsList');
  var html = '';

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var itemName = b.itemId ? b.itemId.name : (b.itemName || 'Item');
    var emoji = b.itemId ? b.itemId.emoji : (b.emoji || '🎁');
    var statusClass = b.status === 'confirmed' ? 'badge-success' : (b.status === 'cancelled' ? 'badge-danger' : 'badge-warning');

    html += '<div class="booking-card glass">' +
      '<div class="booking-emoji">' + emoji + '</div>' +
      '<div class="booking-info">' +
      '<h3>' + itemName + '</h3>' +
      '<div class="booking-meta">' +
      '<span><i class="fas fa-box"></i> Qty: ' + b.quantity + '</span>' +
      '<span><i class="fas fa-calendar"></i> ' + (b.eventDate ? new Date(b.eventDate).toLocaleDateString() : 'N/A') + '</span>' +
      '</div>' +
      '</div>' +
      '<div class="booking-price gold-text">' + formatPrice(b.totalPrice) + '</div>' +
      '<div class="booking-status"><span class="badge ' + statusClass + '">' + (b.status || 'pending') + '</span></div>' +
      '</div>';
  }

  container.innerHTML = html;
}

function showNoBookings() {
  var container = document.getElementById('bookingsList');
  container.innerHTML = '<div class="no-bookings glass-strong">' +
    '<i class="fas fa-box-open"></i>' +
    '<h3>No Bookings Yet</h3>' +
    '<p>You haven\'t booked any decoration items yet.</p>' +
    '<a href="items.html" class="btn btn-primary"><i class="fas fa-shopping-cart"></i> Browse Items</a>' +
    '</div>';
}