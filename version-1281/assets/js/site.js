(function () {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function setHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      menuButton.textContent = mobileNav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    function showSlide(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  const panel = document.querySelector('[data-filter-panel]');
  if (panel) {
    const search = panel.querySelector('[data-search-input]');
    const region = panel.querySelector('[data-region-filter]');
    const year = panel.querySelector('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-empty-state]');

    function applyFilter() {
      const q = search ? search.value.trim().toLowerCase() : '';
      const r = region ? region.value : '';
      const y = year ? year.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.genre || '',
          card.dataset.type || ''
        ].join(' ').toLowerCase();
        const ok = (!q || text.indexOf(q) !== -1) && (!r || card.dataset.region === r) && (!y || card.dataset.year === y);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [search, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });
  }
})();

(function () {
  const player = document.querySelector('[data-player]');
  if (!player) return;

  const video = player.querySelector('video');
  const overlay = player.querySelector('[data-player-overlay]');
  const source = player.getAttribute('data-source');
  const wrap = player.querySelector('.video-wrap');
  const note = player.querySelector('[data-player-note]');
  let hls = null;
  let loaded = false;

  function setNote(text) {
    if (note) {
      note.textContent = text;
    }
  }

  function attachSource() {
    if (!video || !source || loaded) return;
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setNote('播放源已就绪');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setNote('播放源已就绪');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) return;
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setNote('网络连接异常，正在重新载入');
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setNote('媒体载入异常，正在恢复播放');
          hls.recoverMediaError();
        } else {
          setNote('当前播放源暂时不可用');
          hls.destroy();
        }
      });
    } else {
      setNote('当前浏览器不支持 HLS 播放');
    }
  }

  function togglePlay() {
    attachSource();
    if (!video) return;
    if (video.paused) {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setNote('请再次点击播放');
        });
      }
    } else {
      video.pause();
    }
  }

  if (overlay) {
    overlay.addEventListener('click', togglePlay);
  }

  if (video) {
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      if (wrap) wrap.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (wrap) wrap.classList.remove('is-playing');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) hls.destroy();
  });
})();
