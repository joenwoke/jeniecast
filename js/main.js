// JavaScript for the main page of the Jeniecast app, including the genie pick feature
const geniePickTitle = document.querySelector("#geniePickTitle");
const geniePickNotes = document.querySelector("#geniePickNotes");
const geniePickTags = document.querySelector("#geniePickTags");

// Funnction to retrieve watch items
function renderGeniePick() {
  const watchItems = getWatchItems();

  // If there are no watch items, show a friendly message in the genie pick section
  if (watchItems.length === 0) {
    geniePickTitle.textContent = "No saved picks yet";
    geniePickNotes.textContent = "Add something to your watchlist to get a genie pick.";
    geniePickTags.innerHTML = "";
    return;
  }

  // Pick a random item from the watch items
  const randomIndex = Math.floor(Math.random() * watchItems.length);
  const pick = watchItems[randomIndex];

  // Display the pick details in the genie pick section
  geniePickTitle.textContent = pick.title;
  geniePickNotes.textContent = pick.notes || `${pick.type} on ${pick.platform}`;
  geniePickTags.innerHTML = "";

  // Create tags for each mood associated with the pick
  pick.moods.forEach(mood => {
    const tag = document.createElement("span");
    tag.textContent = mood;
    geniePickTags.appendChild(tag);
  });
}

// Initial render of the genie pick when the page loads
renderGeniePick();
