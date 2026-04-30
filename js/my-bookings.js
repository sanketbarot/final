/* ======================================== */
/* my-bookings.js - My Bookings JavaScript  */
/* Light Theme + Performance Optimized      */
/* ======================================== */

// ===== STATE =====
var allBookings = [];
var currentStatus = 'All';

// ===== DEMO BOOKINGS DATA =====
var demoBookings = [
  {
    _id: 'BK001',
    itemName: 'Golden Mandap Set',
    emoji: '🏛️',
    quantity: 2,
    eventDate: '2024-05-15',
    totalPrice: 10000,
    status: 'confirmed',
    address: 'Surat, Gujarat'
  },
  {
    _id: 'BK002',
    itemName: 'LED Light String',
    emoji: '💡',
    quantity: 5,
    eventDate: '2024-05-20',
    totalPrice: 4000,
    status: 'pending',
    address: 'Ahmedabad, Gujarat'
  },
  {
    _id: 'BK003',
    itemName: 'Flower Garland Pack',
    emoji: '🌸',
    quantity: 3,
    eventDate: '2024-04-10',
    totalPrice: 3600,
    status: 'completed',
    address: 'Vadodara, Gujarat'
  },
  {
    _id: 'BK004',
    itemName: 'Crystal Chandelier',
    emoji: '✨',
    quantity: 1,
    eventDate: '2024-03-25',
    totalPrice: 8000,
    status: 'cancelled',
    address: 'Rajkot, Gujarat'
  }
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  // Check login
  if (!isLoggedIn()) {
    showToast('Please login to view bookings!', 'error');
    setTimeout(function () {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  // Show skeleton
  showSkeletonLoader();

  // Setup status tabs
  setupStatusTabs();

  // Load bookings
  loadMyBookings();
});

// ===== LOAD BOOKINGS =====
function loadMyBookings() {
  fetch(API_URL + '/bookings/my', {
    headers: {
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json'
    }
  })
  .then(function (res) {
    if (!res.ok) throw new Error('API Error');
    return res.json();
  })
  .then(function (data) {
    if (data && Array.isArray(data) && data.length > 0) {
      allBookings = data;
    } else {
      allBookings = demoBookings;
    }
    renderAll();
  })
  .catch(function () {
    allBookings = demoBookings;
    renderAll();
  });
}

// ===== RENDER ALL =====
function renderAll() {
  renderSummaryStats();
  updateTabCounts();
  renderBookings();
}

// ===== RENDER SUMMARY STATS =====
function renderSummaryStats() {
  var total = allBookings.length;
  var confirmed = allBookings.filter(function (b) { return b.status === 'confirmed'; }).length;
  var pending = allBookings.filter(function (b) { return b.status === 'pending'; }).length;
  var totalSpent = allBookings.reduce(function (sum, b) {
    return b.status !== 'cancelled' ? sum + (b.totalPrice || 0) : sum;
  }, 0);

  // Update DOM
  var elTotal = document.getElementById('statTotal');
  var elConfirmed = document.getElementById('statConfirmed');
  var elPending = document.getElementById('statPending');
  var elSpent = document.getElementById('statSpent');

  if (elTotal) elTotal.textContent = total;
  if (elConfirmed) elConfirmed.textContent = confirmed;
  if (elPending) elPending.textContent = pending;
  if (elSpent) elSpent.textContent = formatPrice(totalSpent);

  // Update total badge
  var badge = document.getElementById('totalBadge');
  if (badge) {
    badge.textContent = total + ' Total Booking' + (total !== 1 ? 's' : '');
  }
}

// ===== UPDATE TAB COUNTS =====
function updateTabCounts() {
  var statusGroups = {
    'All': allBookings.length,
    'confirmed': allBookings.filter(function (b) { return b.status === 'confirmed'; }).length,
    'pending': allBookings.filter(function (b) { return b.status === 'pending'; }).length,
    'completed': allBookings.filter(function (b) { return b.status === 'completed'; }).length,
    'cancelled': allBookings.filter(function (b) { return b.status === 'cancelled'; }).length
  };

  var tabs = document.querySelectorAll('.status-tab');
  tabs.forEach(function (tab) {
    var status = tab.getAttribute('data-status');
    var countEl = tab.querySelector('.tab-count');
    if (countEl && statusGroups[status] !== undefined) {
      countEl.textContent = statusGroups[status];
    }
  });
}

// ===== RENDER BOOKINGS =====
function renderBookings() {
  var container = document.getElementById('bookingsList');
  if (!container) return;

  // Filter by status
  var filtered = allBookings.filter(function (b) {
    if (currentStatus === 'All') return true;
    return b.status === currentStatus;
  });

  if (filtered.length === 0) {
    showNoBookings(container);
    return;
  }

  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    html += buildBookingCard(filtered[i]);
  }

  container.innerHTML = html;

  // Setup cancel buttons
  setupCancelButtons();
}

// ===== BUILD BOOKING CARD =====
function buildBookingCard(b) {
  var itemName = b.itemId ? b.itemId.name : (b.itemName || 'Item');
  var emoji = b.itemId ? (b.itemId.emoji || '🎁') : (b.emoji || '🎁');
  var status = b.status || 'pending';
  var statusClass = getStatusClass(status);
  var statusCardClass = 'status-' + status;

  var eventDate = b.eventDate
    ? new Date(b.eventDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  var bookingId = b._id
    ? ('#' + String(b._id).slice(-6).toUpperCase())
    : '#000000';

  // Cancel button (only for pending)
  var cancelBtn = '';
  if (status === 'pending') {
    cancelBtn =
      '<button class="cancel-btn" data-id="' + b._id + '">' +
        '<i class="fas fa-times"></i> Cancel' +
      '</button>';
  }

  return (
    '<div class="booking-card ' + statusCardClass + '" data-id="' + b._id + '">' +
      '<div class="booking-emoji">' + emoji + '</div>' +

      '<div class="booking-info">' +
        '<h3>' + itemName + '</h3>' +
        '<div class="booking-meta">' +
          '<div class="booking-meta-item">' +
            '<i class="fas fa-box"></i>' +
            '<span>Qty: ' + (b.quantity || 1) + '</span>' +
          '</div>' +
          '<div class="booking-meta-item">' +
            '<i class="fas fa-calendar-alt"></i>' +
            '<span>' + eventDate + '</span>' +
          '</div>' +
          (b.address ? (
            '<div class="booking-meta-item">' +
              '<i class="fas fa-map-marker-alt"></i>' +
              '<span>' + b.address + '</span>' +
            '</div>'
          ) : '') +
        '</div>' +
        '<div class="booking-id">' + bookingId + '</div>' +
      '</div>' +

      '<div class="booking-price-wrap">' +
        '<div class="booking-price">' + formatPrice(b.totalPrice || 0) + '</div>' +
        '<div class="booking-price-label">Total Amount</div>' +
      '</div>' +

      '<div class="booking-status">' +
        '<span class="badge ' + statusClass + '">' +
          '<i class="fas fa-' + getStatusIcon(status) + '"></i> ' +
          capitalizeFirst(status) +
        '</span>' +
        cancelBtn +
      '</div>' +
    '</div>'
  );
}

// ===== STATUS HELPERS =====
function getStatusClass(status) {
  var map = {
    'confirmed': 'badge-success',
    'pending': 'badge-warning',
    'cancelled': 'badge-danger',
    'completed': 'badge-primary'
  };
  return map[status] || 'badge-warning';
}

function getStatusIcon(status) {
  var map = {
    'confirmed': 'check-circle',
    'pending': 'clock',
    'cancelled': 'times-circle',
    'completed': 'star'
  };
  return map[status] || 'clock';
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== SETUP STATUS TABS =====
function setupStatusTabs() {
  var tabs = document.querySelectorAll('.status-tab');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // Remove active from all
      tabs.forEach(function (t) { t.classList.remove('active'); });

      // Add active to clicked
      this.classList.add('active');
      currentStatus = this.getAttribute('data-status');

      // Re-render
      renderBookings();
    });
  });
}

