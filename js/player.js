// player
const player = document.getElementById("player");
const equalizer = document.getElementById("equalizer");
const songsBtns = document.querySelectorAll(".song");

// ecualizador
const equalizerBars = document.querySelectorAll(".equalizer-bar");
const volumeSlider = document.getElementById("volume"); // Ahora usando el ID correcto
const muteButton = document.getElementById("mute-btn");

let isMuted = false;
let equalizerInterval = null;

// Mostrar el ecualizador
function showEqualizer() {
    equalizer.classList.remove("hidden");
    equalizer.classList.add("show");
}

// Mostrar el reproductor y el ecualizador
function showPlayAndEqualizer() {
    player.classList.remove("hidden");
    player.classList.add("show");

    equalizer.classList.remove("hidden");
    equalizer.classList.add("show");
}

// Cambiar de canción
for (let i = 0; i < songsBtns.length; i++) {
    songsBtns[i].addEventListener("click", function () {
        const audioSrc = songsBtns[i].getAttribute("data-src");
        const artistName = songsBtns[i].getAttribute("data-artist");
        const songName = songsBtns[i].innerText;

        // Obtener la URL de la imagen
        const coverImage = songsBtns[i].style.backgroundImage.slice(5, -2);

        // Actualizar la información del reproductor
        document.getElementById("title").innerText = songName;
        document.getElementById("artist").innerText = artistName;
        document.getElementById("cover").src = coverImage;

        // Actualizar el fondo del reproductor
        document.getElementById("background").style.backgroundImage = `url('${coverImage}')`;

        // Mostrar el reproductor y el ecualizador
        showPlayAndEqualizer();

        // Cambiar la canción
        currentSongIndex = i;
        changeSong(currentSongIndex);
    });
}

// Índice de la canción actual
let currentSongIndex = 0;

// Convertir los botones en un array para indexarlos
const songs = Array.from(songsBtns);

// Variable para la canción en reproducción
let sound = null;

// Estado de la reproducción (true = en reproducción, false = pausada)
let isPlaying = false;

// Cambiar de canción
function changeSong(index) {
    const songBtn = songs[index];
    const audioSrc = songBtn.getAttribute("data-src");
    const artistName = songBtn.getAttribute("data-artist");
    const songName = songBtn.innerText;
    const coverImage = songBtn.style.backgroundImage.slice(5, -2);

    // Actualizamos la información del reproductor
    document.getElementById("title").innerText = songName;
    document.getElementById("artist").innerText = artistName;
    document.getElementById("cover").src = coverImage;
    document.getElementById("background").style.backgroundImage = `url('${coverImage}')`;

    // Detener la canción anterior si está reproduciéndose
    if (sound) {
        sound.stop();
    }

    // Crear el objeto Howl para la nueva canción
    sound = new Howl({
        src: [audioSrc],
        html5: true,
        volume: 1.0,
        onplay: function () {
            // Mostrar el ecualizador cuando empiece a reproducirse
            showEqualizer();
            isPlaying = true;
            document.getElementById("play").innerText = "||";

            // Iniciar el análisis de audio
            startEqualizerAnalysis();
        },
        onend: function () {
            // Avanzar a la siguiente canción cuando termine
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            changeSong(currentSongIndex);
        }
    });

    // Reproducir la canción
    sound.play();
}

// Función para iniciar el análisis del ecualizador
function startEqualizerAnalysis() {
    if (equalizerInterval) {
        clearInterval(equalizerInterval);
    }

    // Crear el contexto de audio y el analizador
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(sound._sounds[0]._node);

    // Conectar el analizador al contexto
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Establecer el tamaño del FFT (Fast Fourier Transform)
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    equalizerInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);

        // Actualizar las barras del ecualizador en función de las frecuencias
        for (let i = 0; i < equalizerBars.length; i++) {
            const bar = equalizerBars[i];
            const height = dataArray[i] || 0;
            bar.style.height = `${height}px`;
        }
    }, 100);
}

// Evento para el botón "play/pause" (▶ ||)
document.getElementById("play").addEventListener("click", function () {
    if (isPlaying) {
        sound.pause();
        isPlaying = false;
        document.getElementById("play").innerText = "▶";
    } else {
        sound.play();
        isPlaying = true;
        document.getElementById("play").innerText = "||";
    }
});

// Botón para la canción anterior
document.getElementById("prev").addEventListener("click", function () {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    changeSong(currentSongIndex);
});

// Botón para la canción siguiente
document.getElementById("next").addEventListener("click", function () {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    changeSong(currentSongIndex);
});

// Evento para el control de volumen
volumeSlider.addEventListener("input", function () {
    const volume = volumeSlider.value; // Ya es un valor entre 0 y 1
    sound.volume(volume);
    isMuted = false;
    muteButton.innerText = "🔊"; // Volver al ícono de volumen
});

// Evento para el botón de mute
muteButton.addEventListener("click", function () {
    if (isMuted) {
        sound.volume(volumeSlider.value); // Restaurar el volumen anterior
        isMuted = false;
        muteButton.innerText = "🔊"; // Volver al ícono de volumen
    } else {
        sound.volume(0); // Silenciar el sonido
        isMuted = true;
        muteButton.innerText = "🔇"; // Ícono de mute
    }
});

// Función para actualizar la barra de progreso
function updateSeekbar() {
    const seekbar = document.getElementById("seekbar");

    const interval = setInterval(function () {
        if (sound && isPlaying) {
            const currentTime = sound.seek();
            const duration = sound.duration();
            seekbar.value = (currentTime / duration) * 100;

            if (currentTime >= duration) {
                clearInterval(interval);
            }
        }
    }, 100);
}

// Función para interactuar con la barra de progreso (cuando el usuario la mueve)
document.getElementById("seekbar").addEventListener("input", function () {
    if (sound) {
        const seekbar = document.getElementById("seekbar");
        const newTime = (seekbar.value / 100) * sound.duration();
        sound.seek(newTime);
    }
});

changeSong(currentSongIndex);
