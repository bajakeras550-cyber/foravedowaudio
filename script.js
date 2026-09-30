const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");

const chooseBtn = document.getElementById("chooseBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

const songName = document.getElementById("songName");
const statusText = document.getElementById("status");

const volume = document.getElementById("volume");
const volumeText = document.getElementById("volumeText");

const resetBtn = document.getElementById("resetBtn");

const eqSliders =
  document.querySelectorAll(".eqSlider");


/* =========================
   PILIH FILE
========================= */

chooseBtn.addEventListener("click", function () {
  fileInput.click();
});


fileInput.addEventListener("change", function () {

  const file = fileInput.files[0];

  if (!file) {
    return;
  }

  const url = URL.createObjectURL(file);

  audio.src = url;

  songName.textContent = file.name;

  statusText.textContent =
    "Lagu siap diputar";

});


/* =========================
   PLAY
========================= */

playBtn.addEventListener("click", function () {

  if (!audio.src) {
    fileInput.click();
    return;
  }

  audio.play();

});


/* =========================
   PAUSE
========================= */

pauseBtn.addEventListener("click", function () {

  audio.pause();

});


/* =========================
   STOP
========================= */

stopBtn.addEventListener("click", function () {

  audio.pause();

  audio.currentTime = 0;

});


/* =========================
   VOLUME
========================= */

volume.addEventListener("input", function () {

  const value = Number(volume.value);

  audio.volume = value / 100;

  volumeText.textContent =
    value + "%";

});


/* =========================
   RESET EQ
========================= */

resetBtn.addEventListener("click", function () {

  eqSliders.forEach(function (slider) {
    slider.value = 0;
  });

});


/* =========================
   STATUS
========================= */

audio.addEventListener("play", function () {

  statusText.textContent =
    "Sedang diputar";

});


audio.addEventListener("pause", function () {

  if (audio.currentTime > 0) {
    statusText.textContent =
      "Dijeda";
  }

});


audio.addEventListener("ended", function () {

  statusText.textContent =
    "Selesai";

});


/* =========================
   DEFAULT VOLUME
========================= */

audio.volume = 0.8;
