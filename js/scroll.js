document.addEventListener("DOMContentLoaded", function () {
    const exploreButton = document.querySelector('.button[href="#"]');
    
    if (exploreButton) {
        exploreButton.addEventListener('click', function (e) {
            e.preventDefault();
            
            const nextSection = document.querySelector('.features');
            if (nextSection) {
                window.scrollTo({
                    top: nextSection.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        });
    }
});
