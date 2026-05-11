import { getCurrentUser, signOut, supabase } from "./supabaseClient.js";
import {
  isDuplicateWatchItem,
  normalizeWatchItems,
  populateSelectOptions,
  watchStatuses,
  watchTypes
} from "./data.js";

const watchGrid = document.querySelector("#watchGrid");
const dashboardStats = document.querySelector("#dashboardStats");
const typeFilterRow = document.querySelector("#typeFilterRow");
const filterRow = document.querySelector("#filterRow");
const dashboardSearch = document.querySelector("#dashboardSearch");
const clearSearchBtn = document.querySelector("#clearSearchBtn");
const dashboardSort = document.querySelector("#dashboardSort");
const resetViewBtn = document.querySelector("#resetViewBtn");
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
const authArea = document.querySelector("#authArea");
const protectedLoading = document.querySelector("#protectedLoading");
const protectedContent = document.querySelectorAll(".protected-content");

let watchItems = [];
let currentUser = null;
let currentFilter = "All";
let currentType = "All";
let currentStatus = "All";
let currentSearchTerm = "";
let currentSort = "recent";
let editingItemId = "";

populateSelectOptions(editType, watchTypes);
populateSelectOptions(editStatus, watchStatuses);

// State helpers
function redirectToHome() {
  window.location.href = "index.html";
}

function showProtectedContent() {
  protectedLoading.hidden = true;

  protectedContent.forEach(element => {
    element.hidden = false;
  });
}

function getUserDisplayName(user) {
  return user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email
    || "Signed in";
}

function renderSignedInAuthArea(user) {
  const userText = document.createElement("span");
  const signOutButton = document.createElement("button");

  authArea.replaceChildren();

  userText.classList.add("auth-user");
  userText.textContent = getUserDisplayName(user);

  signOutButton.classList.add("auth-btn");
  signOutButton.type = "button";
  signOutButton.textContent = "Sign out";
  signOutButton.addEventListener("click", handleSignOut);

  authArea.appendChild(userText);
  authArea.appendChild(signOutButton);
}

async function handleSignOut() {
  await signOut();
  redirectToHome();
}

async function requireSignedInUser() {
  const user = await getCurrentUser();

  if (!user || !supabase) {
    console.info("Movie Vault requires sign-in. Redirecting to the landing page.");
    redirectToHome();
    return null;
  }

  currentUser = user;
  renderSignedInAuthArea(user);
  showProtectedContent();
  return user;
}

function mapSupabaseWatchItem(item) {
  return {
    id: item.id,
    createdAt: new Date(item.created_at).getTime(),
    title: item.title,
    type: item.type,
    platform: item.platform,
    moods: item.mood_tags || [],
    status: item.status,
    notes: item.notes || ""
  };
}

async function loadWatchItems() {
  const user = currentUser || await requireSignedInUser();

  if (!user) {
    return;
  }

  const { data, error } = await supabase
    .from("watch_items")
    .select("id,title,type,platform,mood_tags,status,notes,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase watch_items read failed:", error.message);
    watchItems = [];
    return;
  }

  watchItems = data.map(mapSupabaseWatchItem);
  console.info(`Loaded ${watchItems.length} watch item(s) from Supabase.`);
}

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

function getTypeFilters() {
  const typeSet = new Set();

  watchItems.forEach(item => {
    typeSet.add(item.type);
  });

  return ["All", ...Array.from(typeSet).sort((firstType, secondType) => {
    return firstType.localeCompare(secondType);
  })];
}

