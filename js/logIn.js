document.getElementById('logInForm').addEventListener('submit', function(e) {
  e.preventDefault();
  console.log('Formulario de login enviado');
  
  try {
      const email = this.querySelector('input[type="email"]').value.trim();
      const password = this.querySelector('input[type="password"]').value.trim();
      
      console.log('Datos de login capturados:', { email, password });

      if (!email || !password) {
          console.warn('Validación fallida: Campos vacíos en login');
          alert('Por favor, complete todos los campos');
          return;
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      console.log('Usuarios registrados:', users);
      
      const user = users.find(user => user.email === email);
      console.log('Usuario encontrado:', user);

      if (!user) {
          console.warn(`Intento de login con email no registrado: ${email}`);
          alert('Usuario no encontrado');
          return;
      }

      if (user.password !== password) {
          console.warn('Contraseña incorrecta para:', email);
          alert('Contraseña incorrecta');
          return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Sesión iniciada - Usuario actual:', user);
      console.log('LocalStorage actualizado:', localStorage);
      
      alert('Inicio de sesión exitoso!');
      window.location.href = 'home.html';
  } catch (error) {
      console.error('Error en login:', error);
      alert('Ocurrió un error durante el inicio de sesión');
  }
});