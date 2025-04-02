// authors.js
document.addEventListener("DOMContentLoaded", () => {
  const authorResults = document.getElementById("authorResults");
  let songObjects = JSON.parse(localStorage.getItem('songData')) || {};
  let authors = new Set();
  let authorList = [];

  // Extract unique authors
  Object.values(songObjects).forEach(song => {
      if(song.artistName){
          authors.add(song.artistName);
      }
  });

  // Fetch song data and create author list.
  fetch('https://itunes.apple.com/search?term=music&limit=100')
      .then(response => response.json())
      .then(data => {
          data.results.forEach(song => {
              authors.add(song.artistName);
          });
          authors.forEach(author => {
              authorList.push(author);
          });
          renderAuthors(authorList);
      })
      .catch(error => console.error("Error al obtener autores:", error));

  function renderAuthors(authors) {
      authorResults.innerHTML = "";
      authors.forEach(author => {
          const authorItem = document.createElement("div");
          authorItem.classList.add("author-item");
          authorItem.innerHTML = `<h3>${author}</h3>`;
          authorResults.appendChild(authorItem);
      });
  }
});