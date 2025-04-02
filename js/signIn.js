document.getElementById('signInForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Formulario de registro enviado');
    
    try {
        const username = this.querySelector('input[type="text"]').value.trim();
        const email = this.querySelector('input[type="email"]').value.trim();
        const password = this.querySelector('input[type="password"]').value.trim();
        
        console.log('Datos capturados:', { username, email, password });

        if (!username || !email || !password) {
            console.warn('Validación fallida: Campos vacíos');
            alert('Por favor, complete todos los campos');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log('Usuarios registrados actuales:', users);

        if (users.some(user => user.email === email)) {
            console.warn(`Intento de registro con email existente: ${email}`);
            alert('Este correo electrónico ya está registrado');
            return;
        }

        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('Nuevo usuario registrado:', newUser);
        console.log('Todos los usuarios actualizados:', users);
        
        alert('Registro exitoso! Redirigiendo...');
        window.location.href = 'logIn.html';
    } catch (error) {
        console.error('Error en registro:', error);
        alert('Ocurrió un error durante el registro');
    }
});