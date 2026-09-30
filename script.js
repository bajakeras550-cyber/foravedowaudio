const audio = document.getElementById("audioPlayer");
const fileInput = document.getElementById("audioFile");

const sliders = document.querySelectorAll(".eq-band input");

const volume = document.getElementById("volume");

const flatButton = document.getElementById("flat");
const bassButton = document.getElementById("bass");
const resetButton = document.getElementById("reset");

const youtubeID = document.getElementById("youtubeID");
const loadYoutube = document.getElementById("loadYoutube");
const youtubePlayer = document.getElementById("youtubePlayer");


let audioContext;
let source;
let gainNode;

let filters = [];

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


function setupAudio() {

    if (audioContext) return;

    audioContext =
        new (window.AudioContext ||
        window.webkitAudioContext)();

    source =
        audioContext.createMediaElementSource(audio);

    gainNode =
        audioContext.createGain();

    filters = frequencies.map(freq => {

        const filter =
            audioContext.createBiquadFilter();

        filter.type = "peaking";
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;

        return filter;

    });


    source.connect(filters[0]);

    for (let i = 0; i < filters.length - 1; i++) {

        filters[i].connect(filters[i + 1]);

    }

    filters[filters.length - 1]
        .connect(gainNode);

    gainNode.connect(
        audioContext.destination
    );
}


fileInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) return;

        audio.src =
            URL.createObjectURL(file);

        setupAudio();

    }
);


audio.addEventListener(
    "play",
    function () {

        setupAudio();

        if (
            audioContext.state ===
            "suspended"
        ) {
            audioContext.resume();
        }

    }
);


sliders.forEach(
    (slider, index) => {

        slider.addEventListener(
            "input",
            function () {

                setupAudio();

                filters[index]
                    .gain.value =
                    Number(this.value);

            }
        );

    }
);


volume.addEventListener(
    "input",
    function () {

        setupAudio();

        gainNode.gain.value =
            Number(this.value);

    }
);


flatButton.addEventListener(
    "click",
    function () {

        sliders.forEach(
            (slider, index) => {

                slider.value = 0;

                if (filters[index]) {
                    filters[index]
                        .gain.value = 0;
                }

            }
        );

    }
);


resetButton.addEventListener(
    "click",
    function () {

        sliders.forEach(
            (slider, index) => {

                slider.value = 0;

                if (filters[index]) {
                    filters[index]
                        .gain.value = 0;
                }

            }
        );

        volume.value = 1;

        if (gainNode) {
            gainNode.gain.value = 1;
        }

    }
);


bassButton.addEventListener(
    "click",
    function () {

        setupAudio();

        const bassValues = [
            10,
            8,
            6,
            3,
            1,
            0,
            0,
            0,
            0,
            0
        ];

        sliders.forEach(
            (slider, index) => {

                slider.value =
                    bassValues[index];

                filters[index]
                    .gain.value =
                    bassValues[index];

            }
        );

    }
);


loadYoutube.addEventListener(
    "click",
    function () {

        const id =
            youtubeID.value.trim();

        if (!id) {
            alert(
                "Masukkan ID video YouTube!"
            );
            return;
        }

        youtubePlayer.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${encodeURIComponent(id)}"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
        `;

    }
);
