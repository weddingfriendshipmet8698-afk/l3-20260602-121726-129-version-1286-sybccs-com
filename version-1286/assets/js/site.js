(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-to]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  const filterInput = document.querySelector('[data-movie-filter]');
  const sortSelect = document.querySelector('[data-movie-sort]');
  const movieGrid = document.querySelector('[data-movie-grid]');
  const emptyState = document.querySelector('[data-empty-state]');

  const normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  const applyList = function () {
    if (!movieGrid) {
      return;
    }

    const cards = Array.from(movieGrid.querySelectorAll('.movie-card'));
    const query = normalize(filterInput ? filterInput.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year
      ].join(' '));
      const matched = !query || haystack.includes(query);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (sortSelect) {
      const mode = sortSelect.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }

        if (mode === 'rating') {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }

        if (mode === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }

        return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
      });

      sorted.forEach(function (card) {
        movieGrid.appendChild(card);
      });
    }

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', applyList);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyList);
  }

  applyList();
})();

function initMoviePlayer(videoId, overlayId, buttonId, streamUrl) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  const button = document.getElementById(buttonId);
  let started = false;
  let hls = null;

  if (!video || !streamUrl) {
    return;
  }

  const attach = function () {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    const playing = video.play();

    if (playing && typeof playing.catch === 'function') {
      playing.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', attach);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      attach();
    });
  }

  video.addEventListener('click', function () {
    if (!started) {
      attach();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
