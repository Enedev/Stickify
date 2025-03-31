// profile.js - Mostrar información detallada del usuario
document.addEventListener('DOMContentLoaded', () => {
  try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const userData = document.getElementById('userData');
      
      if(currentUser && userData) {
          userData.innerHTML = `
              <div class="data-row">
                  <label><i class="fa-solid fa-signature"></i> Nombre de usuario:</label>
                  <span>${currentUser.username}</span>
              </div>
              <div class="data-row">
                  <label><i class="fa-solid fa-envelope"></i> Email:</label>
                  <span>${currentUser.email}</span>
              </div>
              <div class="data-row">
                  <label><i class="fa-solid fa-key"></i> Contraseña:</label>
                  <span class="password-display">${'•'.repeat(currentUser.password.length)}</span>
              </div>
              <div class="data-row">
                  <label><i class="fa-solid fa-database"></i> Datos almacenados:</label>
                  <pre>${JSON.stringify(currentUser, null, 2)}</pre>
              </div>
          `;
          
          // Historial de seguridad
          console.log('Perfil accedido por:', currentUser.email, new Date().toISOString());
      }
  } catch (error) {
      console.error('Error al cargar perfil:', error);
      localStorage.removeItem('currentUser');
      window.location.href = 'logIn.html';
  }
});