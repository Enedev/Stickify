document.addEventListener('DOMContentLoaded', () => {
  const playlistContainer = document.getElementById('genrePlaylists');
  let songData = JSON.parse(localStorage.getItem('songData')) || {};
  let songObjects = JSON.parse(localStorage.getItem('songObjects')) || [];

  // Función para crear playlists automáticas
  const createAutoPlaylists = () => {
    const playlists = [];
    const shuffledSongs = [...songObjects].sort(() => 0.5 - Math.random());

    // Crear una playlist cada 10 canciones
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

  // Renderizar playlists
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
            <div class="playlist-tracks-container"> <!-- Nuevo contenedor con scroll -->
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

    // Añadir event listeners para guardar playlists
    document.querySelectorAll('.save-playlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const playlistIndex = e.target.closest('.playlist-card').dataset.index;
        savePlaylistToUser(playlists[playlistIndex]);
      });
    });
  };

  // Guardar playlist en el usuario
  // Función para guardar playlist en playlistUser
  const savePlaylistToUser = (playlist) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      alert('Debes iniciar sesión para guardar playlists');
      return;
    }

    // Obtener o inicializar playlistUser
    let playlistUser = JSON.parse(localStorage.getItem('playlistUser')) || {};

    // Obtener playlists del usuario actual
    const userPlaylists = playlistUser[user.email] || [];

    // Evitar duplicados
    if (userPlaylists.some(p => p.name === playlist.name)) {
      alert('Ya tienes esta playlist guardada');
      return;
    }

    // Agregar nueva playlist
    userPlaylists.push(playlist);
    playlistUser[user.email] = userPlaylists;

    // Guardar en localStorage
    localStorage.setItem('playlistUser', JSON.stringify(playlistUser));
    alert(`Playlist "${playlist.name}" guardada con éxito!`);
  };
  // Inicialización
  const initializePlaylists = async () => {
    if (songObjects.length === 0) {
      await fetchSongs();
      songObjects = JSON.parse(localStorage.getItem('songObjects'));
    }

    let autoPlaylists = JSON.parse(localStorage.getItem('autoPlaylists')) || [];
    if (autoPlaylists.length === 0) {
      autoPlaylists = createAutoPlaylists();
    }

    renderPlaylists(autoPlaylists);
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