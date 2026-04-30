/* ======================================== */
/* login.js - Login Page JavaScript         */
/* ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  // Toggle password
  var eyeIcon = document.getElementById('eyeIcon');
  if (eyeIcon) {
    eyeIcon.addEventListener('click', function () {
      var pass = document.getElementById('loginPass');
      if (pass.type === 'password') {
        pass.type = 'text';
        this.className = 'fas fa-eye-slash eye-icon';
      } else {
        pass.type = 'password';
        this.className = 'fas fa-eye eye-icon';
      }
    });
  }

  // Login Form
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = document.getElementById('loginEmail').value;
      var password = document.getElementById('loginPass').value;

      fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          showToast('Login Successful! 🎉', 'success');
          setTimeout(function () {
            window.location.href = result.data.user.role === 'admin' ? 'admin.html' : 'index.html';
          }, 1200);
        } else {
          document.getElementById('loginAlert').innerHTML =
            '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ' + result.data.message + '</div>';
        }
      })
      .catch(function () {
        document.getElementById('loginAlert').innerHTML =
          '<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> Server not running. Start backend first!</div>';
      });
    });
  }
});