(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function bindMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-keywords") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function filterGrid(input) {
        var targetId = input.getAttribute("data-target");
        var grid = targetId ? document.getElementById(targetId) : null;
        if (!grid) {
            return;
        }
        var query = input.value.trim().toLowerCase();
        Array.prototype.slice.call(grid.children).forEach(function (card) {
            var matched = !query || textOf(card).indexOf(query) !== -1;
            card.style.display = matched ? "" : "none";
        });
    }

    function compareCards(mode) {
        return function (a, b) {
            if (mode === "title-asc") {
                return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
            }
            if (mode === "heat-desc") {
                return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
            }
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        };
    }

    function sortGrid(select) {
        var targetId = select.getAttribute("data-target");
        var grid = targetId ? document.getElementById(targetId) : null;
        if (!grid) {
            return;
        }
        Array.prototype.slice.call(grid.children)
            .sort(compareCards(select.value))
            .forEach(function (card) {
                grid.appendChild(card);
            });
    }

    function bindFilters() {
        Array.prototype.slice.call(document.querySelectorAll(".movie-filter")).forEach(function (input) {
            var queryKey = input.getAttribute("data-url-query");
            if (queryKey) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get(queryKey);
                if (value) {
                    input.value = value;
                }
            }
            input.addEventListener("input", function () {
                filterGrid(input);
            });
            filterGrid(input);
        });
        Array.prototype.slice.call(document.querySelectorAll(".movie-sort")).forEach(function (select) {
            select.addEventListener("change", function () {
                sortGrid(select);
            });
            sortGrid(select);
        });
    }

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
    });
})();
