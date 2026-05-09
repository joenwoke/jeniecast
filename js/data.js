const starterWatchItems = [
  {
    id: "starter-the-office",
    createdAt: 1,
    title: "The Office",
    type: "Series",
    platform: "Netflix",
    moods: ["Funny", "Comfort", "Eating"],
    status: "Rewatchable",
    notes: "Perfect background show while eating."
  },
  {
    id: "starter-john-wick",
    createdAt: 2,
    title: "John Wick",
    type: "Movie",
    platform: "Prime Video",
    moods: ["Action", "Late Night"],
    status: "Want to Watch",
    notes: "Good pick when I want action."
  },
  {
    id: "starter-unknown-tiktok-movie",
    createdAt: 3,
    title: "Unknown TikTok Movie",
    type: "Unknown",
    platform: "TikTok",
    moods: ["Need to Identify"],
    status: "Saved Idea",
    notes: "Saw a clip online but forgot the name."
  }
];

// Predefined options for watch item types and statuses
const watchTypes = [
  { value: "Movie", label: "Movie" },
  { value: "Series", label: "Series" },
  { value: "YouTube", label: "YouTube" },
  { value: "Anime", label: "Anime" },
  { value: "Documentary", label: "Documentary" },
  { value: "Unknown", label: "Unknown / Forgot Title" }
];

const watchStatuses = [
  { value: "Want to Watch", label: "Want to Watch" },
  { value: "Watching", label: "Watching" },
  { value: "Finished", label: "Finished" },
  { value: "Rewatchable", label: "Rewatchable" },
  { value: "Saved Idea", label: "Saved Idea" }
];

const watchItemsKey = "jeniecastItems";
// Key to track if starter cards have been loaded into localStorage to prevent duplicates 
const starterItemsLoadedKey = "jeniecastStarterItemsLoaded";

// Function to populate select elements with options
function populateSelectOptions(selectElement, options, placeholderText = "") {
  selectElement.replaceChildren();

  // If a placeholder text is provided, add it as the first option
  if (placeholderText) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = placeholderText;
    selectElement.appendChild(placeholder);
  }
  // Add the provided options to the select element
  options.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    selectElement.appendChild(optionElement);
  });
}

function createWatchItemId() {
  return `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createCreatedAt() {
  return Date.now();
}

function normalizeWatchItems(items) {
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

function normalizeDuplicateValue(value) {
  return String(value || "").trim().toLowerCase();
}

function isDuplicateWatchItem(items, title, platform, ignoredItemId = "") {
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

function getWatchItems() {
  // Check if there are saved items in localStorage and if the starter items have aleady been loaded to prevent duplicates. 
  const savedItems = localStorage.getItem(watchItemsKey);
  const starterItemsLoaded = localStorage.getItem(starterItemsLoadedKey);

  if (savedItems) {
    let parsedItems;

    try {
      parsedItems = JSON.parse(savedItems);
    } catch (error) {
      saveWatchItems([]);
      return [];
    }

    if (!Array.isArray(parsedItems)) {
      saveWatchItems([]);
      return [];
    }

    const itemsWithIds = normalizeWatchItems(parsedItems);

    saveWatchItems(itemsWithIds);
    return itemsWithIds;
  }

  // If no save items and starter items have been loaded, return an empty array. Starter items only load once. 
  if (starterItemsLoaded) {
    return [];
  }

  localStorage.setItem(watchItemsKey, JSON.stringify(starterWatchItems));
  localStorage.setItem(starterItemsLoadedKey, "true");
  return starterWatchItems;
}

function saveWatchItems(items) {
  localStorage.setItem(watchItemsKey, JSON.stringify(items));
  localStorage.setItem(starterItemsLoadedKey, "true");
}
