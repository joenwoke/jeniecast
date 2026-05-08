// dashboard.js - JavaScript for managing the watch list dashboard
const watchGrid = document.querySelector("#watchGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const editWatchForm = document.querySelector("#editWatchForm");
const editTitle = document.querySelector("#editTitle");
const editType = document.querySelector("#editType");
const editPlatform = document.querySelector("#editPlatform");
const editMoods = document.querySelector("#editMoods");
const editStatus = document.querySelector("#editStatus");
const editNotes = document.querySelector("#editNotes");
const cancelEditBtn = document.querySelector("#cancelEditBtn");

let watchItems = getWatchItems();
let currentFilter = "All";
// Variable to keep track of the currently editing item ID
let editingItemId = "";
// Function to retrieve watch items from localStorage
function getMoodsFromInput(value) {
  return value
    .split(",")
    .map(mood => mood.trim())
    .filter(mood => mood !== "");
}

// Function to show the edit form with the details of the selected item
function showEditForm(item) {
  editingItemId = item.id;
  editTitle.value = item.title;
  editType.value = item.type;
  editPlatform.value = item.platform;
  editMoods.value = item.moods.join(", ");
  editStatus.value = item.status;
  editNotes.value = item.notes;

  // Show the edit form and focus on the title input
  editWatchForm.hidden = false;
  editTitle.focus();
}
// Function to hide the edit form and reset its fields
function hideEditForm() {
  editingItemId = "";
  editWatchForm.reset();
  editWatchForm.hidden = true;
}

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

      <div class="card-actions">
        <button class="icon-btn edit-btn" type="button" data-id="${item.id}" aria-label="Edit ${item.title}" title="Edit">
          <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4Z"></path>
            <path d="M13 7l4 4"></path>
          </svg>
        </button>

        <button class="icon-btn delete-btn" type="button" data-id="${item.id}" aria-label="Delete ${item.title}" title="Delete">
          <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z"></path>
            <path d="M6 9h12l-1 12H7L6 9Z"></path>
            <path d="M10 11v8"></path>
            <path d="M14 11v8"></path>
          </svg>
        </button>
      </div>
    `;

    // Append the card to the watch grid
    watchGrid.appendChild(card);
  });
}

// Event listener for delete buttons using event delegation
watchGrid.addEventListener("click", event => {
  const editButton = event.target.closest(".edit-btn");

  // If the clicked element is an edit button, show the edit form for that item
  if (editButton) {
    const itemId = editButton.dataset.id;
    const itemToEdit = watchItems.find(item => item.id === itemId);

    // If the item is found, show the edit form with its details
    if (itemToEdit) {
      showEditForm(itemToEdit);
    }

    return;
  }

  // Check if the clidked element is a delete button
  const deleteButton = event.target.closest(".delete-btn");

  if (!deleteButton) {
    return;
  }

  // Get the ID of the item to delete from the data attribute
  const itemId = deleteButton.dataset.id;

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

// Event listener for edit form submission
editWatchForm.addEventListener("submit", event => {
  event.preventDefault();

  // Update the watch item in the watchItems array with the new values from the form
  watchItems = watchItems.map(item => {
    if (item.id !== editingItemId) {
      return item;
    }

    // Return a new object with the updated values from the form
    return {
      ...item,
      title: editTitle.value.trim(),
      type: editType.value,
      platform: editPlatform.value.trim(),
      moods: getMoodsFromInput(editMoods.value),
      status: editStatus.value,
      notes: editNotes.value.trim()
    };
  });

  // Save the updated watch items, hide the edit form and re-render the items with the current filter
  saveWatchItems(watchItems);
  hideEditForm();
  renderWatchItems(currentFilter);
});

// Event listener for cancel button in the edit form
cancelEditBtn.addEventListener("click", hideEditForm);

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
