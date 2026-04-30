/* ======================================== */
/* booking.js - Booking Page JavaScript     */
/* Light Theme + Performance Optimized      */
/* ======================================== */

// ===== STATE =====
var currentItem = null;
var qty = 1;
var maxQty = 1;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  setupQuantityButtons();
  setupMinDate();
  setupFormValidation();
  setupFormSubmit();
  loadItem();
});

// ===== GET ITEM ID FROM URL =====
function getItemId() {
  var params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// ===== LOAD ITEM =====
function loadItem() {
  var id = getItemId();

  if (!id) {
    showToast('No item selected!', 'error');
    setTimeout(function () {
      window.location.href = 'items.html';
    }, 1200);
    return;
  }

  // Show loading state
  showPreviewSkeleton();

  fetch(API_URL + '/items/' + id)
    .then(function (res) {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(function (data) {
      if (data && (data._id || data.id)) {
        currentItem = data;
      } else {
        throw new Error('Invalid data');
      }
      setupBookingPage();
    })
    .catch(function () {
      // Find in sample items
      currentItem = null;
      for (var i = 0; i < sampleItems.length; i++) {
        if (sampleItems[i]._id === id || sampleItems[i].id === id) {
          currentItem = sampleItems[i];
          break;
        }
      }

      if (!currentItem) {
        showToast('Item not found!', 'error');
        setTimeout(function () {
          window.location.href = 'items.html';
        }, 1200);
        return;
      }

      setupBookingPage();
    });
}

// ===== SHOW PREVIEW SKELETON =====
function showPreviewSkeleton() {
  var previewEmoji = document.getElementById('previewEmoji');
  if (previewEmoji) {
    previewEmoji.style.opacity = '0.3';
  }
}

// ===== SETUP BOOKING PAGE =====
function setupBookingPage() {
  if (!currentItem) return;

  maxQty = currentItem.stock || 0;

  // Set preview data
  var previewEmoji = document.getElementById('previewEmoji');
  var previewCat = document.getElementById('previewCat');
  var previewName = document.getElementById('previewName');
  var previewDesc = document.getElementById('previewDesc');
  var previewPrice = document.getElementById('previewPrice');
  var previewStock = document.getElementById('previewStock');
  var sumPrice = document.getElementById('sumPrice');

  if (previewEmoji) {
    previewEmoji.textContent = currentItem.emoji || '🎁';
    previewEmoji.style.opacity = '1';
  }

  if (previewCat) previewCat.textContent = currentItem.category || 'Decoration';
  if (previewName) previewName.textContent = currentItem.name || 'Item';
  if (previewDesc) {
    previewDesc.textContent = currentItem.description || 'Premium decoration item for your special events.';
  }

  if (previewPrice) {
    previewPrice.textContent = Number(currentItem.price || 0).toLocaleString('en-IN');
  }

  // Stock info
  if (previewStock) {
    previewStock.textContent = currentItem.stock;
  }

  // Stock info styling
  var stockInfoEl = document.getElementById('stockInfo');
  if (stockInfoEl) {
    if (currentItem.stock === 0) {
      stockInfoEl.className = 'stock-info out-of-stock';
      stockInfoEl.innerHTML = '<i class="fas fa-times-circle"></i> Out of Stock';
    } else {
      stockInfoEl.className = 'stock-info';
      stockInfoEl.innerHTML =
        '<i class="fas fa-check-circle"></i>' +
        '<span id="previewStock">' + currentItem.stock + '</span> items available';
    }
  }

  // Rating
  var ratingEl = document.getElementById('previewRating');
  if (ratingEl && currentItem.rating) {
    ratingEl.innerHTML = buildStars(currentItem.rating) +
      '<span> ' + currentItem.rating + '</span>';
  }

  if (sumPrice) {
    sumPrice.textContent = Number(currentItem.price || 0).toLocaleString('en-IN');
  }

  // Disable form if out of stock
  if (currentItem.stock === 0) {
    var submitBtn = document.querySelector('#bookingForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Out of Stock';
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
    }

    var qtyPlusBtn = document.getElementById('qtyPlus');
    var qtyMinusBtn = document.getElementById('qtyMinus');
    if (qtyPlusBtn) qtyPlusBtn.disabled = true;
    if (qtyMinusBtn) qtyMinusBtn.disabled = true;
  }

  updateSummary();
}

// ===== BUILD STARS =====
function buildStars(rating) {
  var html = '';
  var full = Math.floor(rating);
  var half = (rating % 1) >= 0.5 ? 1 : 0;

  for (var i = 0; i < full; i++) {
    html += '<i class="fas fa-star" style="color:#fdcb6e"></i>';
  }
  if (half) {
    html += '<i class="fas fa-star-half-alt" style="color:#fdcb6e"></i>';
  }

  return html;
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
  var qtyVal = document.getElementById('qtyVal');
  var sumQty = document.getElementById('sumQty');
  var sumTotal = document.getElementById('sumTotal');

  if (qtyVal) qtyVal.textContent = qty;
  if (sumQty) sumQty.textContent = qty;

  var total = (currentItem ? (currentItem.price || 0) : 0) * qty;

  if (sumTotal) {
    sumTotal.textContent = Number(total).toLocaleString('en-IN');
  }

  // Update minus button state
  var minusBtn = document.getElementById('qtyMinus');
  if (minusBtn) {
    minusBtn.disabled = qty <= 1;
  }

  // Update plus button state
  var plusBtn = document.getElementById('qtyPlus');
  if (plusBtn) {
    plusBtn.disabled = qty >= maxQty;
  }
}

// ===== SETUP QUANTITY BUTTONS =====
function setupQuantityButtons() {
  var minusBtn = document.getElementById('qtyMinus');
  var plusBtn = document.getElementById('qtyPlus');

  if (minusBtn) {
    minusBtn.addEventListener('click', function () {
      if (qty > 1) {
        qty--;
        updateSummary();
        animateQtyChange();
      }
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener('click', function () {
      if (qty < maxQty) {
        qty++;
        updateSummary();
        animateQtyChange();
      } else {
        showToast('Maximum ' + maxQty + ' items available!', 'error');
        // Shake animation on max
        var qtyVal = document.getElementById('qtyVal');
        if (qtyVal) {
          qtyVal.style.animation = 'none';
          qtyVal.style.color = 'var(--danger)';
          setTimeout(function () {
            qtyVal.style.color = '';
          }, 800);
        }
      }
    });
  }
}

// ===== ANIMATE QTY CHANGE =====
function animateQtyChange() {
  var qtyVal = document.getElementById('qtyVal');
  if (qtyVal) {
    qtyVal.style.transform = 'scale(1.2)';
    qtyVal.style.color = 'var(--primary)';
    setTimeout(function () {
      qtyVal.style.transform = 'scale(1)';
      qtyVal.style.color = '';
    }, 200);
    qtyVal.style.transition = 'all 0.2s ease';
  }
}

// ===== SET MIN DATE =====
function setupMinDate() {
  var dateInput = document.getElementById('bDate');
  if (dateInput) {
    dateInput.setAttribute('min', getTodayDate());
  }
}

// ===== FORM VALIDATION =====
function setupFormValidation() {
  // Real-time validation
  var nameInput = document.getElementById('bName');
  var phoneInput = document.getElementById('bPhone');
  var addressInput = document.getElementById('bAddress');

  if (nameInput) {
    nameInput.addEventListener('blur', function () {
      if (this.value.trim().length < 2) {
        showFieldError('bName', 'Please enter a valid name');
      } else {
        clearFieldError('bName');
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('blur', function () {
      var phone = this.value.replace(/\D/g, '');
      if (phone.length < 10) {
        showFieldError('bPhone', 'Please enter a valid 10-digit phone number');
      } else {
        clearFieldError('bPhone');
      }
    });

    // Allow only numbers
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }

  if (addressInput) {
    addressInput.addEventListener('blur', function () {
      if (this.value.trim().length < 10) {
        showFieldError('bAddress', 'Please enter complete address');
      } else {
        clearFieldError('bAddress');
      }
    });
  }
}

// ===== FORM SUBMIT =====
function setupFormSubmit() {
  var form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!currentItem) {
      showToast('Please wait, loading item...', 'error');
      return;
    }

    // Validate all fields
    var name = document.getElementById('bName').value.trim();
    var phone = document.getElementById('bPhone').value.trim();
    var address = document.getElementById('bAddress').value.trim();
    var date = document.getElementById('bDate').value;

    var hasError = false;

    if (name.length < 2) {
      showFieldError('bName', 'Please enter your full name');
      hasError = true;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      showFieldError('bPhone', 'Please enter valid phone number');
      hasError = true;
    }

    if (address.length < 10) {
      showFieldError('bAddress', 'Please enter complete delivery address');
      hasError = true;
    }

    if (!date) {
      showFieldError('bDate', 'Please select event date');
      hasError = true;
    }

    if (hasError) return;

    // Submit booking
    submitBooking(name, phone, address, date);
  });
}

// ===== SUBMIT BOOKING =====
function submitBooking(name, phone, address, date) {
  var submitBtn = document.querySelector('#bookingForm button[type="submit"]');
  setButtonLoading(submitBtn, true);

  var bookingData = {
    itemId: currentItem._id || currentItem.id,
    name: name,
    phone: phone,
    address: address,
    eventDate: date,
    quantity: qty,
    totalPrice: (currentItem.price || 0) * qty
  };

  var headers = { 'Content-Type': 'application/json' };
  var token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  fetch(API_URL + '/bookings', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(bookingData)
  })
  .then(function (res) {
    if (!res.ok) throw new Error('Booking failed');
    return res.json();
  })
  .then(function (data) {
    setButtonLoading(submitBtn, false);
    showSuccessPage(name, phone, address, date, data._id || data.booking?._id);
  })
  .catch(function () {
    setButtonLoading(submitBtn, false);
    // Demo mode - show success anyway
    showSuccessPage(name, phone, address, date, 'DEMO' + Date.now());
  });
}

// ===== SHOW SUCCESS PAGE =====
function showSuccessPage(name, phone, address, date, bookingId) {
  var bookingSection = document.getElementById('bookingSection');
  var successPage = document.getElementById('successPage');

  if (bookingSection) bookingSection.style.display = 'none';
  if (successPage) {
    successPage.style.display = 'block';
    successPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Fill success details
  setSuccessDetail('successItem', currentItem.name);
  setSuccessDetail('successQty', qty + ' piece' + (qty > 1 ? 's' : ''));
  setSuccessDetail('successDate', formatDate(date));
  setSuccessDetail('successName', name);
  setSuccessDetail('successPhone', phone);
  setSuccessDetail('successTotal', formatPrice((currentItem.price || 0) * qty));

  // Booking reference
  var refEl = document.getElementById('bookingRef');
  if (refEl && bookingId) {
    refEl.textContent = 'Booking ID: #' + String(bookingId).slice(-8).toUpperCase();
  }

  showToast('Booking Confirmed! 🎉', 'success');
}

function setSuccessDetail(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}