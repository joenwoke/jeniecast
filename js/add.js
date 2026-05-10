import { getCurrentUser, signOut, supabase } from "./supabaseClient.js";
import {
  isDuplicateWatchItem,
  populateSelectOptions,
  watchStatuses,
  watchTypes
} from "./data.js";

const addWatchForm = document.querySelector("#addWatchForm");
const typeSelect = document.querySelector("#type");
const statusSelect = document.querySelector("#status");
const addFormMessage = document.querySelector("#addFormMessage");
const authArea = document.querySelector("#authArea");
const protectedLoading = document.querySelector("#protectedLoading");
const protectedContent = document.querySelectorAll(".protected-content");

populateSelectOptions(typeSelect, watchTypes, "Choose type");
populateSelectOptions(statusSelect, watchStatuses, "Choose status");

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
    console.info("Add Watch requires sign-in. Redirecting to the landing page.");
    redirectToHome();
    return null;
  }

  currentUser = user;
  renderSignedInAuthArea(user);
  showProtectedContent();
  return user;
}

async function getSupabaseDuplicateItems() {
  const { data, error } = await supabase
    .from("watch_items")
    .select("id,title,platform");

  if (error) {
    console.error("Supabase duplicate check failed:", error.message);
    return [];
  }

  return data.map(item => {
    return {
      id: item.id,
      title: item.title,
      platform: item.platform
    };
  });
}

async function saveSupabaseWatchItem(newWatchItem, user) {
  if (!user) {
    console.error("Supabase insert skipped because no authenticated user was found.");
    addFormMessage.textContent = "Please sign in before saving to your account.";
    addFormMessage.hidden = false;
    return;
  }

  const existingItems = await getSupabaseDuplicateItems();

  if (isDuplicateWatchItem(existingItems, newWatchItem.title, newWatchItem.platform)) {
    addFormMessage.textContent = "This title and platform are already saved.";
    addFormMessage.hidden = false;
    return;
  }

  const { error } = await supabase
    .from("watch_items")
    .insert({
      user_id: user.id,
      title: newWatchItem.title,
      type: newWatchItem.type,
      platform: newWatchItem.platform,
      mood_tags: newWatchItem.moods,
      status: newWatchItem.status,
      notes: newWatchItem.notes
    });

  if (error) {
    console.error("Supabase watch_items insert failed:", error.message);
    addFormMessage.textContent = "Could not save to your account. Please try again.";
    addFormMessage.hidden = false;
    return;
  }

  console.info("Saved watch item to Supabase.");
  addWatchForm.reset();
  window.location.href = "dashboard.html";
}

addWatchForm.addEventListener("submit", async event => {
  event.preventDefault();

  const user = currentUser || await requireSignedInUser();

  if (!user) {
    return;
  }

  const title = document.querySelector("#title").value.trim();
  const type = typeSelect.value;
  const platform = document.querySelector("#platform").value.trim();
  const moodsInput = document.querySelector("#moods").value.trim();
  const status = statusSelect.value;
  const notes = document.querySelector("#notes").value.trim();

  const moods = moodsInput
    .split(",")
    .map(mood => mood.trim())
    .filter(mood => mood !== "");

  const newWatchItem = {
    title,
    type,
    platform,
    moods,
    status,
    notes
  };

  addFormMessage.hidden = true;

  await saveSupabaseWatchItem(newWatchItem, user);
});

requireSignedInUser();
