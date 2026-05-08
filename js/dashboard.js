const watchGrid = document.querySelector("#watchGrid");
const filterButtons = document.querySelectorAll(".filter-btn");

let watchItems = getWatchItems();
let currentFilter = "All";

// Function to retrieve watch items from localStorage
function renderWatchItems(filter = "All") {
  currentFilter = filter;
  watchGrid.innerHTML = "";

  // Filter items based on the selected mood filter
  const filteredItems = filter === "All"
    ? watchItems
    : watchItems.filter(item => item.moods.includes(filter));

  // If no items match the filter, show a friendly message 
  if (filteredItems.length === 0) {
    watchGrid.innerHTML = `
      <div class="watch-card">
        <h3>No matches found</h3>
        <p>Add more watch items or try a different mood filter.</p>
      </div>
    `;
    return;
  }

  // Create and append cards for each filtered item
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

      <button class="delete-btn" type="button" data-id="${item.id}" aria-label="Delete ${item.title}" title="Delete">
        <svg class="delete-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z"></path>
          <path d="M6 9h12l-1 12H7L6 9Z"></path>
          <path d="M10 11v8"></path>
          <path d="M14 11v8"></path>
        </svg>
      </button>
    `;

    // Append the card to the watch grid
    watchGrid.appendChild(card);
  });
}

// Event listener for delete buttons using event delegation
watchGrid.addEventListener("click", event => {
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }

  // Get the ID of the item to delete from the data attribute
  const itemId = event.target.dataset.id;

  // Confirm delete action with the user
  const shouldDelete = window.confirm("Are you sure you want to delete this watch item?");
  if (!shouldDelete) {
    return;
  }

  // Remove the item from the watchItems array and update localStorage
  watchItems = watchItems.filter(item => item.id !== itemId);
  saveWatchItems(watchItems);
  renderWatchItems(currentFilter);
});

// Event listeners for filter buttons
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    // Get the selected filter from the button's data attribute and render items
    const selectedFilter = button.dataset.filter;
    renderWatchItems(selectedFilter);
  });
});
// Initial render of watch items on page load
renderWatchItems();
