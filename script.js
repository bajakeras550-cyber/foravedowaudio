const audio = document.getElementById("audioPlayer");
const fileInput = document.getElementById("audioFile");

const playButton = document.getElementById("playButton");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const trackName = document.getElementById("trackName");
const trackArtist = document.getElementById("trackArtist");

const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");

const sliders =
    document.querySelectorAll(".eq-band input");

const outputs =
    document.querySelectorAll(".eq-band output");

const preset =
    document.getElementById("preset");

const youtubePanel =
    document.getElementById("youtubePanel");

const youtubeOpen =
    document.getElementById("youtubeOpen");

const closeYoutube =
    document.getElementById("closeYoutube");

const youtubeID =
    document.getElementById("youtubeID");

const loadYoutube =
    document.getElementById("loadYoutube");

const youtubePlayer =
    document.getElementById("youtubePlayer");

const canvas =
    document.getElementById("visualizer");

const ctx =
    canvas.getContext("2d");


let audioContext = null;
let source = null;
let gainNode = null;
let analyser = null;
let filters = [];

let audioReady = false;

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


const presets = {

    flat: [
        0,0,0,0,0,
        0,0,0,0,0
    ],

    bass: [
        10,8,6,3,1,
        0,0,0,0,0
    ],

    vocal: [
        -2,-1,0,3,6,
        7,5,2,0,-1
    ],

    rock: [
        5,3,-1,-2,1,
        4,6,5,3,2
    ],

    electronic: [
        7,5,2,0,-2,
        2,5,7,6,5
    ]

};


function setupAudio() {

    if (audioReady) return;

    audioContext =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    source =
        audioContext.createMediaElementSource(audio);

    gainNode =
        audioContext.createGain();

    analyser =
        audioContext.createAnalyser();

    analyser.fftSize = 256;

    filters =
        frequencies.map(freq => {

            const filter =
                audioContext.createBiquadFilter();

            filter.type = "peaking";

            filter.frequency.value = freq;

            filter.Q.value = 1;

            filter.gain.value = 0;

            return filter;

        });


    source.connect(filters[0]);


    for (
        let i = 0;
        i < filters.length - 1;
        i++
    ) {

        filters[i]
            .connect(filters[i + 1]);

    }


    filters[filters.length - 1]
        .connect(gainNode);


    gainNode.connect(analyser);

    analyser.connect(
        audioContext.destination
    );


    gainNode.gain.value =
        Number(volume.value);


    audioReady = true;

    drawVisualizer();
}


function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return (
        String(minutes).padStart(2,"0")
        + ":" +
        String(secs).padStart(2,"0")
    );
}


/* FILE */

fileInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) return;

        audio.src =
            URL.createObjectURL(file);

        trackName.textContent =
            file.name.replace(
                /\.[^/.]+$/,
                ""
            );

        trackArtist.textContent =
            "Local Audio";

        setupAudio();

        audio.load();

        audio.play();

    }
);


/* PLAY */

playButton.addEventListener(
    "click",
    function () {

        if (!audio.src) return;

        setupAudio();

        if (
            audioContext.state ===
            "suspended"
        ) {
            audioContext.resume();
        }

        if (audio.paused) {

            audio.play();

        } else {

            audio.pause();

        }

    }
);


audio.addEventListener(
    "play",
    function () {

        playButton.textContent = "Ⅱ";

    }
);


audio.addEventListener(
    "pause",
    function () {

        playButton.textContent = "▶";

    }
);


/* TIME */

audio.addEventListener(
    "loadedmetadata",
    function () {

        duration.textContent =
            formatTime(audio.duration);

    }
);


audio.addEventListener(
    "timeupdate",
    function () {

        if (!audio.duration) return;

        progress.value =
            (audio.currentTime /
            audio.duration) * 100;

        currentTime.textContent =
            formatTime(audio.currentTime);

    }
);


