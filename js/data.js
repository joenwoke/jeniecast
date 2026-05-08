const starterWatchItems = [
  {
    title: "The Office",
    type: "Series",
    platform: "Netflix",
    moods: ["Funny", "Comfort", "Eating"],
    status: "Rewatchable",
    notes: "Perfect background show while eating."
  },
  {
    title: "John Wick",
    type: "Movie",
    platform: "Prime Video",
    moods: ["Action", "Late Night"],
    status: "Want to Watch",
    notes: "Good pick when I want action."
  },
  {
    title: "Unknown TikTok Movie",
    type: "Unknown",
    platform: "TikTok",
    moods: ["Need to Identify"],
    status: "Saved Idea",
    notes: "Saw a clip online but forgot the name."
  }
];

function getWatchItems() {
  const savedItems = localStorage.getItem("jeniecastItems");

  if (savedItems) {
    return JSON.parse(savedItems);
  }

  localStorage.setItem("jeniecastItems", JSON.stringify(starterWatchItems));
  return starterWatchItems;
}

function saveWatchItems(items) {
  localStorage.setItem("jeniecastItems", JSON.stringify(items));
}