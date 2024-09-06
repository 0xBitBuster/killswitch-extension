const blacklistTextarea = document.getElementById('blacklist-textarea');

/**
 * Saves the textarea content to Chrome storage after converting it to regex patterns
 */
async function saveBlacklist() {
  const blacklist = blacklistTextarea.value.trim().split('\n');

  await chrome.runtime.sendMessage({ command: "set-blacklist", blacklist })
}

/**
 * Loads the blacklist from Chrome storage
 */
async function loadBlacklist() {
  const response = await chrome.runtime.sendMessage({ command: "get-blacklist", domainsAsRegex: false })

  blacklistTextarea.value = response.blacklist?.join('\n')?.trim();
}

/**
 * Opens the chrome shortcut page, which can not be done over a href due to security conflicts with chrome
 */
function openShortcutsPage() {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
}

/**
 * Event Listeners
 */
blacklistTextarea.addEventListener('blur', saveBlacklist);
document.addEventListener('DOMContentLoaded', loadBlacklist);
document.querySelectorAll("[data-link-to='shortcut-settings']").forEach(el => {
  el.addEventListener('click', openShortcutsPage);
});