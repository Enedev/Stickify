// search.js

function setupSearch(searchInput, songObjects, renderSongs, setupPagination) {
  let currentSearchTerm = "";

  searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      currentPage = 1; // Asegúrate de que currentPage esté definido en music.js
      renderSongs();
      setupPagination();
  });

  // Modifica renderSongs y setupPagination para que usen currentSearchTerm
  return function() {
      return currentSearchTerm;
  };
}