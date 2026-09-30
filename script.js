const audio = document.getElementById("audio");
const audioFile = document.getElementById("audioFile");

const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");

const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const trackName = document.getElementById("trackName");
const trackMeta = document.getElementById("trackMeta");

const volume = document.getElementById("volume");
const masterVolume = document.getElementById("masterVolume");

const volumeValue = document.getElementById("volumeValue");

const bassBoost = document.getElementById("bassBoost");
const bassValue = document.getElementById("bassValue");

const treble = document.getElementById("treble");
const trebleValue = document.getElementById("trebleValue");

const eqContainer = document.getElementById("eqContainer");

const visualizer = document.getElementById("visualizer");
const canvasCtx = visualizer.getContext("2d");


/* =========================
   AUDIO ENGINE
========================= */

let audioContext;
let sourceNode;
let analyser;
let masterGain;

let eqFilters = [];

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

const defaultEQ = [
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0
];


function createAudioEngine() {

  if (audioContext) return;

  audioContext =
    new (window.AudioContext || window.webkitAudioContext)();

  sourceNode = audioContext.createMediaElementSource(audio);

  analyser = audioContext.createAnalyser();

  masterGain = audioContext.createGain();

  analyser.fftSize = 256;

  /*
    10-band EQ
  */

  frequencies.forEach((frequency, index) => {

    const filter =
      audioContext.createBiquadFilter();

    filter.type = "peaking";

    filter.frequency.value = frequency;

    filter.Q.value = 1.1;

    filter.gain.value = 0;

    eqFilters.push(filter);

    if (index === 0) {
      sourceNode.connect(filter);
    } else {
      eqFilters[index - 1].connect(filter);
    }

  });

  eqFilters[eqFilters.length - 1]
    .connect(analyser);

  analyser.connect(masterGain);

  masterGain.connect(
    audioContext.destination
  );

  masterGain.gain.value =
    Number(masterVolume.value) / 100;
}


/* =========================
   EQ UI
========================= */

function createEQ() {

  frequencies.forEach((frequency, index) => {

    const band = document.createElement("div");

    band.className = "eq-band";

    band.innerHTML = `
      <span class="eq-value" id="eqValue${index}">
        0 dB
      </span>

      <input
        class="eq-slider"
        id="eq${index}"
        type="range"
        min="-12"
        max="12"
        value="0"
        step="1"
      >
    `;

    eqContainer.appendChild(band);

    const slider =
      band.querySelector(".eq-slider");

    slider.addEventListener("input", () => {

      const value = Number(slider.value);

      document.getElementById(
        `eqValue${index}`
      ).textContent = `${value} dB`;

      if (eqFilters[index]) {
        eqFilters[index].gain.value = value;
      }

    });

  });

}

createEQ();


/* =========================
   FILE IMPORT
========================= */

function openFilePicker() {
  audioFile.click();
}

document
  .getElementById("uploadBtn")
  .addEventListener("click", openFilePicker);

document
  .getElementById("uploadTop")
  .addEventListener("click", openFilePicker);


audioFile.addEventListener("change", () => {

  const file = audioFile.files[0];

  if (!file) return;

  createAudioEngine();

  const url =
    URL.createObjectURL(file);

  audio.src = url;

  trackName.textContent =
    file.name.replace(/\.[^/.]+$/, "");

  trackMeta.textContent =
    `${file.type || "Audio"} • ${formatBytes(file.size)}`;

  audio.load();

  audioContext.resume();

});


/* =========================
   PLAY / PAUSE
========================= */

playBtn.addEventListener("click", async () => {

  if (!audio.src) {
    openFilePicker();
    return;
  }

  createAudioEngine();

  await audioContext.resume();

  if (audio.paused) {

    await audio.play();

    playBtn.textContent = "Ⅱ";

  } else {

    audio.pause();

    playBtn.textContent = "▶";

  }

});


/* =========================
   TIME
========================= */

audio.addEventListener("loadedmetadata", () => {

  durationEl.textContent =
    formatTime(audio.duration);

});


audio.addEventListener("timeupdate", () => {

  if (!audio.duration) return;

  progress.value =
    (audio.currentTime / audio.duration) * 100;

  currentTimeEl.textContent =
    formatTime(audio.currentTime);

});


audio.addEventListener("ended", () => {

  playBtn.textContent = "▶";

  progress.value = 0;

});


progress.addEventListener("input", () => {

  if (!audio.duration) return;

  audio.currentTime =
    (progress.value / 100) * audio.duration;

});


/* =========================
   VOLUME
========================= */

function updateVolume(value) {

  const percent = Number(value);

  volumeValue.textContent =
    `${percent}%`;

  volume.value = percent;

  if (masterGain) {
    masterGain.gain.value =
      percent / 100;
  }

}


volume.addEventListener("input", () => {
  updateVolume(volume.value);
});


masterVolume.addEventListener("input", () => {
  updateVolume(masterVolume.value);
});


/* =========================
   BASS BOOST
========================= */

bassBoost.addEventListener("input", () => {

  const value = Number(bassBoost.value);

  bassValue.textContent =
    `+${value} dB`;

  if (eqFilters[0]) {
    eqFilters[0].gain.value = value;
  }

  if (eqFilters[1]) {
    eqFilters[1].gain.value = value;
  }

});


