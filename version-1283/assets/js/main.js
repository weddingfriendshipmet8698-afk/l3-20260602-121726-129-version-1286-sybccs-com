(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return (value || "").toString().toLowerCase();
    }

    ready(function () {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobile = document.querySelector("[data-mobile-nav]");

        function updateHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 20) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (toggle && mobile && header) {
            toggle.addEventListener("click", function () {
                mobile.classList.toggle("is-open");
                header.classList.toggle("menu-open", mobile.classList.contains("is-open"));
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (input && input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
                }
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === active);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            start();
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scope = panel.parentElement;
            var grid = scope ? scope.querySelector("[data-filter-grid]") : null;
            if (!grid) {
                return;
            }
            var input = panel.querySelector("[data-filter-keyword]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";

            if (input && q) {
                input.value = q;
            }

            function apply() {
                var keyword = text(input ? input.value : "");
                var selectedRegion = region ? region.value : "";
                var selectedYear = year ? year.value : "";

                cards.forEach(function (card) {
                    var haystack = text([
                        card.dataset.title,
                        card.dataset.type,
                        card.dataset.tags,
                        card.querySelector("p") ? card.querySelector("p").textContent : ""
                    ].join(" "));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchRegion = !selectedRegion || card.dataset.region === selectedRegion;
                    var matchYear = !selectedYear || card.dataset.year === selectedYear;
                    card.classList.toggle("is-hidden", !(matchKeyword && matchRegion && matchYear));
                });
            }

            [input, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    });
})();
