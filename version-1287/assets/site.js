document.addEventListener('DOMContentLoaded', function () {
  initImages();
  initMobileMenu();
  initHero();
  initPageFilter();
  initSearchPage();
  initPlayers();
});

function initImages() {
  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    }, { once: true });
  });
}

function initMobileMenu() {
  var button = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (!button || !menu) {
    return;
  }
  button.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function initHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (!slides.length || !dots.length) {
    return;
  }
  var index = 0;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === index);
    });
  }
  dots.forEach(function (dot, current) {
    dot.addEventListener('click', function () {
      show(current);
    });
  });
  window.setInterval(function () {
    show(index + 1);
  }, 5200);
}

function initPageFilter() {
  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-page-filter]'));
  forms.forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    function applyFilter(value) {
      var query = String(value || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();
        var visible = !query || query === '全部' || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-filter-hidden', !visible);
      });
    }
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
    form.querySelectorAll('[data-filter-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-filter-value') || '';
        applyFilter(input.value);
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter(input.value);
    });
  });
}

function initSearchPage() {
  var resultBox = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var input = document.querySelector('[data-search-input]');
  if (!resultBox || !window.MOVIE_SEARCH_DATA) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  if (input) {
    input.value = query;
  }
  if (!query.trim()) {
    return;
  }
  var lower = query.trim().toLowerCase();
  var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
    return [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine]
      .join(' ')
      .toLowerCase()
      .indexOf(lower) !== -1;
  }).slice(0, 120);
  if (title) {
    title.textContent = '“' + query + '” 的搜索结果';
  }
  resultBox.innerHTML = results.map(renderSearchCard).join('') || '<div class="detail-text-block"><h2>暂无匹配内容</h2><p>可以更换片名、年份、地区或题材继续搜索。</p></div>';
  initImages();
}

function renderSearchCard(item) {
  var tags = String(item.tags || '').split(',').slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');
  return '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-genre="' + escapeHtml(item.genre) + '" data-region="' + escapeHtml(item.region) + '">' +
    '<a class="poster-frame" href="./' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">' +
    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
    '<span class="poster-glow"></span>' +
    '</a>' +
    '<div class="card-body">' +
    '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
    '<h3><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
    '<p>' + escapeHtml(item.oneLine) + '</p>' +
    '<div class="tag-row">' + tags + '</div>' +
    '</div>' +
    '</article>';
}

function initPlayers() {
  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-src');
    var initialized = false;
    function start() {
      if (!initialized) {
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      button.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }
    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
  });
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
