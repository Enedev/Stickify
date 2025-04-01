document.addEventListener("DOMContentLoaded", () => {
  const genreToggle = document.getElementById("genreToggle");
  const genreFilters = document.getElementById("genreFilters");
  const dateToggle = document.getElementById("dateToggle");
  const dateFilters = document.getElementById("dateFilters");
  const artistToggle = document.getElementById("artistToggle");
  const artistFilters = document.getElementById("artistFilters");

  genreToggle.addEventListener("click", () => {
    genreFilters.classList.toggle("show");
  });

  dateToggle.addEventListener("click", () => {
    dateFilters.classList.toggle("show");
  });

  artistToggle.addEventListener("click", () => {
    artistFilters.classList.toggle("show");
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#genreFilters') && !event.target.closest('#genreToggle')) {
      genreFilters.classList.remove('show');
    }
    if (!event.target.closest('#dateFilters') && !event.target.closest('#dateToggle')) {
      dateFilters.classList.remove('show');
    }
    if (!event.target.closest('#artistFilters') && !event.target.closest('#artistToggle')) {
      artistFilters.classList.remove('show');
    }
  });

  document.querySelectorAll('.close-filter').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
      const filterId = closeButton.dataset.filter;
      document.getElementById(filterId).classList.remove('show');
    });
  });
});
