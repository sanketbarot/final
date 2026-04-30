/* ======================================== */
/* booking.js - Booking Page JavaScript     */
/* ======================================== */

var currentItem = null;
var qty = 1;
var maxQty = 1;

function getItemId() {
  var params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function loadItem() {
  var id = getItemId();
  if (!id) { window.location.href = 'items.html'; return; }

  fetch(API_URL + '/items/' + id)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data._id) { currentItem = data; }
      else { throw new Error('not found'); }
      setupBookingPage();
    })
    .catch(function () {
      for (var i = 0; i < sampleItems.length; i++) {
        if (sampleItems[i]._id === id) {
          currentItem = sampleItems[i];
          break;
        }
      }
      if (!currentItem) { window.location.href = 'items.html'; return; }
      setupBookingPage();
    });
}

function setupBookingPage() {
  maxQty = currentItem.stock;
  document.getElementById('previewEmoji').textContent = currentItem.emoji || '🎁';
  document.getElementById('previewCat').textContent = currentItem.category;
  document.getElementById('previewName').textContent = currentItem.name;
  document.getElementById('previewDesc').textContent = currentItem.description || 'Premium decoration item.';
  document.getElementById('previewPrice').textContent = Number(currentItem.price).toLocaleString('en-IN');
  document.getElementById('previewStock').textContent = currentItem.stock;
  document.getElementById('sumPrice').textContent = Number(currentItem.price).toLocaleString('en-IN');
  updateSummary();
}

function updateSummary() {
  document.getElementById('qtyVal').textContent = qty;
  document.getElementById('sumQty').textContent = qty;
  var total = (currentItem ? currentItem.price : 0) * qty;
  document.getElementById('sumTotal').textContent = Number(total).toLocaleString('en-IN');
}

function showSuccess(date) {
  document.getElementById('bookingSection').style.display = 'none';
  document.getElementById('successPage').style.display = 'block';
  document.getElementById('successItem').textContent = currentItem.name;
  document.getElementById('successQty').textContent = qty;
  document.getElementById('successDate').textContent = date;
  document.getElementById('successTotal').textContent = formatPrice(currentItem.price * qty);
  showToast('Booking Confirmed! 🎉', 'success');
}

document.addEventListener('DOMContentLoaded', function () {
  loadItem();

  // Quantity buttons
  document.getElementById('qtyMinus').addEventListener('click', function () {
    if (qty > 1) { qty--; updateSummary(); }
  });

  document.getElementById('qtyPlus').addEventListener('click', function () {
    if (qty < maxQty) { qty++; updateSummary(); }
    else { showToast('Max ' + maxQty + ' items available!', 'error'); }
  });

  // Set min date
  var dateInput = document.getElementById('bDate');
  if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  // Form submit
  document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var date = document.getElementById('bDate').value;
    var bookingData = {
      itemId: currentItem._id,
      name: document.getElementById('bName').value,
      phone: document.getElementById('bPhone').value,
      address: document.getElementById('bAddress').value,
      eventDate: date,
      quantity: qty,
      totalPrice: currentItem.price * qty
    };

    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = 'Bearer ' + token; }

    fetch(API_URL + '/bookings', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bookingData)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) { showSuccess(date); })
    .catch(function () { showSuccess(date); });
  });
});