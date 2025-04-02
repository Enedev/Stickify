document.addEventListener('DOMContentLoaded', () => {
    const playlistContainer = document.getElementById('genrePlaylists');
    const userPlaylistsContainer = document.getElementById('userPlaylists');
    let songObjects = JSON.parse(localStorage.getItem('songObjects')) || [];
    let uploadedSongs = JSON.parse(localStorage.getItem('uploadedSongs')) || [];

    // Función para crear playlists automáticas
    const createAutoPlaylists = () => {
        const playlists = [];
        const shuffledSongs = [...uploadedSongs, ...songObjects].sort(() => 0.5 - Math.random());

        for (let i = 0; i < shuffledSongs.length; i += 10) {
            const playlistSongs = shuffledSongs.slice(i, i + 10);
            const mainGenre = getMainGenre(playlistSongs);

            playlists.push({
                name: `${mainGenre} Mix Vol. ${i / 10 + 1}`,
                songs: playlistSongs,
                cover: playlistSongs[0].artworkUrl100.replace('100x100', '300x300'),
                timestamp: new Date().toISOString()
            });
        }

        localStorage.setItem('autoPlaylists', JSON.stringify(playlists));
        return playlists;
    };

    // Función para determinar el género principal de la playlist
    const getMainGenre = (songs) => {
        const genreCount = songs.reduce((acc, song) => {
            acc[song.primaryGenreName] = (acc[song.primaryGenreName] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0][0];
    };

    // Renderizar playlists automáticas
    const renderPlaylists = (playlists) => {
        playlistContainer.innerHTML = playlists.map((playlist, index) => `
            <div class="playlist-card" data-index="${index}">
                <div class="playlist-header">
                    <img src="${playlist.cover}" class="playlist-cover">
                    <div class="playlist-info">
                        <h3>${playlist.name}</h3>
                        <p>${playlist.songs.length} canciones</p>
                        <button class="save-playlist">
                            <i class="fas fa-plus-circle"></i> Guardar
                        </button>
                    </div>
                </div>
                <div class="playlist-tracks-container">
                    <div class="playlist-tracks">
                        ${playlist.songs.map((song, idx) => `
                            <div class="track">
                                <span class="track-number">${idx + 1}.</span>
                                <img src="${song.artworkUrl100}" class="track-artwork">
                                <div class="track-info">
                                    <p class="track-title">${song.trackName}</p>
                                    <p class="track-artist">${song.artistName}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('#genrePlaylists .save-playlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlistIndex = e.target.closest('.playlist-card').dataset.index;
                savePlaylistToUser(playlists[playlistIndex]);
            });
        });
    };

    // Guardar playlist en el usuario
    const savePlaylistToUser = (playlist) => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert('Debes iniciar sesión para guardar playlists');
            return;
        }

        let playlistUser = JSON.parse(localStorage.getItem('playlistUser')) || {};
        const userPlaylists = playlistUser[user.email] || [];

        if (userPlaylists.some(p => p.name === playlist.name)) {
            alert('Ya tienes esta playlist guardada');
            return;
        }

        // Añade la propiedad 'creator' solo si la playlist fue creada por el usuario
        if (playlist.creator) {
            playlist.creator = user.username;
        } else {
            delete playlist.creator; // Asegura que no tenga 'creator' si es una playlist automática
        }

        userPlaylists.push(playlist);
        playlistUser[user.email] = userPlaylists;

        localStorage.setItem('playlistUser', JSON.stringify(playlistUser));
        alert(`Playlist "${playlist.name}" guardada con éxito!`);
    };

    const renderUserPlaylists = (playlists) => {
        userPlaylistsContainer.innerHTML = playlists.map((playlist, index) => {
            // Filtrar canciones inexistentes
            const validSongs = playlist.songs.filter(song => song);

            return `
                <div class="playlist-card" data-index="${index}">
                    <div class="playlist-header">
                        <img src="${validSongs[0]?.artworkUrl100 || 'placeholder_image.png'}" class="playlist-cover">
                        <div class="playlist-info">
                            <h3>${playlist.name}</h3>
                            <p>${validSongs.length} canciones</p>
                            <p>Creador: ${playlist.creator || 'Usuario'}</p>
                            <button class="save-playlist" data-playlist='${JSON.stringify(playlist)}'>
                                <i class="fas fa-plus-circle"></i> Guardar
                            </button>
                        </div>
                    </div>
                    <div class="playlist-tracks-container">
                        <div class="playlist-tracks">
                            ${validSongs.map((song, idx) => {
                // Verificar la existencia de la canción
                if (song) {
                    return `
                                        <div class="track">
                                            <span class="track-number">${idx + 1}.</span>
                                            <img src="${song.artworkUrl100}" class="track-artwork">
                                            <div class="track-info">
                                                <p class="track-title">${song.trackName}</p>
                                                <p class="track-artist">${song.artistName}</p>
                                            </div>
                                        </div>
                                    `;
                } else {
                    return ''; // O un mensaje de error si lo prefieres
                }
            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('#userPlaylists .save-playlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlist = JSON.parse(e.target.dataset.playlist);
                savePlaylistToUser(playlist);
            });
        });
    };

    // Crear y mostrar modal para crear playlists
    const createPlaylistButton = document.getElementById('createPlaylistButton');
    const createPlaylistModal = document.getElementById('createPlaylistModal');
    const closeModal = createPlaylistModal.querySelector('.close');
    const playlistNameInput = document.getElementById('playlistNameInput');
    const playlistSongsSelection = document.getElementById('playlistSongsSelection');
    const saveNewPlaylistButton = document.getElementById('saveNewPlaylist');

    createPlaylistButton.addEventListener('click', () => {
        createPlaylistModal.style.display = 'block';
        renderSongSelection();
    });

    closeModal.addEventListener('click', () => {
        createPlaylistModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === createPlaylistModal) {
            createPlaylistModal.style.display = 'none';
        }
    });

    const renderSongSelection = () => {
        const mergedSongs2 = [...songObjects, ...uploadedSongs];

        playlistSongsSelection.innerHTML = mergedSongs2.map(song => `
            <div class="song-selection">
                <input type="checkbox" id="${song.trackId}" value="${song.trackId}">
                <label for="${song.trackId}">
                    <img src="${song.artworkUrl100}" class="track-artwork">
                    ${song.trackName} - ${song.artistName}
                </label>
            </div>
        `).join('');
    };

    saveNewPlaylistButton.addEventListener('click', () => {
        const playlistName = playlistNameInput.value.trim();
        const mergedSongs = [...songObjects, ...uploadedSongs];

        const selectedSongs = Array.from(playlistSongsSelection.querySelectorAll('input:checked'))
            .map(input => mergedSongs.find(song => String(song.trackId) === input.value))
            .filter(song => song);


        if (playlistName && selectedSongs.length > 0) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Debes iniciar sesión para crear playlists.');
                return;
            }

            const newPlaylist = {
                name: playlistName,
                songs: selectedSongs,
                cover: selectedSongs[0].artworkUrl100.replace('100x100', '300x300'),
                timestamp: new Date().toISOString(),
                creator: currentUser.username
            };

            // Guardar la playlist creada en createdPlaylists
            saveCreatedPlaylist(newPlaylist);

            createPlaylistModal.style.display = 'none';
            playlistNameInput.value = '';
            renderUserPlaylists(getUserPlaylists());
        } else {
            alert('Por favor, ingresa un nombre y selecciona al menos una canción.');
        }
    });

    const saveCreatedPlaylist = (playlist) => {
        let createdPlaylists = JSON.parse(localStorage.getItem('createdPlaylists')) || [];
        createdPlaylists.push(playlist);
        localStorage.setItem('createdPlaylists', JSON.stringify(createdPlaylists));

        // Guardar la playlist creada tambien en playlistUser
        savePlaylistToUser(playlist);

        // Actualizar la lista de playlists del usuario
        renderUserPlaylists(getUserPlaylists());
    };

    const getUserPlaylists = (filterCurrentUser = false) => {
        const createdPlaylists = JSON.parse(localStorage.getItem('createdPlaylists')) || [];
        if (filterCurrentUser) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                return createdPlaylists.filter(playlist => playlist.creator === currentUser.username);
            }
            return [];
        }
        return createdPlaylists;
    };

    // Inicialización
    const initializePlaylists = async () => {
        if (songObjects.length === 0) {
            await fetchSongs();
            songObjects = JSON.parse(localStorage.getItem('songObjects'));
        }

        const userPlaylists = getUserPlaylists(); // Sin filtro para mostrar todas las playlists creadas
        let autoPlaylists = JSON.parse(localStorage.getItem('autoPlaylists')) || [];
        if (autoPlaylists.length === 0) {
            autoPlaylists = createAutoPlaylists();
        }

        renderPlaylists(autoPlaylists);
        renderUserPlaylists(userPlaylists);
    };

    // Función mock de fetchSongs para compatibilidad
    const fetchSongs = async () => {
        const response = await fetch('https://itunes.apple.com/search?term=music&limit=100');
        const data = await response.json();
        songObjects = data.results;
        localStorage.setItem('songObjects', JSON.stringify(songObjects));
    };

    initializePlaylists();
});