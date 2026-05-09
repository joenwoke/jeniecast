// dashboard.js - JavaScript for managing the watch list dashboard
const watchGrid = document.querySelector("#watchGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const dashboardSearch = document.querySelector("#dashboardSearch");
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
let currentSearchTerm = "";
// Variable to keep track of the currently editing item ID
let editingItemId = "";

populateSelectOptions(editType, watchTypes);
populateSelectOptions(editStatus, watchStatuses);

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

function createSvgIcon(paths) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("action-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");

  paths.forEach(pathData => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
  });

  return svg;
}

function createIconButton(className, label, itemId, iconPaths) {
  const button = document.createElement("button");
  button.classList.add("icon-btn", className);
  button.type = "button";
  button.dataset.id = itemId;
  button.setAttribute("aria-label", label);
  button.title = label.split(" ")[0];
  button.appendChild(createSvgIcon(iconPaths));

  return button;
}

function createEmptyStateCard() {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const message = document.createElement("p");

  card.classList.add("watch-card");
  heading.textContent = "No matches found";
  message.textContent = "Add more watch items or try a different mood filter.";

  card.appendChild(heading);
  card.appendChild(message);

  return card;
}

function createWatchCard(item) {
  const card = document.createElement("article");
  const meta = document.createElement("p");
  const title = document.createElement("h3");
  const status = document.createElement("p");
  const notes = document.createElement("p");
  const tagRow = document.createElement("div");
  const cardActions = document.createElement("div");
  const editButton = createIconButton("edit-btn", `Edit ${item.title}`, item.id, [
    "M4 20h4L19 9l-4-4L4 16v4Z",
    "M13 7l4 4"
  ]);
  const deleteButton = createIconButton("delete-btn", `Delete ${item.title}`, item.id, [
    "M9 3h6l1 2h4v2H4V5h4l1-2Z",
    "M6 9h12l-1 12H7L6 9Z",
    "M10 11v8",
    "M14 11v8"
  ]);

  card.classList.add("watch-card");
  meta.classList.add("card-meta");
  status.classList.add("status-badge");
  tagRow.classList.add("tag-row");
  cardActions.classList.add("card-actions");

  meta.textContent = `${item.type} • ${item.platform}`;
  title.textContent = item.title;
  status.textContent = item.status;
  notes.textContent = item.notes;

  item.moods.forEach(mood => {
    const tag = document.createElement("span");
    tag.textContent = mood;
    tagRow.appendChild(tag);
  });

  cardActions.appendChild(editButton);
  cardActions.appendChild(deleteButton);

  card.appendChild(meta);
  card.appendChild(title);
  card.appendChild(status);
  card.appendChild(notes);
  card.appendChild(tagRow);
  card.appendChild(cardActions);

  return card;
}

// Function to check if a watch item matches the current search term
function itemMatchesSearch(item, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  // Combine all relevant text fields of the item into a single string for searching
  const searchableText = [
    item.title,
    item.type,
    item.platform,
    item.status,
    item.notes,
    ...item.moods
  ].join(" ").toLowerCase();

  return searchableText.includes(searchTerm);
}

// Function to retrieve watch items from localStorage
function renderWatchItems(filter = "All") {
  currentFilter = filter;
  watchGrid.replaceChildren();
  const searchTerm = currentSearchTerm.toLowerCase();

  // Filter items based on the selected mood filter
  const moodFilteredItems = filter === "All"
    ? watchItems
    : watchItems.filter(item => item.moods.includes(filter));
  const filteredItems = moodFilteredItems.filter(item => itemMatchesSearch(item, searchTerm));

  // If no items match the filter, show a friendly message 
  if (filteredItems.length === 0) {
    watchGrid.appendChild(createEmptyStateCard());
    return;
  }

  // Create and append cards for each filtered item
  filteredItems.forEach(item => {
    // Append the card to the watch grid
    watchGrid.appendChild(createWatchCard(item));
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

// Event listener for search input to filter items as the user types
dashboardSearch.addEventListener("input", () => {
  currentSearchTerm = dashboardSearch.value.trim();
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
