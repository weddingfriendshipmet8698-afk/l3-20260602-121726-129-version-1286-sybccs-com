(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = next % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    start();
  }

  function initFilters() {
    var root = document.querySelector('[data-filter-root]');
    if (!root) {
      return;
    }
    var cards = selectAll('[data-card]', root);
    var input = root.querySelector('[data-filter-input]');
    var year = root.querySelector('[data-filter-year]');
    var type = root.querySelector('[data-filter-type]');
    var region = root.querySelector('[data-filter-region]');
    var empty = root.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }

    function match(card) {
      var q = input ? input.value.trim().toLowerCase() : '';
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var okQuery = !q || text.indexOf(q) >= 0;
      var okYear = !year || !year.value || card.getAttribute('data-year') === year.value;
      var okType = !type || !type.value || card.getAttribute('data-type') === type.value;
      var okRegion = !region || !region.value || (card.getAttribute('data-region') || '').indexOf(region.value) >= 0;
      return okQuery && okYear && okType && okRegion;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var pass = match(card);
        card.style.display = pass ? '' : 'none';
        if (pass) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-source');
    var button = document.querySelector('[data-play-button]');
    var loaded = false;

    function attach() {
      if (!source || loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
        loaded = true;
      } else {
        video.src = source;
        loaded = true;
      }
    }

    function play() {
      attach();
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', play);
    video.addEventListener('play', attach);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
