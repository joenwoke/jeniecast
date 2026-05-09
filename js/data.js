// Shared form options
export const watchTypes = [
  { value: "Movie", label: "Movie" },
  { value: "Series", label: "Series" },
  { value: "YouTube", label: "YouTube" },
  { value: "Anime", label: "Anime" },
  { value: "Documentary", label: "Documentary" },
  { value: "Unknown", label: "Unknown / Forgot Title" }
];

export const watchStatuses = [
  { value: "Want to Watch", label: "Want to Watch" },
  { value: "Watching", label: "Watching" },
  { value: "Finished", label: "Finished" },
  { value: "Rewatchable", label: "Rewatchable" },
  { value: "Saved Idea", label: "Saved Idea" }
];

// Form helpers
export function populateSelectOptions(selectElement, options, placeholderText = "") {
  selectElement.replaceChildren();

  if (placeholderText) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = placeholderText;
    selectElement.appendChild(placeholder);
  }

  options.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    selectElement.appendChild(optionElement);
  });
}

// Item helpers
export function createWatchItemId() {
  return `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createCreatedAt() {
  return Date.now();
}

export function normalizeWatchItems(items) {
  return items.map((item, index) => {
    const watchItem = item && typeof item === "object" ? item : {};

    return {
      ...watchItem,
      id: watchItem.id || createWatchItemId(),
      createdAt: watchItem.createdAt || index + 1,
      title: watchItem.title || "Untitled",
      type: watchItem.type || "Unknown",
      platform: watchItem.platform || "Unknown",
      moods: Array.isArray(watchItem.moods) ? watchItem.moods : [],
      status: watchItem.status || "Saved Idea",
      notes: watchItem.notes || ""
    };
  });
}

// Validation helpers
function normalizeDuplicateValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function isDuplicateWatchItem(items, title, platform, ignoredItemId = "") {
  const normalizedTitle = normalizeDuplicateValue(title);
  const normalizedPlatform = normalizeDuplicateValue(platform);

  return items.some(item => {
    if (item.id === ignoredItemId) {
      return false;
    }

    return normalizeDuplicateValue(item.title) === normalizedTitle
      && normalizeDuplicateValue(item.platform) === normalizedPlatform;
  });
}
