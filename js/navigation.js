const menuButton = document.querySelector(".nav-menu-toggle");
const menu = document.querySelector("#siteMenu");
const mobileViewport = window.matchMedia("(max-width: 1100px)");

function setMenuOpen(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuButton.focus();
  }
});

mobileViewport.addEventListener("change", () => {
  const focusWasInMenu = menu.contains(document.activeElement);
  const focusWasOnButton = document.activeElement === menuButton;
  setMenuOpen(false);

  if (mobileViewport.matches && focusWasInMenu) {
    menuButton.focus();
  } else if (!mobileViewport.matches && focusWasOnButton) {
    menu.querySelector('[aria-current="page"]').focus();
  }
});
