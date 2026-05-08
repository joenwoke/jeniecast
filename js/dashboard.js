const watchGrid = document.querySelector("#watchGrid");
const filterButtons = document.querySelectorAll(".filter-btn");

let watchItems = getWatchItems();
let currentFilter = "All";

function renderWatchItems(filter = "All") {
  currentFilter = filter;
  watchGrid.innerHTML = "";

  const filteredItems = filter === "All"
    ? watchItems
    : watchItems.filter(item => item.moods.includes(filter));

  if (filteredItems.length === 0) {
    watchGrid.innerHTML = `
      <div class="watch-card">
        <h3>No matches found</h3>
        <p>Add more watch items or try a different mood filter.</p>
      </div>
    `;
    return;
  }

  filteredItems.forEach(item => {
    const card = document.createElement("article");
    card.classList.add("watch-card");

    card.innerHTML = `
      <p class="card-meta">${item.type} • ${item.platform}</p>
      <h3>${item.title}</h3>
      <p class="status-badge">${item.status}</p>
      <p>${item.notes}</p>

      <div class="tag-row">
        ${item.moods.map(mood => `<span>${mood}</span>`).join("")}
      </div>

      <button class="delete-btn" type="button" data-id="${item.id}">Delete</button>
    `;

    watchGrid.appendChild(card);
  });
}

watchGrid.addEventListener("click", event => {
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }

  const itemId = event.target.dataset.id;
  watchItems = watchItems.filter(item => item.id !== itemId);
  saveWatchItems(watchItems);
  renderWatchItems(currentFilter);
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const selectedFilter = button.dataset.filter;
    renderWatchItems(selectedFilter);
  });
});

renderWatchItems();
