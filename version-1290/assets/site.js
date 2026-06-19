(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var backs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-bg]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    var show = function (index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });

      backs.forEach(function (back, i) {
        back.classList.toggle("is-active", i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterSelect = document.querySelector("[data-filter-select]");
  var filterGrid = document.querySelector("[data-filter-grid]");
  var emptyState = document.querySelector("[data-empty-state]");

  if (filterInput && filterGrid) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query) {
      filterInput.value = query;
    }

    var runFilter = function () {
      var term = filterInput.value.trim().toLowerCase();
      var year = filterSelect ? filterSelect.value : "";
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll("[data-filter-card]"));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchText = !term || haystack.indexOf(term) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var shouldShow = matchText && matchYear;

        card.classList.toggle("hidden-by-filter", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    };

    filterInput.addEventListener("input", runFilter);

    if (filterSelect) {
      filterSelect.addEventListener("change", runFilter);
    }

    runFilter();
  }
})();
