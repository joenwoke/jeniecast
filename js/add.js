// JavaScript for the add watch item page of the Jeniecast app
const addWatchForm = document.querySelector("#addWatchForm");
const typeSelect = document.querySelector("#type");
const statusSelect = document.querySelector("#status");

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

  const watchItems = getWatchItems();
  watchItems.push(newWatchItem);
  saveWatchItems(watchItems);

  addWatchForm.reset();

  window.location.href = "dashboard.html";
});
