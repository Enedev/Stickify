document.addEventListener("DOMContentLoaded", () => {
  const genreToggle = document.getElementById("genreToggle");
  const genreFilters = document.getElementById("genreFilters");

  genreToggle.addEventListener("click", () => {
      genreFilters.classList.toggle("show");
  });

});
