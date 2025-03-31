// music.js

document.addEventListener("DOMContentLoaded", () => {
  const musicResults = document.getElementById("musicResults");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const pagination = document.getElementById("pagination");
  const genreFilters = document.getElementById("genreFilters");

  let currentPage = 1;
  const songsPerPage = 21;
  let songObjects = [];
  let allGenres = new Set();
  let activeGenres = new Set();

  function fetchSongs(searchTerm = "music") {
      fetch(`https://itunes.apple.com/search?term=${searchTerm}&limit=100`)
          .then((response) => response.json())
          .then((data) => {
              songObjects = data.results.map((song) => {
                  allGenres.add(song.primaryGenreName);
                  return {
                      trackId: song.trackId,
                      artistName: song.artistName,
                      trackName: song.trackName,
                      primaryGenreName: song.primaryGenreName,
                      collectionName: song.collectionName,
                      artworkUrl100: song.artworkUrl100,
                      rating: 0,
                      comments: [],
                  };
              });
              renderGenres();
              renderSongs();
              setupPagination();
              createRandomPlaylists(songObjects); // Llamada a la función de playlist
          })
          .catch((error) => console.error("Error al obtener canciones:", error));
  }

  function renderSongs() {
      musicResults.innerHTML = "";
      const start = (currentPage - 1) * songsPerPage;
      const end = start + songsPerPage;

      let filteredSongs = songObjects;

      if (activeGenres.size > 0) {
          filteredSongs = songObjects.filter((song) => activeGenres.has(song.primaryGenreName));
      }

      if (searchFunction) {
          const currentSearchTerm = searchFunction();
          filteredSongs = filteredSongs.filter(song =>
              song.artistName.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
              song.trackName.toLowerCase().includes(currentSearchTerm.toLowerCase())
          );
      }

      const songsToDisplay = filteredSongs.slice(start, end);

      songsToDisplay.forEach((song) => {
          const songContainer = document.createElement("div");
          songContainer.classList.add("song-container");

          songContainer.innerHTML = `
              <div class="song-details" style="background: #F9E6CF; padding: 10px; border-radius: 10px; margin-bottom: 15px;">
                  <img src="${song.artworkUrl100}" alt="${song.trackName}" style="max-width: 100px; height: auto; float: left; margin-right: 10px;">
                  <div class="song-info">
                      <h3>${song.artistName}</h3>
                      <p><strong>Nombre de la canción:</strong> ${song.trackName}</p>
                      <p><strong>Género:</strong> ${song.primaryGenreName}</p>
                      <p><strong>Álbum:</strong> ${song.collectionName}</p>
                  </div>
                  <div class="rating-stars" style="clear: both;">⭐⭐⭐⭐⭐</div>
              </div>
          `;

          musicResults.appendChild(songContainer);
      });
  }

  function setupPagination() {
      let filteredSongs = songObjects;

      if (activeGenres.size > 0) {
          filteredSongs = songObjects.filter((song) => activeGenres.has(song.primaryGenreName));
      }

      if (searchFunction) {
          const currentSearchTerm = searchFunction();
          filteredSongs = filteredSongs.filter(song =>
              song.artistName.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
              song.trackName.toLowerCase().includes(currentSearchTerm.toLowerCase())
          );
      }

      const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
      pagination.innerHTML = "";

      for (let i = 1; i <= totalPages; i++) {
          const pageButton = document.createElement("button");
          pageButton.textContent = i;
          pageButton.classList.add("page-button");
          pageButton.addEventListener("click", () => {
              currentPage = i;
              renderSongs();
          });

          pagination.appendChild(pageButton);
      }
  }

  function renderGenres() {
      genreFilters.innerHTML = "";
      allGenres.forEach((genre) => {
          const genreCheckbox = document.createElement("input");
          genreCheckbox.type = "checkbox";
          genreCheckbox.id = genre;
          genreCheckbox.value = genre;
          genreCheckbox.checked = activeGenres.has(genre);

          const genreLabel = document.createElement("label");
          genreLabel.textContent = genre;
          genreLabel.setAttribute("for", genre);

          const genreContainer = document.createElement("div");
          genreContainer.appendChild(genreCheckbox);
          genreContainer.appendChild(genreLabel);

          genreCheckbox.addEventListener("change", () => {
              if (genreCheckbox.checked) {
                  activeGenres.add(genre);
              } else {
                  activeGenres.delete(genre);
              }
              currentPage = 1;
              renderSongs();
              setupPagination();
          });

          genreFilters.appendChild(genreContainer);
      });
  }

  fetchSongs();

  searchButton.addEventListener("click", () => {
      fetchSongs(searchInput.value);
  });

  const searchFunction = setupSearch(searchInput, songObjects, renderSongs, setupPagination);
});