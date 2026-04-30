// Fix: Check success field properly
function submitLogin(email, password, submitBtn) {
  fetch('http://localhost:5000/api/auth/login', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ email: email, password: password })
  })
  .then(function (res) {
    return res.json().then(function (data) {
      return { ok: res.ok, data: data };
    });
  })
  .then(function (result) {
    setButtonLoading(submitBtn, false);

    if (result.ok && result.data.token) {
      // ✅ Save token & user
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      showToast('Welcome back ' + result.data.user.name + '! 🎉', 'success');

      setTimeout(function () {
        if (result.data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          var redirect = new URLSearchParams(window.location.search).get('redirect');
          window.location.href = redirect || 'index.html';
        }
      }, 1000);

    } else {
      // ❌ Show error
      showLoginError(result.data.message || 'Login failed');
    }
  })
  .catch(function (err) {
    setButtonLoading(submitBtn, false);
    showLoginError('Cannot connect to server. Make sure backend is running on port 5000!');
    console.error('Login Error:', err);
  });
}