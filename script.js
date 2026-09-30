const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");

const chooseBtn = document.getElementById("chooseBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const backBtn = document.getElementById("backBtn");

const songName = document.getElementById("songName");
const statusText = document.getElementById("status");

const volume = document.getElementById("volume");
const volumeText = document.getElementById("volumeText");

const seekBar = document.getElementById("seekBar");
const currentTimeText = document.getElementById("currentTime");
const durationText = document.getElementById("duration");

const resetBtn = document.getElementById("resetBtn");
const eqSliders = document.querySelectorAll(".eqSlider");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let audioContext = null;
let sourceNode = null;
let analyser = null;
let filters = [];
let currentURL = null;

const frequencies = [
  60,
  120,
  250,
  500,
  1000,
  2000,
  4000,
  8000,
  12000,
  16000
];

function createAudioSystem() {

  if (audioContext) return;

  audioContext = new (
    window.AudioContext ||
    window.webkitAudioContext
  )();

  sourceNode = audioContext.createMediaElementSource(audio);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  let previousNode = sourceNode;

  frequencies.forEach(function(freq) {

    const filter = audioContext.createBiquadFilter();

    filter.type = "peaking";
    filter.frequency.value = freq;
    filter.Q.value = 1;
    filter.gain.value = 0;

    previousNode.connect(filter);

    filters.push(filter);

    previousNode = filter;
  });

  previousNode.connect(analyser);
  analyser.connect(audioContext.destination);

  startVisualizer();
}


chooseBtn.addEventListener("click", function() {
  fileInput.click();
});


fileInput.addEventListener("change", function() {

  const file = fileInput.files[0];

  if (!file) return;

  if (currentURL) {
    URL.revokeObjectURL(currentURL);
  }

  currentURL = URL.createObjectURL(file);

  audio.src = currentURL;

  songName.textContent = file.name;
  statusText.textContent = "Lagu siap diputar";

  seekBar.value = 0;
});


playBtn.addEventListener("click", async function() {

  if (!audio.src) {
    fileInput.click();
    return;
  }

  createAudioSystem();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  try {
    await audio.play();
  } catch (error) {
    statusText.textContent = "Tekan tombol Play lagi";
  }
});


stopBtn.addEventListener("click", function() {

  audio.pause();
  audio.currentTime = 0;

  statusText.textContent = "Berhenti";
  playBtn.textContent = "▶";
});


backBtn.addEventListener("click", function() {

  audio.currentTime = Math.max(
    0,
    audio.currentTime - 10
  );
});


audio.addEventListener("play", function() {

  playBtn.textContent = "❚❚";
  statusText.textContent = "Sedang diputar";
});


audio.addEventListener("pause", function() {

  playBtn.textContent = "▶";

  if (audio.currentTime > 0 && !audio.ended) {
    statusText.textContent = "Dijeda";
  }
});


audio.addEventListener("ended", function() {

  playBtn.textContent = "▶";
  statusText.textContent = "Selesai";
  seekBar.value = 0;
});


audio.addEventListener("loadedmetadata", function() {

  durationText.textContent =
    formatTime(audio.duration);
});


audio.addEventListener("timeupdate", function() {

  if (!audio.duration) return;

  const percent =
    (audio.currentTime / audio.duration) * 100;

  seekBar.value = percent;

  currentTimeText.textContent =
    formatTime(audio.currentTime);
});


seekBar.addEventListener("input", function() {

  if (!audio.duration) return;

  audio.currentTime =
    (seekBar.value / 100) * audio.duration;
});


volume.addEventListener("input", function() {

  const value = Number(volume.value);

  audio.volume = value / 100;

  volumeText.textContent =
    value + "%";
});


eqSliders.forEach(function(slider) {

  slider.addEventListener("input", function() {

    const index =
      Number(slider.dataset.index);

    const value =
      Number(slider.value);

    if (filters[index]) {
      filters[index].gain.value = value;
    }
  });

});


resetBtn.addEventListener("click", function() {

  eqSliders.forEach(function(slider, index) {

    slider.value = 0;

    if (filters[index]) {
      filters[index].gain.value = 0;
    }

  });

});


function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}


function resizeCanvas() {

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}


function startVisualizer() {

  resizeCanvas();

  const data =
    new Uint8Array(analyser.frequencyBinCount);

  function draw() {

    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(data);

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const barWidth =
      canvas.width / data.length;

    for (let i = 0; i < data.length; i++) {

      const value = data[i];

      const height =
        (value / 255) * canvas.height;

      const x =
        i * barWidth;

      const y =
        canvas.height - height;

      ctx.fillStyle =
        "rgb(" +
        (80 + value / 3) +
        ", " +
        (80 + value / 2) +
        ", 255)";

      ctx.fillRect(
        x,
        y,
        Math.max(1, barWidth - 2),
        height
      );
    }
  }

  draw();
}


window.addEventListener("resize", resizeCanvas);

audio.volume = 0.8;
volumeText.textContent = "80%";
