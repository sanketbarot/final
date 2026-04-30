// Fix: Check success field properly
function submitSignup(name, email, phone, password, submitBtn) {
  fetch('http://localhost:5000/api/auth/register', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      name    : name,
      email   : email,
      phone   : phone,
      password: password
    })
  })
  .then(function (res) {
    return res.json().then(function (data) {
      return { ok: res.ok, data: data };
    });
  })
  .then(function (result) {
    setButtonLoading(submitBtn, false);

    if (result.ok && result.data.token) {
      // ✅ Success
      showToast('Account Created! Welcome to DecoStock 🎉', 'success');
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1200);

    } else {
      // ❌ Show error
      showSignupError(result.data.message || 'Registration failed');
    }
  })
  .catch(function (err) {
    setButtonLoading(submitBtn, false);
    showSignupError('Cannot connect to server. Make sure backend is running on port 5000!');
    console.error('Signup Error:', err);
  });
}