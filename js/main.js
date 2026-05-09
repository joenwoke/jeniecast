import {
  getCurrentUser,
  listenToAuthChanges,
  signInWithGoogle,
  signOut,
  testSupabaseConnection
} from "./supabaseClient.js";

testSupabaseConnection();

const authArea = document.querySelector("#authArea");
const getStartedBtn = document.querySelector("#getStartedBtn");

let currentUser = null;

function getUserDisplayName(user) {
  return user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email
    || "Signed in";
}

function createAuthButton(text, clickHandler) {
  const button = document.createElement("button");

  button.classList.add("auth-btn");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", clickHandler);

  return button;
}

function renderAuthArea(user) {
  currentUser = user;
  authArea.replaceChildren();

  if (!user) {
    authArea.appendChild(createAuthButton("Sign in with Google", signInWithGoogle));
    return;
  }

  const userText = document.createElement("span");
  const dashboardLink = document.createElement("a");

  userText.classList.add("auth-user");
  userText.textContent = getUserDisplayName(user);

  dashboardLink.classList.add("auth-btn");
  dashboardLink.href = "dashboard.html";
  dashboardLink.textContent = "Dashboard";

  authArea.appendChild(userText);
  authArea.appendChild(dashboardLink);
  authArea.appendChild(createAuthButton("Sign out", signOut));
}

async function initializeAuthArea() {
  const user = await getCurrentUser();

  renderAuthArea(user);
  listenToAuthChanges(renderAuthArea);
}

function handleGetStarted() {
  if (currentUser) {
    window.location.href = "dashboard.html";
    return;
  }

  signInWithGoogle();
}

getStartedBtn.addEventListener("click", handleGetStarted);
initializeAuthArea();
