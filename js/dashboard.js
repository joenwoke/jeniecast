// dashboard.js - JavaScript for managing the watch list dashboard
const watchGrid = document.querySelector("#watchGrid");
const filterRow = document.querySelector("#filterRow");
const dashboardSearch = document.querySelector("#dashboardSearch");
const clearSearchBtn = document.querySelector("#clearSearchBtn");
const dashboardSort = document.querySelector("#dashboardSort");
const exportWatchlistBtn = document.querySelector("#exportWatchlistBtn");
const importWatchlistBtn = document.querySelector("#importWatchlistBtn");
const importWatchlistInput = document.querySelector("#importWatchlistInput");
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
let currentSort = "recent";
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

// Function to get the unique set of moods from all watch items for filter buttons
function getMoodFilters() {
  const moodSet = new Set();

  // Iterate through all watch items and add their moods to the set to get unique values
  watchItems.forEach(item => {
    item.moods.forEach(mood => {
      moodSet.add(mood);
    });
  });

  // Return an array of moods sorted alphabetically with "All" as the first option
  return ["All", ...Array.from(moodSet).sort((firstMood, secondMood) => {
    return firstMood.localeCompare(secondMood);
  })];
}

// Function to render filter buttons based on the unique moods from the watch items
function renderFilterButtons() {
  const moodFilters = getMoodFilters();

  if (!moodFilters.includes(currentFilter)) {
    currentFilter = "All";
  }

  filterRow.replaceChildren();
  // Create a button for each unique mood filter and add an active class to the currently selected filter
  moodFilters.forEach(filter => {
    const button = document.createElement("button");
    button.classList.add("filter-btn");
    button.type = "button";
    button.dataset.filter = filter;
    button.textContent = filter;

    if (filter === currentFilter) {
      button.classList.add("active");
    }

    filterRow.appendChild(button);
  });
}
// Function to update visibility of the clear search button based on whether there is a current search term
function updateClearSearchButton() {
  clearSearchBtn.hidden = currentSearchTerm === "";
}

// Function to refresh the dashboard by re-rendering filter buttons and watch items with the current filter
function refreshDashboard() {
  renderFilterButtons();
  renderWatchItems(currentFilter);
}
// Function to generate a filename for exporting the watchlist with the current date
function getExportFileName() {
  const today = new Date().toISOString().slice(0, 10);
  return `jeniecast-watchlist-${today}.json`;
}
// Function to export the watchlist as a JSON file for the user to download
function exportWatchlist() {
  const watchlistJson = JSON.stringify(watchItems, null, 2);
  const blob = new Blob([watchlistJson], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = getExportFileName();
  downloadLink.click();
  URL.revokeObjectURL(downloadUrl);
}
// Function to import a watchlist from a JSON file selected by the user
function importWatchlist(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    let importedItems;

    try {
      importedItems = JSON.parse(reader.result);
    } catch (error) {
      window.alert("That file is not valid JSON.");
      return;
    }

    if (!Array.isArray(importedItems)) {
      window.alert("Import failed. The JSON file must contain a watchlist array.");
      return;
    }
    // Normalize the imported items to ensure they have all required fields and valid data, then save and refresh the dashboard
    watchItems = normalizeWatchItems(importedItems);
    saveWatchItems(watchItems);
    hideEditForm();
    refreshDashboard();
    window.alert("Watchlist imported successfully.");
  });

  reader.readAsText(file);
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

// Function to create an SVG icon element with the specified paths
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

// Function to create an icon button with the specified class, label, item ID, and SVG paths for the icon
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

// Function to create a card element for an empty state with a title and message
function createEmptyStateCard(titleText, messageText) {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const message = document.createElement("p");

  card.classList.add("watch-card");
  heading.textContent = titleText;
  message.textContent = messageText;

  card.appendChild(heading);
  card.appendChild(message);

  return card;
}

