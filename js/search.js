function setupSearch(searchInput, songObjects, renderSongs, setupPagination) {
  let currentSearchTerm = "";

  searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      currentPage = 1;
      renderSongs();
      setupPagination();
  });

  return function() {
      return currentSearchTerm;
  };
}