const watchGrid = document.querySelector("#watchGrid");
const dashboardStats = document.querySelector("#dashboardStats");
const filterRow = document.querySelector("#filterRow");
const dashboardSearch = document.querySelector("#dashboardSearch");
const clearSearchBtn = document.querySelector("#clearSearchBtn");
const dashboardSort = document.querySelector("#dashboardSort");
const exportWatchlistBtn = document.querySelector("#exportWatchlistBtn");
const importWatchlistBtn = document.querySelector("#importWatchlistBtn");
const importWatchlistInput = document.querySelector("#importWatchlistInput");
const backupMessage = document.querySelector("#backupMessage");
const editWatchForm = document.querySelector("#editWatchForm");
const editTitle = document.querySelector("#editTitle");
const editType = document.querySelector("#editType");
const editPlatform = document.querySelector("#editPlatform");
const editMoods = document.querySelector("#editMoods");
const editStatus = document.querySelector("#editStatus");
const editNotes = document.querySelector("#editNotes");
const editFormMessage = document.querySelector("#editFormMessage");
const cancelEditBtn = document.querySelector("#cancelEditBtn");

let watchItems = getWatchItems();
let currentFilter = "All";
let currentSearchTerm = "";
let currentSort = "recent";
let editingItemId = "";

populateSelectOptions(editType, watchTypes);
populateSelectOptions(editStatus, watchStatuses);

// State helpers
function getMoodsFromInput(value) {
  return value
    .split(",")
    .map(mood => mood.trim())
    .filter(mood => mood !== "");
}

function getMoodFilters() {
  const moodSet = new Set();

  watchItems.forEach(item => {
    item.moods.forEach(mood => {
      moodSet.add(mood);
    });
  });

  return ["All", ...Array.from(moodSet).sort((firstMood, secondMood) => {
    return firstMood.localeCompare(secondMood);
  })];
}

function renderFilterButtons() {
  const moodFilters = getMoodFilters();

  if (!moodFilters.includes(currentFilter)) {
    currentFilter = "All";
  }

  filterRow.replaceChildren();

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

function getStatusCount(status) {
  return watchItems.filter(item => item.status === status).length;
}

function createStatCard(label, value) {
  const card = document.createElement("article");
  const valueElement = document.createElement("strong");
  const labelElement = document.createElement("span");

  card.classList.add("stat-card");
  valueElement.textContent = value;
  labelElement.textContent = label;

  card.appendChild(valueElement);
  card.appendChild(labelElement);

  return card;
}

function renderDashboardStats() {
  const stats = [
    { label: "Total saved", value: watchItems.length },
    { label: "Want to Watch", value: getStatusCount("Want to Watch") },
    { label: "Watching", value: getStatusCount("Watching") },
    { label: "Finished", value: getStatusCount("Finished") },
    { label: "Rewatchable", value: getStatusCount("Rewatchable") }
  ];

  dashboardStats.replaceChildren();

  stats.forEach(stat => {
    dashboardStats.appendChild(createStatCard(stat.label, stat.value));
  });
}

function updateClearSearchButton() {
  clearSearchBtn.hidden = currentSearchTerm === "";
}

function refreshDashboard() {
  renderDashboardStats();
  renderFilterButtons();
  renderWatchItems(currentFilter);
}

// Backup helpers
function getExportFileName() {
  const today = new Date().toISOString().slice(0, 10);
  return `jeniecast-watchlist-${today}.json`;
}

function showBackupMessage(message, type) {
  backupMessage.textContent = message;
  backupMessage.classList.remove("success", "error");
  backupMessage.classList.add(type);
  backupMessage.hidden = false;
}

function exportWatchlist() {
  const watchlistJson = JSON.stringify(watchItems, null, 2);
  const blob = new Blob([watchlistJson], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = getExportFileName();
  downloadLink.click();
  URL.revokeObjectURL(downloadUrl);
  showBackupMessage("Watchlist export started.", "success");
}

function importWatchlist(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    let importedItems;

    try {
      importedItems = JSON.parse(reader.result);
    } catch (error) {
      showBackupMessage("That file is not valid JSON.", "error");
      return;
    }

    if (!Array.isArray(importedItems)) {
      showBackupMessage("Import failed. The JSON file must contain a watchlist array.", "error");
      return;
    }

    watchItems = normalizeWatchItems(importedItems);
    saveWatchItems(watchItems);
    hideEditForm();
    refreshDashboard();
    showBackupMessage("Watchlist imported successfully.", "success");
  });

  reader.readAsText(file);
}

