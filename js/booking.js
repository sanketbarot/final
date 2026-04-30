/* ======================================== */
/* booking.js - Real-Time Stock Update Fix  */
/* ======================================== */

// ===== STATE =====
var currentItem = null;
var qty = 1;
var maxQty = 1;
var pollTimer = null;
var lastKnownStock = -1;
var POLL_INTERVAL = 5000; // Check every 5 seconds

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  setupMinDate();
  setupQuantityButtons();
  setupFormValidation();
  setupFormSubmit();
  loadItem();
});

// ===== STOP POLL ON LEAVE =====
window.addEventListener('beforeunload', stopPolling);
window.addEventListener('pagehide', stopPolling);

// ===== GET ITEM ID =====
function getItemId() {
  return new URLSearchParams(window.location.search).get('id');
}

// ===== LOAD ITEM =====
function loadItem() {
  var id = getItemId();

  if (!id) {
    showToast('No item selected!', 'error');
    setTimeout(function () { window.location.href = 'items.html'; }, 1500);
    return;
  }

  // Try API
  fetch(API_URL + '/items/' + id)
    .then(function (res) {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(function (data) {
      if (data && (data._id || data.id)) {
        currentItem = data;
        lastKnownStock = Number(data.stock);
        renderPreview();
        // Start polling stock every 5 seconds
        startPolling(id);
      } else {
        throw new Error('Bad data');
      }
    })
    .catch(function () {
      // Use sample data
      useSampleItem(id);
    });
}

// ===== USE SAMPLE DATA =====
function useSampleItem(id) {
  for (var i = 0; i < sampleItems.length; i++) {
    if (sampleItems[i]._id === id) {
      currentItem = sampleItems[i];
      lastKnownStock = Number(currentItem.stock);
      break;
    }
  }

  if (!currentItem) {
    showToast('Item not found!', 'error');
    setTimeout(function () { window.location.href = 'items.html'; }, 1500);
    return;
  }

  renderPreview();
}

// ===== RENDER PREVIEW =====
function renderPreview() {
  // Show skeleton hidden, show data
  var sk = document.getElementById('previewSkeleton');
  var pd = document.getElementById('previewData');
  if (sk) sk.style.display = 'none';
  if (pd) pd.style.display = 'block';

  maxQty = Number(currentItem.stock) || 0;

  // Set fields
  var el = document.getElementById('previewEmoji');
  if (el) el.textContent = currentItem.emoji || '🎁';

  el = document.getElementById('previewCat');
  if (el) el.textContent = currentItem.category || '';

  el = document.getElementById('previewName');
  if (el) el.textContent = currentItem.name || '';

  el = document.getElementById('previewDesc');
  if (el) el.textContent = currentItem.description || 'Premium decoration item.';

  el = document.getElementById('previewPrice');
  if (el) el.textContent = Number(currentItem.price || 0).toLocaleString('en-IN');

  el = document.getElementById('sumPrice');
  if (el) el.textContent = Number(currentItem.price || 0).toLocaleString('en-IN');

  // Rating
  el = document.getElementById('previewRating');
  if (el && currentItem.rating) {
    var stars = '';
    var full = Math.floor(currentItem.rating);
    for (var i = 0; i < full; i++) stars += '★';
    if ((currentItem.rating % 1) >= 0.5) stars += '½';
    el.innerHTML =
      '<span style="color:#fdcb6e;font-size:0.95rem;">' + stars + '</span>' +
      '<span style="font-weight:600;color:#2d3436;font-size:0.85rem;"> ' + currentItem.rating + '</span>';
  }

  // Update stock display
  updateStockUI(maxQty, false);
  updateSummary();
}

// ===== START POLLING =====
function startPolling(itemId) {
  stopPolling();

  pollTimer = setInterval(function () {
    checkStock(itemId);
  }, POLL_INTERVAL);
}

// ===== STOP POLLING =====
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// ===== CHECK STOCK (Called every 5 seconds) =====
function checkStock(itemId) {
  fetch(API_URL + '/items/' + itemId)
    .then(function (res) {
      if (!res.ok) throw new Error('Error');
      return res.json();
    })
    .then(function (data) {
      if (!data) return;

      var newStock = Number(data.stock);

      // Stock changed?
      if (newStock !== lastKnownStock) {
        var oldStock = lastKnownStock;
        lastKnownStock = newStock;
        maxQty = newStock;

        if (currentItem) currentItem.stock = newStock;

        // Update UI
        updateStockUI(newStock, true);

        // Fix qty if needed
        if (qty > newStock) {
          qty = newStock > 0 ? newStock : 1;
          updateSummary();
        }

        // Notify user
        notifyStockChange(oldStock, newStock);
      }
    })
    .catch(function () {
      // Silent fail
    });
}

// ===== NOTIFY STOCK CHANGE =====
function notifyStockChange(oldStock, newStock) {
  if (newStock === 0) {
    showToast('❌ This item is now Out of Stock!', 'error');
  } else if (newStock < oldStock) {
    showToast('📦 Stock updated: Only ' + newStock + ' left!', 'error');
  } else if (newStock > oldStock) {
    showToast('✅ Stock updated: ' + newStock + ' items available', 'success');
  }
}

// ===== UPDATE STOCK UI =====
function updateStockUI(stock, animate) {
  var stockBox = document.getElementById('stockInfo');
  var stockNum = document.getElementById('stockNum');
  var liveDot = document.getElementById('liveDot');
  var submitBtn = document.getElementById('bookingSubmitBtn');
  var qtyPlus = document.getElementById('qtyPlus');
  var qtyMinus = document.getElementById('qtyMinus');

  // Update number with animation
  if (stockNum) {
    if (animate) {
      stockNum.style.transition = 'all 0.3s ease';
      stockNum.style.transform = 'scale(1.4)';
      stockNum.style.color = stock === 0 ? '#d63031' : (stock <= 5 ? '#e17055' : '#00b894');

      setTimeout(function () {
        stockNum.textContent = stock;
        stockNum.style.transform = 'scale(1)';
        setTimeout(function () {
          stockNum.style.color = '';
        }, 500);
      }, 150);
    } else {
      stockNum.textContent = stock;
    }
  }

  // Update stockBox style
  if (stockBox) {
    if (stock === 0) {
      stockBox.className = 'stock-info out-stock';

      // Update text content
      var txt = stockBox.querySelector('.stock-txt');
      if (txt) txt.textContent = 'Out of Stock';

      var icon = stockBox.querySelector('.stock-icon');
      if (icon) {
        icon.className = 'stock-icon fas fa-times-circle';
      }

    } else if (stock <= 5) {
      stockBox.className = 'stock-info low-stock';

      var txt = stockBox.querySelector('.stock-txt');
      if (txt) txt.textContent = 'items left - Hurry!';

      var icon = stockBox.querySelector('.stock-icon');
      if (icon) {
        icon.className = 'stock-icon fas fa-exclamation-triangle';
      }

    } else {
      stockBox.className = 'stock-info in-stock';

      var txt = stockBox.querySelector('.stock-txt');
      if (txt) txt.textContent = 'items available';

      var icon = stockBox.querySelector('.stock-icon');
      if (icon) {
        icon.className = 'stock-icon fas fa-check-circle';
      }
    }
  }

  // Update live dot color
  if (liveDot) {
    if (stock === 0) {
      liveDot.style.background = '#d63031';
    } else if (stock <= 5) {
      liveDot.style.background = '#e17055';
    } else {
      liveDot.style.background = '#00b894';
    }
  }

  // Enable/Disable form
  if (stock === 0) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-ban"></i> Out of Stock';
      submitBtn.style.cssText = 'background:linear-gradient(135deg,#b2bec3,#dfe6e9);color:#636e72;cursor:not-allowed;opacity:0.7;';
    }
    if (qtyPlus) qtyPlus.disabled = true;
    if (qtyMinus) qtyMinus.disabled = true;
  } else {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Booking';
      submitBtn.style.cssText = '';
    }
    if (qtyPlus) qtyPlus.disabled = qty >= stock;
    if (qtyMinus) qtyMinus.disabled = qty <= 1;
  }
}