progress.addEventListener(
    "input",
    function () {

        if (!audio.duration) return;

        audio.currentTime =
            (Number(this.value) / 100)
            * audio.duration;

    }
);


/* VOLUME */

volume.addEventListener(
    "input",
    function () {

        setupAudio();

        gainNode.gain.value =
            Number(this.value);

        volumeValue.textContent =
            Math.round(
                Number(this.value) * 100
            ) + "%";

    }
);


/* EQ */

sliders.forEach(
    (slider,index) => {

        slider.addEventListener(
            "input",
            function () {

                setupAudio();

                const value =
                    Number(this.value);

                filters[index]
                    .gain.value = value;

                outputs[index]
                    .textContent =
                    value > 0
                        ? "+" + value
                        : value;

            }
        );

    }
);


/* APPLY PRESET */

function applyPreset(name) {

    setupAudio();

    const values =
        presets[name];

    if (!values) return;

    sliders.forEach(
        (slider,index) => {

            slider.value =
                values[index];

            filters[index]
                .gain.value =
                values[index];

            outputs[index]
                .textContent =
                values[index] > 0
                    ? "+" + values[index]
                    : values[index];

        }
    );

    preset.value = name;
}


preset.addEventListener(
    "change",
    function () {

        applyPreset(this.value);

    }
);


/* QUICK BUTTONS */

document
.querySelectorAll("[data-profile]")
.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            applyPreset(
                this.dataset.profile
            );

        }
    );

});


/* VISUALIZER */

function resizeCanvas() {

    canvas.width =
        canvas.clientWidth *
        window.devicePixelRatio;

    canvas.height =
        canvas.clientHeight *
        window.devicePixelRatio;

    ctx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio
    );

}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


function drawVisualizer() {

    requestAnimationFrame(
        drawVisualizer
    );

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (!analyser) return;


    const data =
        new Uint8Array(
            analyser.frequencyBinCount
        );

    analyser.getByteFrequencyData(data);


    const bars = 64;

    const gap = 3;

    const barWidth =
        (width / bars) - gap;


    for (
        let i = 0;
        i < bars;
        i++
    ) {

        const index =
            Math.floor(
                i *
                data.length /
                bars
            );

        const value =
            data[index] / 255;

        const barHeight =
            Math.max(
                3,
                value * height
            );


        const x =
            i * (barWidth + gap);

        const y =
            height - barHeight;


        const gradient =
            ctx.createLinearGradient(
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
            .5,
            "#8b5cf6"
        );

        gradient.addColorStop(
            1,
            "#6366f1"
        );


        ctx.fillStyle =
            gradient;


        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            barWidth,
            barHeight,
            3
        );

        ctx.fill();

    }

}


/* YOUTUBE PANEL */

youtubeOpen.addEventListener(
    "click",
    function () {

        youtubePanel.classList.add(
            "show"
        );

        youtubePanel.scrollIntoView({
            behavior: "smooth"
        });

    }
);


closeYoutube.addEventListener(
    "click",
    function () {

        youtubePanel.classList.remove(
            "show"
        );

    }
);


/* YOUTUBE */

loadYoutube.addEventListener(
    "click",
    function () {

        const id =
            youtubeID.value.trim();

        if (!id) return;

        youtubePlayer.innerHTML = `

            <iframe
                src="https://www.youtube.com/embed/${encodeURIComponent(id)}"
                title="YouTube Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>

        `;

    }
);


/* BACK / FORWARD */

document
.getElementById("backButton")
.addEventListener(
    "click",
    function () {

        audio.currentTime =
            Math.max(
                0,
                audio.currentTime - 10
            );

    }
);


document
.getElementById("forwardButton")
.addEventListener(
    "click",
    function () {

        audio.currentTime =
            Math.min(
                audio.duration || 0,
                audio.currentTime + 10
            );

    }
);


/* THEME */

document
.getElementById("themeButton")
.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "bright"
        );

    }
);
