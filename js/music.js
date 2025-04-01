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

    let songData = JSON.parse(localStorage.getItem('songData')) || {};

    function saveSongData() {
        localStorage.setItem('songData', JSON.stringify(songData));
    }

    function fetchSongs(searchTerm = "music") {
        fetch(`https://itunes.apple.com/search?term=${searchTerm}&limit=100`)
            .then((response) => response.json())
            .then((data) => {
                songObjects = data.results.map((song) => {
                    allGenres.add(song.primaryGenreName);
                    if (!songData[song.trackId]) {
                        songData[song.trackId] = {
                            ratings: {},
                            comments: []
                        };
                    }
                    return {
                        trackId: song.trackId,
                        artistName: song.artistName,
                        trackName: song.trackName,
                        primaryGenreName: song.primaryGenreName,
                        collectionName: song.collectionName,
                        artworkUrl100: song.artworkUrl100,
                    };
                });
                renderGenres();
                renderSongs();
                setupPagination();
                saveSongData();
            })
            .catch((error) => console.error("Error al obtener canciones:", error));
    }

    function renderSongs() {
        musicResults.innerHTML = "";
        const start = (currentPage - 1) * songsPerPage;
        const end = start + songsPerPage;

        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

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

            const stars = Array(5).fill().map((_, index) => `
                <span class="star" data-rating="${index + 1}"
                    style="color: ${songData[song.trackId].ratings[currentUser.email] && index < songData[song.trackId].ratings[currentUser.email] ? '#FFD700' : '#ccc'};
                    cursor: pointer; font-size: 1.5em;">
                    ★
                </span>
            `).join('');

            songContainer.innerHTML = `
                <div class="song-details" style="background: #F9E6CF; padding: 10px; border-radius: 10px; margin-bottom: 15px;">
                    <img src="${song.artworkUrl100}" alt="${song.trackName}"
                        style="max-width: 100px; height: auto; float: left; margin-right: 10px; cursor: pointer;" data-trackid="${song.trackId}">
                    <div class="song-info">
                        <h3>${song.artistName}</h3>
                        <p><strong>Nombre de la canción:</strong> ${song.trackName}</p>
                        <p><strong>Género:</strong> ${song.primaryGenreName}</p>
                        <p><strong>Álbum:</strong> ${song.collectionName}</p>
                    </div>
                </div>
            `;

            songContainer.querySelector('img').addEventListener('click', () => {
                openModal(song.trackId);
            });

            musicResults.appendChild(songContainer);
        });
    }

    function openModal(trackId) {
        const modal = document.getElementById('songModal');
        const modalSongDetails = document.getElementById('modalSongDetails');
        const modalRatings = document.getElementById('modalRatings');
        const modalComments = document.getElementById('modalComments');
        const newCommentInput = document.getElementById('newComment');
        const submitCommentButton = document.getElementById('submitComment');

        const song = songObjects.find(s => s.trackId === trackId);
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

        modalSongDetails.innerHTML = `
            <img src="${song.artworkUrl100}" alt="${song.trackName}" style="max-width: 100px; height: auto; float: left; margin-right: 10px;">
            <h3>${song.artistName} - ${song.trackName}</h3>
            <p><strong>Género:</strong> ${song.primaryGenreName}</p>
            <p><strong>Álbum:</strong> ${song.collectionName}</p>
        `;

        const stars = Array(5).fill().map((_, index) => `
            <span class="star" data-rating="${index + 1}"
                style="color: ${songData[trackId].ratings[currentUser.email] && index < songData[trackId].ratings[currentUser.email] ? '#FFD700' : '#ccc'};
                cursor: pointer; font-size: 1.5em;">
                ★
            </span>
        `).join('');

        modalRatings.innerHTML = `<div class="rating-stars">${stars}</div>`;

        modalComments.innerHTML = songData[trackId].comments.map(comment => `
            <div class="comment">
                <p>${comment.text}</p>
                <small>${comment.user} - ${new Date(comment.date).toLocaleDateString()}</small>
            </div>
        `).join('');

        modal.style.display = "block";

        modalRatings.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                if (!currentUser.email) {
                    alert('Debes iniciar sesión para votar');
                    return;
                }
                const rating = parseInt(e.target.dataset.rating);
                songData[trackId].ratings[currentUser.email] = rating;

                // Guardar la calificación en ratingCommentsUsers
                let ratingCommentsUsers = JSON.parse(localStorage.getItem('ratingCommentsUsers')) || {};
                ratingCommentsUsers[currentUser.email] = ratingCommentsUsers[currentUser.email] || {};
                ratingCommentsUsers[currentUser.email].ratings = ratingCommentsUsers[currentUser.email].ratings || {};
                ratingCommentsUsers[currentUser.email].ratings[trackId] = rating;
                localStorage.setItem('ratingCommentsUsers', JSON.stringify(ratingCommentsUsers));

                saveSongData();
                openModal(trackId);
            });
        });

        submitCommentButton.onclick = () => {
            if (!currentUser.email) {
                alert('Debes iniciar sesión para comentar');
                return;
            }
            const commentText = newCommentInput.value.trim();
            if (commentText) {
                const newComment = {
                    user: currentUser.username,
                    text: commentText,
                    date: new Date().toISOString()
                };

                songData[trackId].comments.push(newComment);

                // Guardar el comentario en ratingCommentsUsers
                let ratingCommentsUsers = JSON.parse(localStorage.getItem('ratingCommentsUsers')) || {};
                ratingCommentsUsers[currentUser.email] = ratingCommentsUsers[currentUser.email] || {};
                ratingCommentsUsers[currentUser.email].comments = ratingCommentsUsers[currentUser.email].comments || {};
                ratingCommentsUsers[currentUser.email].comments[trackId] = ratingCommentsUsers[currentUser.email].comments[trackId] || [];
                ratingCommentsUsers[currentUser.email].comments[trackId].push(newComment);
                localStorage.setItem('ratingCommentsUsers', JSON.stringify(ratingCommentsUsers));

                saveSongData();
                openModal(trackId);
                newCommentInput.value = '';
            }
        };


        modal.querySelector('.close').onclick = () => {
            modal.style.display = "none";
        };
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