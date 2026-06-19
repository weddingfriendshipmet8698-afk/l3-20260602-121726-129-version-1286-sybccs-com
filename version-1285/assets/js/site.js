(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5000);
    }

    var filterForm = document.querySelector('[data-filter-form]');

    if (filterForm) {
        var keywordInput = filterForm.querySelector('[name="keyword"]');
        var yearSelect = filterForm.querySelector('[name="year"]');
        var typeSelect = filterForm.querySelector('[name="type"]');
        var sortSelect = filterForm.querySelector('[name="sort"]');
        var grid = document.querySelector('[data-filter-grid]');
        var empty = document.querySelector('[data-empty]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = yearSelect && yearSelect.value;
            var type = typeSelect && typeSelect.value;
            var visibleCount = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardYear = card.getAttribute('data-year');
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var keywordMatch = !keyword || title.indexOf(keyword) !== -1 || cardRegion.indexOf(keyword) !== -1 || cardType.indexOf(keyword) !== -1;
                var yearMatch = !year || cardYear === year;
                var typeMatch = !type || cardType === normalize(type);
                var shouldShow = keywordMatch && yearMatch && typeMatch;

                card.style.display = shouldShow ? '' : 'none';

                if (shouldShow) {
                    visibleCount += 1;
                }
            });

            var visibleCards = cards.filter(function (card) {
                return card.style.display !== 'none';
            });

            if (sortSelect && sortSelect.value) {
                visibleCards.sort(function (left, right) {
                    if (sortSelect.value === 'year') {
                        return Number(right.getAttribute('data-year')) - Number(left.getAttribute('data-year'));
                    }

                    if (sortSelect.value === 'score') {
                        return Number(right.getAttribute('data-score')) - Number(left.getAttribute('data-score'));
                    }

                    return left.getAttribute('data-title').localeCompare(right.getAttribute('data-title'), 'zh-Hans-CN');
                });

                visibleCards.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            if (empty) {
                empty.style.display = visibleCount ? 'none' : 'block';
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            filterForm.addEventListener(eventName, applyFilters);
        });

        applyFilters();
    }

    function setupVideoPlayer(video) {
        var source = video.getAttribute('data-hls');

        if (!source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('video[data-hls]')).forEach(setupVideoPlayer);

    var searchRoot = document.querySelector('[data-search-page]');

    if (searchRoot && window.SEARCH_MOVIES) {
        var queryInput = searchRoot.querySelector('[name="q"]');
        var regionSelect = searchRoot.querySelector('[name="region"]');
        var typeSelect = searchRoot.querySelector('[name="type"]');
        var grid = searchRoot.querySelector('[data-search-results]');
        var empty = searchRoot.querySelector('[data-empty]');
        var params = new URLSearchParams(window.location.search);

        if (queryInput && params.get('q')) {
            queryInput.value = params.get('q');
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function cardTemplate(movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-wrap" href="' + movie.href + '">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
                '        <span class="poster-gradient"></span>',
                '        <span class="play-pill">播放</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-card-meta">',
                '            <span>' + movie.year + '</span>',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '        </div>',
                '        <h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="score-line">',
                '            <strong>' + movie.rating + '</strong>',
                '            <span>' + movie.views + ' 次热度</span>',
                '        </div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function renderSearch() {
            var keyword = String(queryInput && queryInput.value || '').trim().toLowerCase();
            var region = regionSelect && regionSelect.value;
            var type = typeSelect && typeSelect.value;

            var results = window.SEARCH_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine].join(' ').toLowerCase();
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var regionMatch = !region || movie.region.indexOf(region) !== -1;
                var typeMatch = !type || movie.type === type;
                return keywordMatch && regionMatch && typeMatch;
            }).slice(0, 120);

            if (grid) {
                grid.innerHTML = results.map(cardTemplate).join('');
            }

            if (empty) {
                empty.style.display = results.length ? 'none' : 'block';
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            searchRoot.addEventListener(eventName, renderSearch);
        });

        renderSearch();
    }
})();
