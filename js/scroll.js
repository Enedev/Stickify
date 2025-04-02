document.addEventListener("DOMContentLoaded", function () {
    const exploreButton = document.querySelector('.button[href="#"]');
    
    if (exploreButton) {
        exploreButton.addEventListener('click', function (e) {
            e.preventDefault(); // Evita la recarga de la página
            
            const nextSection = document.querySelector('.features'); // Selecciona la sección a la que se moverá
            if (nextSection) {
                window.scrollTo({
                    top: nextSection.offsetTop - 50, // Ajusta la posición
                    behavior: 'smooth' // Hace el desplazamiento suave
                });
            }
        });
    }
});
