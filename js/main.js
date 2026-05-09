import {
  getCurrentUser,
  signInWithGoogle,
  testSupabaseConnection
} from "./supabaseClient.js";

testSupabaseConnection();

const getStartedBtn = document.querySelector("#getStartedBtn");

let currentUser = null;

function handleGetStarted() {
  if (currentUser) {
    window.location.href = "dashboard.html";
    return;
  }

  signInWithGoogle();
}

async function initializeLandingPage() {
  currentUser = await getCurrentUser();
  getStartedBtn.addEventListener("click", handleGetStarted);
}

initializeLandingPage();
