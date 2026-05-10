import { getCurrentUser, signOut, supabase } from "./supabaseClient.js";

const dashboardStats = document.querySelector("#dashboardStats");
const geniePickTitle = document.querySelector("#geniePickTitle");
const geniePickNotes = document.querySelector("#geniePickNotes");
const geniePickTags = document.querySelector("#geniePickTags");
const recentWatchGrid = document.querySelector("#recentWatchGrid");
const authArea = document.querySelector("#authArea");
const protectedLoading = document.querySelector("#protectedLoading");
const protectedContent = document.querySelectorAll(".protected-content");

let watchItems = [];
let currentUser = null;

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
    console.info("Dashboard requires sign-in. Redirecting to the landing page.");
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
  console.info(`Loaded ${watchItems.length} dashboard watch item(s) from Supabase.`);
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
    { label: "All", value: watchItems.length },
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

function renderGeniePick() {
  geniePickTags.replaceChildren();

  if (watchItems.length === 0) {
    geniePickTitle.textContent = "No saved picks yet";
    geniePickNotes.textContent = "Add something to your watchlist to get a Genie pick.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * watchItems.length);
  const pick = watchItems[randomIndex];

  geniePickTitle.textContent = pick.title;
  geniePickNotes.textContent = pick.notes || `${pick.type} on ${pick.platform}`;

  pick.moods.forEach(mood => {
    const tag = document.createElement("span");
    tag.textContent = mood;
    geniePickTags.appendChild(tag);
  });
}

function createPreviewCard(item) {
  const card = document.createElement("article");
  const meta = document.createElement("p");
  const title = document.createElement("h3");
  const status = document.createElement("p");
  const notes = document.createElement("p");
  const tagRow = document.createElement("div");

  card.classList.add("watch-card", "preview-card");
  meta.classList.add("card-meta");
  status.classList.add("status-badge");
  notes.classList.add("card-notes");
  tagRow.classList.add("tag-row");

  meta.textContent = `${item.type} • ${item.platform}`;
  title.textContent = item.title;
  status.textContent = item.status;
  notes.textContent = item.notes || "No notes added yet.";

  item.moods.slice(0, 4).forEach(mood => {
    const tag = document.createElement("span");
    tag.textContent = mood;
    tagRow.appendChild(tag);
  });

  card.appendChild(meta);
  card.appendChild(title);
  card.appendChild(status);
  card.appendChild(notes);
  card.appendChild(tagRow);

  return card;
}

function createEmptyStateCard() {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const message = document.createElement("p");
  const addLink = document.createElement("a");

  card.classList.add("watch-card");
  heading.textContent = "Your watchlist is empty";
  message.textContent = "Add something to start building your personal watchlist.";
  addLink.classList.add("btn", "primary-btn");
  addLink.href = "add.html";
  addLink.textContent = "Add Watch";

  card.appendChild(heading);
  card.appendChild(message);
  card.appendChild(addLink);

  return card;
}

function renderRecentlyAdded() {
  recentWatchGrid.replaceChildren();

  if (watchItems.length === 0) {
    recentWatchGrid.appendChild(createEmptyStateCard());
    return;
  }

  watchItems.slice(0, 4).forEach(item => {
    recentWatchGrid.appendChild(createPreviewCard(item));
  });
}

async function initializeDashboard() {
  const user = await requireSignedInUser();

  if (!user) {
    return;
  }

  await loadWatchItems();
  renderDashboardStats();
  renderGeniePick();
  renderRecentlyAdded();
}

initializeDashboard();