function renderTypeFilterButtons() {
  const typeFilters = getTypeFilters();

  if (!typeFilters.includes(currentType)) {
    currentType = "All";
  }

  typeFilterRow.replaceChildren();

  typeFilters.forEach(filter => {
    const button = document.createElement("button");
    button.classList.add("filter-btn");
    button.type = "button";
    button.dataset.type = filter;
    button.textContent = filter === "All" ? "All types" : filter;

    if (filter === currentType) {
      button.classList.add("active");
    }

    typeFilterRow.appendChild(button);
  });
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

function createStatCard(label, value, status = "") {
  const card = document.createElement("button");
  const valueElement = document.createElement("strong");
  const labelElement = document.createElement("span");

  card.classList.add("stat-card", "filter-stat");
  card.type = "button";
  card.dataset.status = status;
  valueElement.textContent = value;
  labelElement.textContent = label;

  if (status === currentStatus) {
    card.classList.add("active");
  }

  card.appendChild(valueElement);
  card.appendChild(labelElement);

  return card;
}

function renderDashboardStats() {
  const stats = [
    { label: "All", value: watchItems.length, status: "All" },
    { label: "Want to Watch", value: getStatusCount("Want to Watch"), status: "Want to Watch" },
    { label: "Watching", value: getStatusCount("Watching"), status: "Watching" },
    { label: "Finished", value: getStatusCount("Finished"), status: "Finished" },
    { label: "Rewatchable", value: getStatusCount("Rewatchable"), status: "Rewatchable" }
  ];

  dashboardStats.replaceChildren();

  stats.forEach(stat => {
    dashboardStats.appendChild(createStatCard(stat.label, stat.value, stat.status));
  });
}

function updateClearSearchButton() {
  clearSearchBtn.hidden = currentSearchTerm === "";
}

function refreshDashboard() {
  renderTypeFilterButtons();
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

  reader.addEventListener("load", async () => {
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

    await replaceSupabaseWatchlist(normalizeWatchItems(importedItems));
    hideEditForm();
  });

  reader.readAsText(file);
}

async function updateSupabaseWatchItem(updatedItem) {
  const { error } = await supabase
    .from("watch_items")
    .update({
      title: updatedItem.title,
      type: updatedItem.type,
      platform: updatedItem.platform,
      mood_tags: updatedItem.moods,
      status: updatedItem.status,
      notes: updatedItem.notes
    })
    .eq("id", updatedItem.id);

  if (error) {
    console.error("Supabase watch_items update failed:", error.message);
    editFormMessage.textContent = "Could not save changes. Please try again.";
    editFormMessage.hidden = false;
    return false;
  }

  console.info("Updated watch item in Supabase.");
  return true;
}

async function deleteSupabaseWatchItem(itemId) {
  const { error } = await supabase
    .from("watch_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Supabase watch_items delete failed:", error.message);
    return false;
  }

  console.info("Deleted watch item from Supabase.");
  return true;
}

