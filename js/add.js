const addWatchForm = document.querySelector("#addWatchForm");

addWatchForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = document.querySelector("#title").value.trim();
  const type = document.querySelector("#type").value;
  const platform = document.querySelector("#platform").value.trim();
  const moodsInput = document.querySelector("#moods").value.trim();
  const status = document.querySelector("#status").value;
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

  const watchItems = getWatchItems();
  watchItems.push(newWatchItem);
  saveWatchItems(watchItems);

  addWatchForm.reset();

  window.location.href = "dashboard.html";
});