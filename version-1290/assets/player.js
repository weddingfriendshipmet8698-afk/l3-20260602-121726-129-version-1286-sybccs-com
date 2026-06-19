(function () {
  var bindPlayer = function (frame) {
    var video = frame.querySelector("video");
    var button = frame.querySelector(".play-overlay");

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var hlsInstance = null;

    var loadStream = function () {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute("data-ready", "1");
    };

    var startPlay = function () {
      loadStream();
      frame.classList.add("is-playing");
      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          frame.classList.remove("is-playing");
        });
      }
    };

    button.addEventListener("click", startPlay);

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener("play", function () {
      frame.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        frame.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      frame.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bindPlayer);
  });
})();
