import { getCurrentUser, supabase } from "./supabaseClient.js";
import {
  createCreatedAt,
  createWatchItemId,
  getWatchItems,
  isDuplicateWatchItem,
  populateSelectOptions,
  saveWatchItems,
  watchStatuses,
  watchTypes
} from "./data.js";

const addWatchForm = document.querySelector("#addWatchForm");
const typeSelect = document.querySelector("#type");
const statusSelect = document.querySelector("#status");
const addFormMessage = document.querySelector("#addFormMessage");

populateSelectOptions(typeSelect, watchTypes, "Choose type");
populateSelectOptions(statusSelect, watchStatuses, "Choose status");

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

function saveLocalWatchItem(newWatchItem) {
  const watchItems = getWatchItems();

  if (isDuplicateWatchItem(watchItems, newWatchItem.title, newWatchItem.platform)) {
    addFormMessage.textContent = "This title and platform are already saved.";
    addFormMessage.hidden = false;
    return;
  }

  watchItems.push(newWatchItem);
  saveWatchItems(watchItems);
  addWatchForm.reset();
  window.location.href = "dashboard.html";
}

addWatchForm.addEventListener("submit", async event => {
  event.preventDefault();

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
    id: createWatchItemId(),
    createdAt: createCreatedAt(),
    title,
    type,
    platform,
    moods,
    status,
    notes
  };

  addFormMessage.hidden = true;

  const user = await getCurrentUser();

  if (user && supabase) {
    await saveSupabaseWatchItem(newWatchItem, user);
    return;
  }

  console.info("Using localStorage add flow because no Supabase user is signed in.");
  saveLocalWatchItem(newWatchItem);
});