// Edit form helpers
function showEditForm(item) {
  editingItemId = item.id;
  editTitle.value = item.title;
  editType.value = item.type;
  editPlatform.value = item.platform;
  editMoods.value = item.moods.join(", ");
  editStatus.value = item.status;
  editNotes.value = item.notes;
  editFormMessage.hidden = true;

  editWatchForm.hidden = false;
  editTitle.focus();
}

function hideEditForm() {
  editingItemId = "";
  editWatchForm.reset();
  editFormMessage.hidden = true;
  editWatchForm.hidden = true;
}

// Rendering helpers
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

// Filtering and sorting
function itemMatchesSearch(item, searchTerm) {
  if (!searchTerm) {
    return true;
  }

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

function sortWatchItems(items) {
  const sortedItems = [...items];

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

function renderWatchItems(filter = "All") {
  currentFilter = filter;
  watchGrid.replaceChildren();
  const searchTerm = currentSearchTerm.toLowerCase();

  const moodFilteredItems = filter === "All"
    ? watchItems
    : watchItems.filter(item => item.moods.includes(filter));  
  const filteredItems = sortWatchItems(moodFilteredItems.filter(item => itemMatchesSearch(item, searchTerm)));

  if (filteredItems.length === 0) {
    const emptyState = getEmptyStateContent(filter, searchTerm);
    watchGrid.appendChild(createEmptyStateCard(emptyState.title, emptyState.message));
    return;
  }

  filteredItems.forEach(item => {
    watchGrid.appendChild(createWatchCard(item));
  });
}

// Event handlers
watchGrid.addEventListener("click", event => {
  const editButton = event.target.closest(".edit-btn");

  if (editButton) {
    const itemId = editButton.dataset.id;
    const itemToEdit = watchItems.find(item => item.id === itemId);

    if (itemToEdit) {
      showEditForm(itemToEdit);
    }

    return;
  }

  const deleteButton = event.target.closest(".delete-btn");

  if (!deleteButton) {
    return;
  }

  const itemId = deleteButton.dataset.id;
  const shouldDelete = window.confirm("Are you sure you want to delete this watch item?");

  if (!shouldDelete) {
    return;
  }

  watchItems = watchItems.filter(item => item.id !== itemId);
  saveWatchItems(watchItems);
  refreshDashboard();
});

editWatchForm.addEventListener("submit", event => {
  event.preventDefault();

  if (isDuplicateWatchItem(watchItems, editTitle.value, editPlatform.value, editingItemId)) {
    editFormMessage.textContent = "Another saved item already uses this title and platform.";
    editFormMessage.hidden = false;
    return;
  }

  editFormMessage.hidden = true;

  watchItems = watchItems.map(item => {
    if (item.id !== editingItemId) {
      return item;
    }

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

  saveWatchItems(watchItems);
  hideEditForm();
  refreshDashboard();
});

cancelEditBtn.addEventListener("click", hideEditForm);

dashboardSearch.addEventListener("input", () => {
  currentSearchTerm = dashboardSearch.value.trim();
  updateClearSearchButton();
  renderWatchItems(currentFilter);
});

clearSearchBtn.addEventListener("click", () => {
  dashboardSearch.value = "";
  currentSearchTerm = "";
  updateClearSearchButton();
  dashboardSearch.focus();
  renderWatchItems(currentFilter);
});

dashboardSort.addEventListener("change", () => {
  currentSort = dashboardSort.value;
  renderWatchItems(currentFilter);
});

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

filterRow.addEventListener("click", event => {
  const filterButton = event.target.closest(".filter-btn");

  if (!filterButton) {
    return;
  }

  const selectedFilter = filterButton.dataset.filter;
  renderWatchItems(selectedFilter);
  renderFilterButtons();
});

updateClearSearchButton();
refreshDashboard();