// ===== UPDATE ORDER SUMMARY =====
function updateSummary() {
  var price = currentItem ? (Number(currentItem.price) || 0) : 0;
  var total = price * qty;

  var qtyEl = document.getElementById('qtyVal');
  var sumQtyEl = document.getElementById('sumQty');
  var sumTotalEl = document.getElementById('sumTotal');

  if (qtyEl) qtyEl.textContent = qty;
  if (sumQtyEl) sumQtyEl.textContent = qty;
  if (sumTotalEl) sumTotalEl.textContent = total.toLocaleString('en-IN');

  // Update button states
  var minusBtn = document.getElementById('qtyMinus');
  var plusBtn = document.getElementById('qtyPlus');
  if (minusBtn) minusBtn.disabled = qty <= 1;
  if (plusBtn) plusBtn.disabled = qty >= maxQty || maxQty === 0;
}

// ===== QUANTITY BUTTONS =====
function setupQuantityButtons() {
  var minusBtn = document.getElementById('qtyMinus');
  var plusBtn = document.getElementById('qtyPlus');

  if (minusBtn) {
    minusBtn.addEventListener('click', function () {
      if (qty > 1) {
        qty--;
        updateSummary();
        flashQty('up');
      }
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener('click', function () {
      if (maxQty === 0) {
        showToast('Item is out of stock!', 'error');
        return;
      }
      if (qty < maxQty) {
        qty++;
        updateSummary();
        flashQty('up');
      } else {
        showToast('Only ' + maxQty + ' items available!', 'error');
        var qtyVal = document.getElementById('qtyVal');
        if (qtyVal) {
          qtyVal.style.color = '#d63031';
          qtyVal.style.transform = 'scale(1.2)';
          setTimeout(function () {
            qtyVal.style.color = '';
            qtyVal.style.transform = '';
          }, 600);
        }
      }
    });
  }
}

// ===== FLASH QTY =====
function flashQty() {
  var el = document.getElementById('qtyVal');
  if (!el) return;
  el.style.transition = 'all 0.15s ease';
  el.style.transform = 'scale(1.3)';
  el.style.color = '#6c5ce7';
  setTimeout(function () {
    el.style.transform = 'scale(1)';
    el.style.color = '';
  }, 200);
}

// ===== MIN DATE =====
function setupMinDate() {
  var d = document.getElementById('bDate');
  if (d) {
    var today = new Date();
    var y = today.getFullYear();
    var m = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    d.setAttribute('min', y + '-' + m + '-' + day);
  }
}

// ===== FORM VALIDATION =====
function setupFormValidation() {
  // Name
  var nameEl = document.getElementById('bName');
  if (nameEl) {
    nameEl.addEventListener('blur', function () {
      if (this.value.trim().length < 2) showFieldError('bName', 'Enter your full name');
      else clearFieldError('bName');
    });
    nameEl.addEventListener('input', function () {
      if (this.value.length > 0) clearFieldError('bName');
    });
  }

  // Phone
  var phoneEl = document.getElementById('bPhone');
  if (phoneEl) {
    phoneEl.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
      if (this.value.length > 0) clearFieldError('bPhone');
    });
    phoneEl.addEventListener('blur', function () {
      if (this.value.length < 10) showFieldError('bPhone', 'Enter valid 10-digit phone');
      else clearFieldError('bPhone');
    });
  }

  // Address
  var addrEl = document.getElementById('bAddress');
  if (addrEl) {
    addrEl.addEventListener('blur', function () {
      if (this.value.trim().length < 10) showFieldError('bAddress', 'Enter complete address');
      else clearFieldError('bAddress');
    });
    addrEl.addEventListener('input', function () {
      if (this.value.length > 0) clearFieldError('bAddress');
    });
  }

  // Date
  var dateEl = document.getElementById('bDate');
  if (dateEl) {
    dateEl.addEventListener('change', function () {
      if (this.value) clearFieldError('bDate');
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
      showToast('Loading item, please wait...', 'error');
      return;
    }

    if (maxQty === 0) {
      showToast('Sorry! Out of Stock!', 'error');
      return;
    }

    // Get values
    var name    = (document.getElementById('bName')    || {}).value || '';
    var phone   = (document.getElementById('bPhone')   || {}).value || '';
    var address = (document.getElementById('bAddress') || {}).value || '';
    var date    = (document.getElementById('bDate')    || {}).value || '';

    name    = name.trim();
    phone   = phone.trim();
    address = address.trim();

    // Validate
    var errors = 0;

    if (name.length < 2) {
      showFieldError('bName', 'Enter your full name');
      errors++;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      showFieldError('bPhone', 'Enter valid 10-digit phone');
      errors++;
    }
    if (address.length < 10) {
      showFieldError('bAddress', 'Enter complete delivery address');
      errors++;
    }
    if (!date) {
      showFieldError('bDate', 'Please select event date');
      errors++;
    }

    if (errors > 0) return;

    // Submit
    submitBooking(name, phone, address, date);
  });
}

