document.addEventListener('DOMContentLoaded', () => {
    try {
        const userDataDiv = document.getElementById('userData');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const ratingCommentsUsers = JSON.parse(localStorage.getItem('ratingCommentsUsers')) || {};
        const playlistUser = JSON.parse(localStorage.getItem('playlistUser')) || {};
        const userPlaylists = playlistUser[currentUser.email] || [];


        if (!currentUser) {
            window.location.href = 'logIn.html';
            return;
        }

        let userDetailsHTML = `
          <div class="data-row">
              <label><i class="fa-solid fa-user"></i> Nombre de usuario:</label>
              <span>${currentUser.username}</span>
          </div>
          <div class="data-row">
              <label><i class="fa-solid fa-envelope"></i> Correo electrónico:</label>
              <span>${currentUser.email}</span>
          </div>
      `;

        if (ratingCommentsUsers[currentUser.email]) {
            if (ratingCommentsUsers[currentUser.email].ratings) {
                userDetailsHTML += `
                  <div class="data-row">
                      <label><i class="fa-solid fa-star"></i> Mis calificaciones:</label>
                      <ul>
              `;
                for (const trackId in ratingCommentsUsers[currentUser.email].ratings) {
                    userDetailsHTML += `
                      <li>
                          <strong>Canción ID: ${trackId}</strong>: ${ratingCommentsUsers[currentUser.email].ratings[trackId]} estrellas
                      </li>
                  `;
                }
                userDetailsHTML += `
                      </ul>
                  </div>
              `;
            }

            if (ratingCommentsUsers[currentUser.email].comments) {
                userDetailsHTML += `
                  <div class="data-row">
                      <label><i class="fa-solid fa-comments"></i> Mis comentarios:</label>
                      <ul>
              `;
                for (const trackId in ratingCommentsUsers[currentUser.email].comments) {
                    ratingCommentsUsers[currentUser.email].comments[trackId].forEach(comment => {
                        userDetailsHTML += `
                          <li>
                              <strong>Canción ID:${trackId}</strong>
                              <p>${comment.text}</p>
                              <small>${new Date(comment.date).toLocaleDateString()}</small>
                          </li>
                      `;
                    });
                }
                userDetailsHTML += `
                      </ul>
                  </div>
              `;
            }
        }

        if(userPlaylists.length > 0) {
            userDetailsHTML += `
                <div class="data-row">
                    <label><i class="fa-solid fa-music"></i> Mis Playlists</label>
                    <div class="playlist-grid">
                        ${userPlaylists.map(playlist => `
                            <div class="playlist-card">
                                <img src="${playlist.cover}" 
                                    class="playlist-cover-sm" 
                                    alt="${playlist.name}">
                                <div class="playlist-info">
                                    <h4>${playlist.name}</h4>
                                    <p>${playlist.songs.length} canciones</p>
                                    <small>${new Date(playlist.timestamp).toLocaleDateString()}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        userDataDiv.innerHTML = userDetailsHTML;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'logIn.html';
        });
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'logIn.html';
    }
});