// Function to create a card element for a watch item
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

  // Add appropriate classes to the card elements for styling
  card.classList.add("watch-card");
  meta.classList.add("card-meta");
  status.classList.add("status-badge");
  tagRow.classList.add("tag-row");
  cardActions.classList.add("card-actions");

  // Set the content of the card elements based on the watch item data
  meta.textContent = `${item.type} • ${item.platform}`;
  title.textContent = item.title;
  status.textContent = item.status;
  notes.textContent = item.notes;

  // Create tags for each mood associated with the item
  item.moods.forEach(mood => {
    const tag = document.createElement("span");
    tag.textContent = mood;
    tagRow.appendChild(tag);
  });

  // Append edit and delete buttons to the card actions container
  cardActions.appendChild(editButton);
  cardActions.appendChild(deleteButton);

  // Append all elements to the card
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

// Function to sort watch items based on the current sort option
function sortWatchItems(items) {
  const sortedItems = [...items];

  // Sort items by createdAt for "recent" or alphabetically by the selected field for other sort options
  sortedItems.sort((firstItem, secondItem) => {
    if (currentSort === "recent") {
      return secondItem.createdAt - firstItem.createdAt;
    }

    const firstValue = firstItem[currentSort] || "";
    const secondValue = secondItem[currentSort] || "";

    return firstValue.localeCompare(secondValue);
  });

  return sortedItems;
}

// Function to determine the appropriate empty state content based on the current filter and search term
function getEmptyStateContent(filter, searchTerm) {
  if (watchItems.length === 0) {
    return {
      title: "Your watchlist is empty",
      message: "Add something to start building your personal watchlist."
    };
  }

  if (filter !== "All" && searchTerm) {
    return {
      title: `No matches in ${filter}`,
      message: "Try a different search term or switch to another mood filter."
    };
  }

  if (searchTerm) {
    return {
      title: "No search results",
      message: "Try searching by title, platform, mood, status, or notes."
    };
  }

  if (filter !== "All") {
    return {
      title: `No ${filter} matches`,
      message: "Add more watch items or try a different mood filter."
    };
  }

  return {
    title: "No matches found",
    message: "Add more watch items or try a different mood filter."
  };
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
  const filteredItems = sortWatchItems(moodFilteredItems.filter(item => itemMatchesSearch(item, searchTerm)));

  // If no items match the filter, show a friendly message 
  if (filteredItems.length === 0) {
    // Get the appropriate empty state content based on the current filter and search term
    const emptyState = getEmptyStateContent(filter, searchTerm);
    watchGrid.appendChild(createEmptyStateCard(emptyState.title, emptyState.message));
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
  refreshDashboard();
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
  refreshDashboard();
});

// Event listener for cancel button in the edit form
cancelEditBtn.addEventListener("click", hideEditForm);

// Event listener for search input to filter items as the user types
dashboardSearch.addEventListener("input", () => {
  currentSearchTerm = dashboardSearch.value.trim();

  //Update visibility of the clear button based on whether there is a current search term
  updateClearSearchButton();
  renderWatchItems(currentFilter);
});

// Event listener for clear search button to reset the search input and re-render items
clearSearchBtn.addEventListener("click", () => {
  dashboardSearch.value = "";
  currentSearchTerm = "";
  updateClearSearchButton();
  dashboardSearch.focus();
  renderWatchItems(currentFilter);
});

// Event listener for sort select to re-render items based on the selected sort option
dashboardSort.addEventListener("change", () => {
  currentSort = dashboardSort.value;
  renderWatchItems(currentFilter);
});
// Event listeners for export and import buttons to trigger the respective functions
exportWatchlistBtn.addEventListener("click", exportWatchlist);

importWatchlistBtn.addEventListener("click", () => {
  importWatchlistInput.click();
});

importWatchlistInput.addEventListener("change", () => {
  const file = importWatchlistInput.files[0];

  if (file) {
    importWatchlist(file);
  }

  importWatchlistInput.value = "";
});

// Event listeners for filter buttons
filterRow.addEventListener("click", event => {
  const filterButton = event.target.closest(".filter-btn");

  if (!filterButton) {
    return;
  }

  const selectedFilter = filterButton.dataset.filter;
  renderWatchItems(selectedFilter);
  renderFilterButtons();
});
// Initial render of filter buttons and watch items when the page loads
updateClearSearchButton();
refreshDashboard();
