// upload.js
document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('uploadButton');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        window.location.href = 'logIn.html';
        return;
    }

    uploadButton.addEventListener('click', function (e) {
        e.preventDefault();

        const artistName = document.getElementById('artistName').value;
        const trackName = document.getElementById('trackName').value;
        const collectionName = document.getElementById('collectionName').value;
        const primaryGenreName = document.getElementById('primaryGenreName').value;
        const artworkFile = document.getElementById('artworkFile').files[0];

        if (!artworkFile || !artistName || !trackName || !collectionName || !primaryGenreName) {
            alert("Por favor completa todos los campos");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const newSong = {
                trackId: `user_${Date.now()}`, // ID único
                artistName: artistName,
                trackName: trackName,
                collectionName: collectionName,
                primaryGenreName: primaryGenreName,
                artworkUrl100: e.target.result // Imagen como Data URL
            };

            // Guardar en localStorage
            let uploadedSongs = JSON.parse(localStorage.getItem('uploadedSongs')) || [];
            uploadedSongs.push(newSong);
            localStorage.setItem('uploadedSongs', JSON.stringify(uploadedSongs));

            alert("Canción subida correctamente!");
            window.location.href = "home.html";
        };

        reader.readAsDataURL(artworkFile);
    });
});