import {
  getCurrentUser,
  listenToAuthChanges,
  signInWithGoogle,
  signOut,
  testSupabaseConnection
} from "./supabaseClient.js";

testSupabaseConnection();

const geniePickTitle = document.querySelector("#geniePickTitle");
const geniePickNotes = document.querySelector("#geniePickNotes");
const geniePickTags = document.querySelector("#geniePickTags");
const authArea = document.querySelector("#authArea");

function getUserDisplayName(user) {
  return user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email
    || "Signed in";
}

function renderAuthArea(user) {
  authArea.replaceChildren();

  if (!user) {
    const signInButton = document.createElement("button");
    signInButton.classList.add("auth-btn");
    signInButton.type = "button";
    signInButton.textContent = "Sign in with Google";
    signInButton.addEventListener("click", signInWithGoogle);
    authArea.appendChild(signInButton);
    return;
  }

  const userText = document.createElement("span");
  const signOutButton = document.createElement("button");

  userText.classList.add("auth-user");
  userText.textContent = getUserDisplayName(user);

  signOutButton.classList.add("auth-btn");
  signOutButton.type = "button";
  signOutButton.textContent = "Sign out";
  signOutButton.addEventListener("click", signOut);

  authArea.appendChild(userText);
  authArea.appendChild(signOutButton);
}

async function initializeAuthArea() {
  const user = await getCurrentUser();
  renderAuthArea(user);
  listenToAuthChanges(renderAuthArea);
}

// Funnction to retrieve watch items
function renderGeniePick() {
  const watchItems = getWatchItems();

  // If there are no watch items, show a friendly message in the genie pick section
  if (watchItems.length === 0) {
    geniePickTitle.textContent = "No saved picks yet";
    geniePickNotes.textContent = "Add something to your watchlist to get a genie pick.";
    geniePickTags.replaceChildren();
    return;
  }

  // Pick a random item from the watch items
  const randomIndex = Math.floor(Math.random() * watchItems.length);
  const pick = watchItems[randomIndex];

  // Display the pick details in the genie pick section
  geniePickTitle.textContent = pick.title;
  geniePickNotes.textContent = pick.notes || `${pick.type} on ${pick.platform}`;
  geniePickTags.replaceChildren();

  // Create tags for each mood associated with the pick
  pick.moods.forEach(mood => {
    const tag = document.createElement("span");
    tag.textContent = mood;
    geniePickTags.appendChild(tag);
  });
}

// Initial render of the genie pick when the page loads
initializeAuthArea();
renderGeniePick();
