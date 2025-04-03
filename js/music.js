document.addEventListener("DOMContentLoaded", () => {
    const musicResults = document.getElementById("musicResults");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const pagination = document.getElementById("pagination");
    const genreToggle = document.getElementById("genreToggle");
    const genreFilters = document.getElementById("genreFilters");
    const dateToggle = document.getElementById("dateToggle");
    const dateFilters = document.getElementById("dateFilters");
    const dateInput = document.getElementById("dateInput");
    const applyDateFilter = document.getElementById("applyDateFilter");
    const artistToggle = document.getElementById("artistToggle");
    const artistFilters = document.getElementById("artistFilters");

    let currentPage = 1;
    const songsPerPage = 21;
    let songObjects = [];
    let allGenres = new Set();
    let activeGenres = new Set();
    let allArtists = new Set();
    let activeArtists = new Set();
    let activeFilters = {
        genre: new Set(),
        date: null,
        artist: new Set()
    };

    let songData = JSON.parse(localStorage.getItem('songData')) || {};

    songObjects = JSON.parse(localStorage.getItem('songObjects')) || [];

    function saveSongData() {
        localStorage.setItem('songData', JSON.stringify(songData));
    }

    function fetchSongs(searchTerm = "music") {
        return fetch(`https://itunes.apple.com/search?term=${searchTerm}&limit=100`)
            .then((response) => response.json())
            .then((data) => {
                const apiSongs = data.results.map((song) => {
                    if (!songData[song.trackId]) {
                        songData[song.trackId] = { ratings: {}, comments: [] };
                    }
                    return {
                        trackId: song.trackId,
                        artistName: song.artistName,
                        trackName: song.trackName,
                        primaryGenreName: song.primaryGenreName,
                        collectionName: song.collectionName,
                        artworkUrl100: song.artworkUrl100,
                        releaseDate: song.releaseDate,
                        isUserUpload: false
                    };
                });

                const uploadedSongs = JSON.parse(localStorage.getItem('uploadedSongs')) || [];
                uploadedSongs.forEach(song => {
                    if (!songData[song.trackId]) {
                        songData[song.trackId] = { ratings: {}, comments: [] };
                    }
                });

                songObjects = [...apiSongs, ...uploadedSongs.map(song => ({ ...song, isUserUpload: true }))];

                allGenres.clear();
                allArtists.clear();
                songObjects.forEach(song => {
                    allGenres.add(song.primaryGenreName);
                    allArtists.add(song.artistName);
                });

                renderGenres();
                renderArtists();
                renderSongs();
                setupPagination();
                saveSongData();

                renderTopRatedSongs();
            })
            .catch((error) => console.error("Error:", error));
    }

    function renderSongs() {
        musicResults.innerHTML = "";
        const start = (currentPage - 1) * songsPerPage;
        const end = start + songsPerPage;

        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

        let filteredSongs = songObjects.filter(song => {
            let genreFilter = activeFilters.genre.size === 0 || activeFilters.genre.has(song.primaryGenreName);
            let dateFilter = !activeFilters.date || (song.releaseDate && song.releaseDate.startsWith(activeFilters.date));
            let artistFilter = activeFilters.artist.size === 0 || activeFilters.artist.has(song.artistName);
            return genreFilter && dateFilter && artistFilter;
        });

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

            let averageRating = 0;
            if (songData[song.trackId] && songData[song.trackId].ratings) {
                const ratings = Object.values(songData[song.trackId].ratings);
                if (ratings.length > 0) {
                    averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
                }
            }

            const stars = Array(5).fill().map((_, index) => `
                <span class="star" data-rating="${index + 1}"
                    style="color: ${songData[song.trackId].ratings[currentUser.email] && index < songData[song.trackId].ratings[currentUser.email] ? '#FFD700' : '#ccc'};
                    cursor: pointer; font-size: 1.5em;">
                    ★
                </span>
            `).join('');

            songContainer.innerHTML = `
                <div class="song-container">
                    <div class="song-details">
                        <div class="img-container">
                            <img src="${song.artworkUrl100}" alt="${song.trackName}" data-trackid="${song.trackId}">
                        </div>
                        <div class="song-info">
                            <h3>${song.artistName}</h3>
                            <p><strong>Canción</strong> ${song.trackName}</p>
                            <p><strong>Género</strong> ${song.primaryGenreName}</p>
                            <p><strong>Álbum</strong> ${song.collectionName}</p>
                            ${song.releaseDate ? `
                                <p><strong>Lanzamiento</strong> 
                                    ${new Date(song.releaseDate).toLocaleDateString('en-CA', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    })}
                                </p>` 
                                : ''}
                            <div class="rating-stars">
                            ${Array(Math.round(averageRating)).fill('<span class="star">★</span>').join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            songContainer.querySelector('.song-details').addEventListener('click', () => {
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

                let ratingCommentsUsers = JSON.parse(localStorage.getItem('ratingCommentsUsers')) || {};
                ratingCommentsUsers[currentUser.email] = ratingCommentsUsers[currentUser.email] || {};
                ratingCommentsUsers[currentUser.email].ratings = ratingCommentsUsers[currentUser.email].ratings || {};
                ratingCommentsUsers[currentUser.email].ratings[trackId] = rating;
                localStorage.setItem('ratingCommentsUsers', JSON.stringify(ratingCommentsUsers));

                saveSongData();
                openModal(trackId);
                renderSongs();
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Si el clic fue en el fondo oscuro
                modal.style.display = "none";
            }
        });        

        modal.querySelector('.close').onclick = () => {
            modal.style.display = "none";
        };
    }

    function setupPagination() {
        let filteredSongs = songObjects.filter(song => {
            let genreFilter = activeFilters.genre.size === 0 || activeFilters.genre.has(song.primaryGenreName);
            let dateFilter = !activeFilters.date || (song.releaseDate && song.releaseDate.startsWith(activeFilters.date));
            let artistFilter = activeFilters.artist.size === 0 || activeFilters.artist.has(song.artistName);
            return genreFilter && dateFilter && artistFilter;
        });

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
        genreFilters.querySelector('.checkbox-container').innerHTML = "";
        allGenres.forEach((genre) => {
            const genreCheckbox = document.createElement("input");
            genreCheckbox.type = "checkbox";
            genreCheckbox.id = genre;
            genreCheckbox.value = genre;
            genreCheckbox.checked = activeFilters.genre.has(genre);

            const genreLabel = document.createElement("label");
            genreLabel.textContent = genre;
            genreLabel.setAttribute("for", genre);

            const genreContainer = document.createElement("div");
            genreContainer.appendChild(genreCheckbox);
            genreContainer.appendChild(genreLabel);

            genreCheckbox.addEventListener("change", () => {
                if (genreCheckbox.checked) {
                    activeFilters.genre.add(genre);
                } else {
                    activeFilters.genre.delete(genre);
                }
                currentPage = 1;
                renderSongs();
                setupPagination();
            });

            genreFilters.querySelector('.checkbox-container').appendChild(genreContainer);
        });
    }

    function renderArtists() {
        artistFilters.querySelector('.artist-checkbox-container').innerHTML = "";
        allArtists.forEach((artist) => {
            const artistCheckbox = document.createElement("input");
            artistCheckbox.type = "checkbox";
            artistCheckbox.id = artist;
            artistCheckbox.value = artist;
            artistCheckbox.checked = activeFilters.artist.has(artist);

            const artistLabel = document.createElement("label");
            artistLabel.textContent = artist;
            artistLabel.setAttribute("for", artist);

            const artistContainer = document.createElement("div");
            artistContainer.appendChild(artistCheckbox);
            artistContainer.appendChild(artistLabel);

            artistCheckbox.addEventListener("change", () => {
                if (artistCheckbox.checked) {
                    activeFilters.artist.add(artist);
                } else {
                    activeFilters.artist.delete(artist);
                }
                currentPage = 1;
                renderSongs();
                setupPagination();
            });

            artistFilters.querySelector('.artist-checkbox-container').appendChild(artistContainer);
        });
    }

    dateInput.addEventListener("input", () => {
        activeFilters.date = dateInput.value.trim();
        currentPage = 1;
        renderSongs();
        setupPagination();
    });

    function renderTopRatedSongs() {
        const topRatedList = document.getElementById("topRatedList");
        topRatedList.innerHTML = "";

        const ratedSongs = songObjects.filter(song => {
            const ratings = Object.values(songData[song.trackId]?.ratings || {});
            return ratings.length > 0;
        });

        const songsWithAverageRating = ratedSongs.map(song => {
            const ratings = Object.values(songData[song.trackId].ratings);
            const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            return { song, averageRating };
        });

        songsWithAverageRating.sort((a, b) => b.averageRating - a.averageRating);

        const top5Songs = songsWithAverageRating.slice(0, 5);

        top5Songs.forEach(({ song, averageRating }) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <img src="${song.artworkUrl100}" 
                     alt="${song.trackName}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 10px;">
                <div class="song-info">
                    <span class="artist-track">${song.artistName} - ${song.trackName}</span>
                    <small class="rating">★ ${averageRating.toFixed(2)}</small>
                </div>
            `;
            topRatedList.appendChild(listItem);
        });
    }

    fetchSongs();

    const searchFunction = setupSearch(searchInput, songObjects, renderSongs, setupPagination);
});