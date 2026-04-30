/* ======================================== */
/* home.js - Home Page JavaScript           */
/* Light Theme Version                      */
/* ======================================== */

document.addEventListener('DOMContentLoaded', function () {
  console.log('🏠 Home Page Loaded');

  // ===== COUNTER ANIMATION =====
  animateCounters();

  // ===== CATEGORY CARDS CLICK =====
  setupCategoryLinks();
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
  var counters = document.querySelectorAll('.stat-item h3');

  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var target = entry.target;
        var text = target.textContent;

        // Extract number
        var match = text.match(/(\d+)/);
        if (!match) return;

        var finalNum = parseInt(match[0]);
        var suffix = text.replace(match[0], '');
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);

          // Ease out
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * finalNum);

          target.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            target.textContent = text;
          }
        }

        requestAnimationFrame(step);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
}

// ===== CATEGORY LINKS =====
function setupCategoryLinks() {
  var catCards = document.querySelectorAll('.cat-card');

  catCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var catName = this.querySelector('h3');
      if (catName) {
        var category = catName.textContent.trim().split(' ')[0];
        window.location.href = 'items.html?category=' + encodeURIComponent(category);
      }
    });
  });
}