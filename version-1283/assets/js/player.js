(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    window.initMoviePlayer = function (sourceUrl) {
        ready(function () {
            var video = document.getElementById("video-player");
            var button = document.getElementById("play-button");
            var hls = null;

            if (!video || !sourceUrl) {
                return;
            }

            function attach() {
                if (video.dataset.loaded === "1") {
                    return;
                }
                video.dataset.loaded = "1";

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }

            function start() {
                attach();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }

            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });

            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
