const starterWatchItems = [
  {
    id: "starter-the-office",
    title: "The Office",
    type: "Series",
    platform: "Netflix",
    moods: ["Funny", "Comfort", "Eating"],
    status: "Rewatchable",
    notes: "Perfect background show while eating."
  },
  {
    id: "starter-john-wick",
    title: "John Wick",
    type: "Movie",
    platform: "Prime Video",
    moods: ["Action", "Late Night"],
    status: "Want to Watch",
    notes: "Good pick when I want action."
  },
  {
    id: "starter-unknown-tiktok-movie",
    title: "Unknown TikTok Movie",
    type: "Unknown",
    platform: "TikTok",
    moods: ["Need to Identify"],
    status: "Saved Idea",
    notes: "Saw a clip online but forgot the name."
  }
];

const watchItemsKey = "jeniecastItems";
// Key to track if starter cards have been loaded into localStorage to prevent duplicates 
const starterItemsLoadedKey = "jeniecastStarterItemsLoaded";

function createWatchItemId() {
  return `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

    const itemsWithIds = parsedItems.map(item => {
      if (item.id) {
        return item;
      }

      return {
        ...item,
        id: createWatchItemId()
      };
    });

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
