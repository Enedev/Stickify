document.addEventListener('DOMContentLoaded', () => {
  try {
      // Obtener usuario actual
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      
      // Validación de rutas protegidas
      const protectedPages = ['index.html', 'home.html']; // Agrega todas tus páginas protegidas
      const isProtectedPage = protectedPages.some(page => 
          window.location.pathname.includes(page)
      );

      // Redirigir si no está autenticado en páginas protegidas
      if (isProtectedPage && !currentUser) {
          console.warn('Acceso no autorizado - Redirigiendo a login');
          window.location.href = 'logIn.html';
          return;
      }

      // Redirigir si está autenticado y está en páginas de auth
      const authPages = ['logIn.html', 'signin.html'];
      if (authPages.some(page => window.location.pathname.includes(page)) && currentUser) {
          console.log('Usuario ya autenticado - Redirigiendo a home');
          window.location.href = 'index.html';
          return;
      }

      // Configurar panel de usuario
      const userPanel = document.querySelector('.user-panel');
      if (userPanel) {
          if (currentUser) {
              userPanel.innerHTML = `
                  <div class="user-info">
                      <h3>Bienvenido, ${currentUser.username}</h3>
                      <button id="logoutBtn">Cerrar sesión</button>
                  </div>
              `;
              
              // Manejador de logout
              document.getElementById('logoutBtn').addEventListener('click', () => {
                  localStorage.removeItem('currentUser');
                  console.log('Sesión cerrada - Usuario eliminado');
                  window.location.href = 'logIn.html';
              });
          } else {
              window.location.href = 'logIn.html';
          }
      }

  } catch (error) {
      console.error('Error en el sistema de autenticación:', error);
      localStorage.removeItem('currentUser');
      window.location.href = 'logIn.html';
  }
});