// ===== SUBMIT BOOKING =====
function submitBooking(name, phone, address, date) {
  var submitBtn = document.getElementById('bookingSubmitBtn');
  setButtonLoading(submitBtn, true);

  var data = {
    itemId    : currentItem._id || currentItem.id,
    name      : name,
    phone     : phone,
    address   : address,
    eventDate : date,
    quantity  : qty,
    totalPrice: (Number(currentItem.price) || 0) * qty
  };

  var headers = { 'Content-Type': 'application/json' };
  var token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  fetch(API_URL + '/bookings', {
    method : 'POST',
    headers: headers,
    body   : JSON.stringify(data)
  })
  .then(function (res) {
    return res.json().then(function (body) {
      return { ok: res.ok, body: body };
    });
  })
  .then(function (result) {
    setButtonLoading(submitBtn, false);

    if (result.ok) {
      // ✅ REAL-TIME: Update stock immediately after booking
      var newStock = maxQty - qty;
      if (newStock < 0) newStock = 0;

      // Update lastKnownStock so poll detects correctly
      lastKnownStock = newStock;
      maxQty = newStock;

      if (currentItem) currentItem.stock = newStock;

      // Update UI immediately
      updateStockUI(newStock, true);

      // Stop polling (booking done)
      stopPolling();

      var bookingId = result.body._id ||
        (result.body.booking && result.body.booking._id) ||
        null;

      showSuccess(name, phone, date, bookingId);

    } else {
      var msg = result.body.message || 'Booking failed. Try again!';

      // Check if stock issue
      if (msg.toLowerCase().indexOf('stock') !== -1) {
        showToast('Stock not available!', 'error');
        checkStock(currentItem._id || currentItem.id);
      } else {
        showFormAlert(msg, 'danger');
      }
    }
  })
  .catch(function () {
    setButtonLoading(submitBtn, false);

    // DEMO MODE
    var newStock = maxQty - qty;
    if (newStock < 0) newStock = 0;

    lastKnownStock = newStock;
    maxQty = newStock;
    if (currentItem) currentItem.stock = newStock;

    updateStockUI(newStock, true);
    stopPolling();
    showSuccess(name, phone, date, 'DEMO' + Date.now());
  });
}

