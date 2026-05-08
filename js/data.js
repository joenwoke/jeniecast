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

function createWatchItemId() {
  return `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getWatchItems() {
  const savedItems = localStorage.getItem("jeniecastItems");

  if (savedItems) {
    const parsedItems = JSON.parse(savedItems);
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

  localStorage.setItem("jeniecastItems", JSON.stringify(starterWatchItems));
  return starterWatchItems;
}

function saveWatchItems(items) {
  localStorage.setItem("jeniecastItems", JSON.stringify(items));
}
