/* ======================================== */
/* signup.js - Signup Page JavaScript        */
/* ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  var signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('sName').value;
      var email = document.getElementById('sEmail').value;
      var phone = document.getElementById('sPhone').value;
      var password = document.getElementById('sPass').value;
      var cpass = document.getElementById('sCPass').value;

      // Validation
      if (password !== cpass) {
        document.getElementById('signupAlert').innerHTML =
          '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Passwords do not match!</div>';
        return;
      }

      if (password.length < 6) {
        document.getElementById('signupAlert').innerHTML =
          '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Password must be 6+ characters!</div>';
        return;
      }

      fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, phone: phone, password: password })
      })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          showToast('Account Created! 🎉', 'success');
          setTimeout(function () { window.location.href = 'login.html'; }, 1200);
        } else {
          document.getElementById('signupAlert').innerHTML =
            '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ' + result.data.message + '</div>';
        }
      })
      .catch(function () {
        document.getElementById('signupAlert').innerHTML =
          '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Server not running!</div>';
      });
    });
  }
});