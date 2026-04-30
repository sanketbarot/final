/* ======================================== */
/* contact.js - Contact Page JavaScript     */
/* ======================================== */

document.addEventListener('DOMContentLoaded', function () {

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('contactAlert').innerHTML =
        '<div class="alert alert-success"><i class="fas fa-check-circle"></i> Message sent successfully! We will contact you soon. ✨</div>';
      showToast('Message Sent! ✨', 'success');
      this.reset();
    });
  }
});