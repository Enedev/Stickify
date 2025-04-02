document.addEventListener('DOMContentLoaded', () => {
  try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const protectedPages = ['index.html', 'home.html', 'profile.html'];
      const authPages = ['logIn.html', 'signin.html'];
      const currentPath = window.location.pathname;

      const safeRedirect = (path) => {
          window.location.href = path.includes('://') ? path : `${window.location.origin}/${path}`;
      };

      // Verificar rutas protegidas
      if (protectedPages.some(page => currentPath.includes(page)) && !currentUser) {
          safeRedirect('logIn.html');
          return;
      }

      // Auth paths
      if (authPages.some(page => currentPath.includes(page)) && currentUser) {
          safeRedirect('index.html');
          return;
      }

      // logout
      document.body.addEventListener('click', (e) => {
        if (e.target.closest('#logoutBtn')) {
            // delete auth info, no ratingCommentsUsers
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            localStorage.removeItem('currentUser');

            // Visual feedback
            e.target.classList.add('logging-out');
            setTimeout(() => {
                safeRedirect('logIn.html');
            }, 500);
        }
    });

  } catch (error) {
      console.error('Error en autenticación:', error);
      localStorage.removeItem('currentUser');
      window.location.href = 'logIn.html';
  }
});