async function replaceSupabaseWatchlist(importedItems) {
  if (!currentUser) {
    showBackupMessage("Please sign in before importing.", "error");
    return;
  }

  const currentIds = watchItems.map(item => item.id);

  if (currentIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("watch_items")
      .delete()
      .in("id", currentIds);

    if (deleteError) {
      console.error("Supabase watch_items import delete failed:", deleteError.message);
      showBackupMessage("Import failed. Could not replace your current watchlist.", "error");
      return;
    }
  }

  if (importedItems.length > 0) {
    const rows = importedItems.map(item => {
      return {
        user_id: currentUser.id,
        title: item.title,
        type: item.type,
        platform: item.platform,
        mood_tags: item.moods,
        status: item.status,
        notes: item.notes
      };
    });

    const { error: insertError } = await supabase
      .from("watch_items")
      .insert(rows);

    if (insertError) {
      console.error("Supabase watch_items import insert failed:", insertError.message);
      showBackupMessage("Import failed. Could not save the imported watchlist.", "error");
      return;
    }
  }

  await loadWatchItems();
  refreshDashboard();
  showBackupMessage("Watchlist imported successfully.", "success");
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
  const cardHeader = document.createElement("div");
  const cardBody = document.createElement("div");
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
  cardHeader.classList.add("watch-card-header");
  cardBody.classList.add("watch-card-body");
  meta.classList.add("card-meta");
  status.classList.add("status-badge");
  notes.classList.add("card-notes");
  tagRow.classList.add("tag-row");
  cardActions.classList.add("card-actions");

  meta.textContent = `${item.type} • ${item.platform}`;
  title.textContent = item.title;
  status.textContent = item.status;
  notes.textContent = item.notes || "No notes added yet.";

  item.moods.forEach(mood => {
    const tag = document.createElement("span");
    tag.textContent = mood;
    tagRow.appendChild(tag);
  });

  cardActions.appendChild(editButton);
  cardActions.appendChild(deleteButton);

  cardHeader.appendChild(title);
  cardHeader.appendChild(status);

  cardBody.appendChild(meta);
  cardBody.appendChild(notes);
  cardBody.appendChild(tagRow);

  card.appendChild(cardHeader);
  card.appendChild(cardBody);
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

function getEmptyStateContent(filter, type, status, searchTerm) {
  if (watchItems.length === 0) {
    return {
      title: "Your watchlist is empty",
      message: "Add something to start building your personal watchlist."
    };
  }

  if ((filter !== "All" || type !== "All" || status !== "All") && searchTerm) {
    return {
      title: "No filtered search results",
      message: "Try a different search term, mood filter, type filter, or status filter."
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

  if (type !== "All") {
    return {
      title: `No ${type} items`,
      message: "Try a different type filter or add another saved item."
    };
  }

  if (status !== "All") {
    return {
      title: `No ${status} items`,
      message: "Try a different status filter or update a saved item."
    };
  }

  return {
    title: "No matches found",
    message: "Add more watch items or try a different mood filter."
  };
}

function getVisibleWatchItems(filter) {
  const searchTerm = currentSearchTerm.toLowerCase();
  const moodFilteredItems = filter === "All"
    ? watchItems
    : watchItems.filter(item => item.moods.includes(filter));
  const typeFilteredItems = currentType === "All"
    ? moodFilteredItems
    : moodFilteredItems.filter(item => item.type === currentType);
  const statusFilteredItems = currentStatus === "All"
    ? typeFilteredItems
    : typeFilteredItems.filter(item => item.status === currentStatus);

  return statusFilteredItems.filter(item => itemMatchesSearch(item, searchTerm));
}

function renderWatchItems(filter = "All") {
  currentFilter = filter;
  watchGrid.replaceChildren();
  const searchTerm = currentSearchTerm.toLowerCase();
  const visibleItems = getVisibleWatchItems(filter);
  const filteredItems = sortWatchItems(visibleItems);

  renderDashboardStats();

  if (filteredItems.length === 0) {
    const emptyState = getEmptyStateContent(filter, currentType, currentStatus, searchTerm);
    watchGrid.appendChild(createEmptyStateCard(emptyState.title, emptyState.message));
    return;
  }

  filteredItems.forEach(item => {
    watchGrid.appendChild(createWatchCard(item));
  });
}

// Event handlers
watchGrid.addEventListener("click", async event => {
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

  const wasDeleted = await deleteSupabaseWatchItem(itemId);

  if (!wasDeleted) {
    return;
  }

  watchItems = watchItems.filter(item => item.id !== itemId);
  refreshDashboard();
});

editWatchForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (isDuplicateWatchItem(watchItems, editTitle.value, editPlatform.value, editingItemId)) {
    editFormMessage.textContent = "Another saved item already uses this title and platform.";
    editFormMessage.hidden = false;
    return;
  }

  editFormMessage.hidden = true;

  const updatedItem = {
    id: editingItemId,
    title: editTitle.value.trim(),
    type: editType.value,
    platform: editPlatform.value.trim(),
    moods: getMoodsFromInput(editMoods.value),
    status: editStatus.value,
    notes: editNotes.value.trim()
  };

  const wasUpdated = await updateSupabaseWatchItem(updatedItem);

  if (!wasUpdated) {
    return;
  }

  watchItems = watchItems.map(item => {
    return item.id === editingItemId
      ? { ...item, ...updatedItem }
      : item;
  });

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

resetViewBtn.addEventListener("click", () => {
  currentFilter = "All";
  currentType = "All";
  currentStatus = "All";
  currentSearchTerm = "";
  currentSort = "recent";
  dashboardSearch.value = "";
  dashboardSort.value = currentSort;
  updateClearSearchButton();
  refreshDashboard();
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

typeFilterRow.addEventListener("click", event => {
  const filterButton = event.target.closest(".filter-btn");

  if (!filterButton) {
    return;
  }

  currentType = filterButton.dataset.type;
  renderWatchItems(currentFilter);
  renderTypeFilterButtons();
});

dashboardStats.addEventListener("click", event => {
  const statCard = event.target.closest(".filter-stat");

  if (!statCard) {
    return;
  }

  currentStatus = statCard.dataset.status || "All";
  renderWatchItems(currentFilter);
});

async function initializeDashboard() {
  const user = await requireSignedInUser();

  if (!user) {
    return;
  }

  await loadWatchItems();
  updateClearSearchButton();
  refreshDashboard();
}

initializeDashboard();