/* =========================
   TREBLE
========================= */

treble.addEventListener("input", () => {

  const value = Number(treble.value);

  trebleValue.textContent =
    `${value >= 0 ? "+" : ""}${value} dB`;

  if (eqFilters[8]) {
    eqFilters[8].gain.value = value;
  }

  if (eqFilters[9]) {
    eqFilters[9].gain.value = value;
  }

});


/* =========================
   PRESETS
========================= */

const presets = {

  flat: [
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0
  ],

  bass: [
    7, 6, 5, 2, 0,
    -1, -1, 0, 1, 2
  ],

  vocal: [
    -2, -2, -1, 2, 5,
    5, 3, 1, 0, -1
  ],

  rock: [
    5, 4, 2, -1, -2,
    2, 4, 5, 4, 3
  ],

  electronic: [
    6, 5, 2, -2, -1,
    2, 4, 5, 6, 6
  ]

};


document
  .querySelectorAll(".preset")
  .forEach(button => {

    button.addEventListener("click", () => {

      const name =
        button.dataset.preset;

      const values =
        presets[name];

      values.forEach((value, index) => {

        const slider =
          document.getElementById(
            `eq${index}`
          );

        const valueLabel =
          document.getElementById(
            `eqValue${index}`
          );

        slider.value = value;

        valueLabel.textContent =
          `${value > 0 ? "+" : ""}${value} dB`;

        if (eqFilters[index]) {
          eqFilters[index].gain.value =
            value;
        }

      });

      document
        .querySelectorAll(".preset")
        .forEach(p =>
          p.classList.remove("active")
        );

      button.classList.add("active");

    });

  });


/* =========================
   RESET EQ
========================= */

document
  .getElementById("resetEq")
  .addEventListener("click", () => {

    defaultEQ.forEach((value, index) => {

      const slider =
        document.getElementById(
          `eq${index}`
        );

      const valueLabel =
        document.getElementById(
          `eqValue${index}`
        );

      slider.value = value;

      valueLabel.textContent =
        "0 dB";

      if (eqFilters[index]) {
        eqFilters[index].gain.value = 0;
      }

    });

    bassBoost.value = 0;
    bassValue.textContent = "0 dB";

    treble.value = 0;
    trebleValue.textContent = "0 dB";

  });


/* =========================
   BACK / FORWARD
========================= */

document
  .getElementById("backBtn")
  .addEventListener("click", () => {

    audio.currentTime =
      Math.max(0, audio.currentTime - 10);

  });


document
  .getElementById("forwardBtn")
  .addEventListener("click", () => {

    audio.currentTime =
      Math.min(
        audio.duration || 0,
        audio.currentTime + 10
      );

  });


/* =========================
   VISUALIZER
========================= */

function drawVisualizer() {

  requestAnimationFrame(
    drawVisualizer
  );

  const width =
    visualizer.clientWidth;

  const height =
    visualizer.clientHeight;

  const dpr =
    window.devicePixelRatio || 1;

  visualizer.width =
    width * dpr;

  visualizer.height =
    height * dpr;

  canvasCtx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  canvasCtx.clearRect(
    0,
    0,
    width,
    height
  );

  if (!analyser) {

    drawIdleBars(width, height);

    return;
  }

  const data =
    new Uint8Array(
      analyser.frequencyBinCount
    );

  analyser.getByteFrequencyData(data);

  const bars = 48;

  const gap = 4;

  const barWidth =
    (width - gap * bars) / bars;

  for (let i = 0; i < bars; i++) {

    const index =
      Math.floor(
        i * data.length / bars
      );

    const value =
      data[index] / 255;

    const barHeight =
      Math.max(
        4,
        value * height * .9
      );

    const x =
      i * (barWidth + gap);

    const y =
      height - barHeight;

    const gradient =
      canvasCtx.createLinearGradient(
        0,
        y,
        0,
        height
      );

    gradient.addColorStop(
      0,
      "#22d3ee"
    );

    gradient.addColorStop(
      1,
      "#8b5cf6"
    );

    canvasCtx.fillStyle =
      gradient;

    canvasCtx.beginPath();

    canvasCtx.roundRect(
      x,
      y,
      barWidth,
      barHeight,
      4
    );

    canvasCtx.fill();

  }

}


function drawIdleBars(width, height) {

  const bars = 48;

  const gap = 4;

  const barWidth =
    (width - gap * bars) / bars;

  for (let i = 0; i < bars; i++) {

    const x =
      i * (barWidth + gap);

    const barHeight =
      5 + Math.sin(i * .6) * 4;

    canvasCtx.fillStyle =
      "rgba(139,92,246,.25)";

    canvasCtx.fillRect(
      x,
      height - barHeight,
      barWidth,
      barHeight
    );

  }

}

drawVisualizer();


/* =========================
   THEME
========================= */

document
  .getElementById("themeBtn")
  .addEventListener("click", () => {

    document.body.classList.toggle(
      "light"
    );

  });


/* =========================
   HELPERS
========================= */

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const min =
    Math.floor(seconds / 60);

  const sec =
    Math.floor(seconds % 60);

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

}


function formatBytes(bytes) {

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

        }
