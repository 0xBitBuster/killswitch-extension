const killSwitchContainer = document.querySelector(".kill-switch__container");
const leverBarElement = document.querySelector(".lever__bar");
const siteInfoUrlElement = document.querySelector(".site__info-url");
const siteInfoTypeElement = document.querySelector(".site__info-type");
const undoBtn = document.querySelector("#undo-btn");
const settingsBtn = document.querySelector("#settings-btn");
const toggleSiteTypeBtn = document.querySelector("#toggle-site-type-btn");

const switchAnimationDuration = 300;
let currentTabDomain = "";
let isTabBlacklisted;

/**
 * Initialize the popup with the current tab's information
 */
async function initPopup() {
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    const currentTab = tabs[0];
    if (!currentTab)
      return;

    // Populate DOM
    currentTabDomain = new URL(currentTab.url).hostname;
    siteInfoUrlElement.textContent = currentTabDomain;

    isTabBlacklisted = (await chrome.runtime.sendMessage({ command: "is-blacklisted", domain: currentTabDomain }))?.isBlacklisted
    updateSiteInfo();
  });
}

/**
 * Update the popup site information and actions button based on the current site status
 */
function updateSiteInfo() {
  if (isTabBlacklisted) {
    siteInfoTypeElement.textContent = "Unproductive Site";
    toggleSiteTypeBtn.textContent = "Mark as productive site";
    toggleSiteTypeBtn.classList.remove("btn-red");
    toggleSiteTypeBtn.classList.add("btn-green");
  } else {
    siteInfoTypeElement.textContent = "Productive Site";
    toggleSiteTypeBtn.textContent = "Mark as unproductive site";
    toggleSiteTypeBtn.classList.remove("btn-green");
    toggleSiteTypeBtn.classList.add("btn-red");
  }
}

/**
 * Handle toggling a site's status between unproductive and productive
 */
async function toggleSiteType() {  
  isTabBlacklisted = !isTabBlacklisted;

  updateSiteInfo();
  await chrome.runtime.sendMessage({ command: "toggle-blacklisted-domain", domain: currentTabDomain })
}

/**
 * Handle kill switch
 */
async function onKillSwitch() {
  leverBarElement.classList.toggle("lever__pulled");
  setTimeout(() => leverBarElement.classList.toggle("lever__pulled"), switchAnimationDuration);
  setTimeout(window.close, switchAnimationDuration * 2);

  await chrome.runtime.sendMessage({ command: "kill-switch" })
}

/**
 * Handle undo kill switch
 */
async function onUndoKillSwitch() {
  await chrome.runtime.sendMessage({ command: "undo-kill-switch" })
}

/**
 * Handle click events
 */
killSwitchContainer.addEventListener("click", onKillSwitch);
toggleSiteTypeBtn.addEventListener("click", toggleSiteType);
undoBtn.addEventListener("click", onUndoKillSwitch);
settingsBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());

/**
 * Initialize Popup
 */
initPopup();
