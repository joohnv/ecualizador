document.addEventListener('DOMContentLoaded', function () {
    // Obtener el reproductor y las estaciones
    const player = document.getElementById("player");
    const stationBtns = document.querySelectorAll(".station");
    const audio = new Audio();
    let currentStation = null;

    // Función para actualizar el reproductor
    function updatePlayer(station) {
        document.getElementById("title").innerText = station.dataset.name;
        // Extraemos la URL de la imagen de fondo correctamente
        let coverImage = station.style.backgroundImage.slice(5, -2); 
        document.getElementById("cover").src = coverImage;
        document.getElementById("background").style.backgroundImage = `url(${coverImage})`;

        // Reproducir la estación seleccionada
        audio.src = station.dataset.src;
        audio.play();
        player.classList.remove("hidden");
    }

    // Asignamos el evento a cada botón de estación
    stationBtns.forEach(function (button) {
        button.addEventListener("click", function () {
            if (currentStation === button) {
                // Si ya está reproduciendo esta estación, detenerla
                audio.pause();
                player.classList.add("hidden");
            } else {
                // Reproducir la nueva estación
                updatePlayer(button);
                currentStation = button;
            }
        });
    });

    // Control de reproducción (play/pause)
    document.getElementById("play").addEventListener("click", function () {
        if (audio.paused) {
            audio.play();
            this.innerText = "❚❚"; 
        } else {
            audio.pause();
            this.innerText = "▶"; 
        }
    });

    // Control de la canción anterior
    document.getElementById("prev").addEventListener("click", function () {
        let prevStation = stationBtns[stationBtns.length - 1];
        updatePlayer(prevStation);
    });

    // Control de la canción siguiente
    document.getElementById("next").addEventListener("click", function () {
        let nextStation = stationBtns[0];
        updatePlayer(nextStation);
    });

    // Función para actualizar la barra de progreso
    function updateSeekbar() {
        const seekbar = document.getElementById("seekbar");

        setInterval(function () {
            if (audio && !audio.paused) {
                const currentTime = audio.currentTime;
                const duration = audio.duration;
                seekbar.value = (currentTime / duration) * 100;
            }
        }, 100);
    }

    // Evento para la barra de progreso
    document.getElementById("seekbar").addEventListener("input", function () {
        const seekbar = document.getElementById("seekbar");
        const newTime = (seekbar.value / 100) * audio.duration;
        audio.currentTime = newTime;
    });
    
    // Inicia el seguimiento de la barra de progreso
    updateSeekbar(); 
});
