function initMoviePlayer(streamUrl, shellId) {
    var shell = document.getElementById(shellId);
    if (!shell) {
        return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var prepared = false;
    var hls = null;
    if (!video || !overlay) {
        return;
    }
    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }
        video.src = streamUrl;
    }
    function start() {
        prepare();
        overlay.classList.add("is-hidden");
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            overlay.classList.remove("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
            hls.destroy();
        }
    });
}