// ===== SETUP CANCEL BUTTONS =====
function setupCancelButtons() {
  var cancelBtns = document.querySelectorAll('.cancel-btn');

  cancelBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var bookingId = this.getAttribute('data-id');

      if (confirm('Are you sure you want to cancel this booking?')) {
        cancelBooking(bookingId, this);
      }
    });
  });
}

// ===== CANCEL BOOKING =====
function cancelBooking(bookingId, btn) {
  // Show loading
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  btn.disabled = true;

  fetch(API_URL + '/bookings/' + bookingId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    },
    body: JSON.stringify({ status: 'cancelled' })
  })
  .then(function (res) { return res.json(); })
  .then(function () {
    showToast('Booking cancelled successfully!', 'success');
    // Update local data
    for (var i = 0; i < allBookings.length; i++) {
      if (allBookings[i]._id === bookingId) {
        allBookings[i].status = 'cancelled';
        break;
      }
    }
    renderAll();
  })
  .catch(function () {
    // Demo mode
    for (var i = 0; i < allBookings.length; i++) {
      if (allBookings[i]._id === bookingId) {
        allBookings[i].status = 'cancelled';
        break;
      }
    }
    showToast('Booking cancelled!', 'success');
    renderAll();
  });
}

// ===== SHOW NO BOOKINGS =====
function showNoBookings(container) {
  container.innerHTML =
    '<div class="no-bookings glass-strong">' +
      '<div class="no-bookings-icon">' +
        '<i class="fas fa-box-open"></i>' +
      '</div>' +
      '<h3>No ' + (currentStatus !== 'All' ? capitalizeFirst(currentStatus) : '') + ' Bookings</h3>' +
      '<p>' +
        (currentStatus !== 'All'
          ? 'No ' + currentStatus + ' bookings found. Try a different filter.'
          : 'You haven\'t booked any decoration items yet. Start browsing!') +
      '</p>' +
      '<a href="items.html" class="btn btn-primary">' +
        '<i class="fas fa-shopping-cart"></i> Browse Items' +
      '</a>' +
    '</div>';
}

// ===== SHOW SKELETON LOADER =====
function showSkeletonLoader() {
  var container = document.getElementById('bookingsList');
  if (!container) return;

  var html = '';
  for (var i = 0; i < 3; i++) {
    html +=
      '<div class="booking-skeleton">' +
        '<div class="skeleton-emoji-box"></div>' +
        '<div class="skeleton-info">' +
          '<div class="skeleton-line w-60"></div>' +
          '<div class="skeleton-line w-80"></div>' +
          '<div class="skeleton-line w-40"></div>' +
        '</div>' +
      '</div>';
  }

  container.innerHTML = html;
}