// ===== SHOW SUCCESS =====
function showSuccess(name, phone, date, bookingId) {
  var bookSec = document.getElementById('bookingSection');
  var successSec = document.getElementById('successPage');

  if (bookSec) bookSec.style.display = 'none';

  if (successSec) {
    successSec.style.display = 'block';
    setTimeout(function () {
      successSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // Fill details
  setText('successItem',  currentItem.name);
  setText('successQty',   qty + ' piece' + (qty > 1 ? 's' : ''));
  setText('successDate',  fmtDate(date));
  setText('successName',  name);
  setText('successPhone', phone);
  setText('successTotal', '₹' + ((Number(currentItem.price) || 0) * qty).toLocaleString('en-IN'));

  // Booking ref
  var refEl = document.getElementById('bookingRef');
  if (refEl && bookingId) {
    refEl.textContent = 'Booking ID: #' + String(bookingId).slice(-8).toUpperCase();
    refEl.style.display = 'inline-block';
  }

  showToast('🎉 Booking Confirmed!', 'success');
}

// ===== TINY HELPERS =====
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function fmtDate(d) {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch (e) { return d; }
}

function showFormAlert(msg, type) {
  var el = document.getElementById('formAlert');
  if (!el) return;
  el.innerHTML =
    '<div class="alert alert-' + type + '">' +
      '<i class="fas fa-exclamation-circle"></i> ' + msg +
    '</div>';
  setTimeout(function () { el.innerHTML = ''; }, 5000);
}