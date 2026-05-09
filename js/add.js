const addWatchForm = document.querySelector("#addWatchForm");
const typeSelect = document.querySelector("#type");
const statusSelect = document.querySelector("#status");
const addFormMessage = document.querySelector("#addFormMessage");

populateSelectOptions(typeSelect, watchTypes, "Choose type");
populateSelectOptions(statusSelect, watchStatuses, "Choose status");

addWatchForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = document.querySelector("#title").value.trim();
  const type = typeSelect.value;
  const platform = document.querySelector("#platform").value.trim();
  const moodsInput = document.querySelector("#moods").value.trim();
  const status = statusSelect.value;
  const notes = document.querySelector("#notes").value.trim();

  const watchItems = getWatchItems();

  if (isDuplicateWatchItem(watchItems, title, platform)) {
    addFormMessage.textContent = "This title and platform are already saved.";
    addFormMessage.hidden = false;
    return;
  }

  addFormMessage.hidden = true;

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

  watchItems.push(newWatchItem);
  saveWatchItems(watchItems);

  addWatchForm.reset();

  window.location.href = "dashboard.html";
});
