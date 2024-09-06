import { defaultBlacklist } from "./constants/blacklist.mjs";
import { convertToRegex, convertToDomain } from "./utils/regex.mjs";

let blacklist = [];
let killedTabUrls = [];

/**
 * Closes blacklisted tabs
 */
const closeBlacklistedTabs = () => {
  if (!blacklist) 
    return;

  chrome.tabs.query({}, function (tabs) {
    const tabsToClose = tabs.filter((tab) => 
      blacklist.some((domainRegex) => new RegExp(domainRegex).test(tab.url))
    );

    const tabIds = tabsToClose.map(tab => tab.id);    
    killedTabUrls = tabsToClose.map(tab => tab.url);
    chrome.tabs.remove(tabIds);
  });
}

/**
* Opens previously closed blacklisted tabs
*/
const openKilledTabs = () => {
  killedTabUrls.forEach((url) => chrome.tabs.create({ url }))
  killedTabUrls = [];
}

/**
 * Set blacklist
 */
const setBlacklist = (newBlacklist) => {
  const blacklistArray = newBlacklist.map(domain => convertToRegex(domain));

  chrome.storage.sync.set({ blacklist: blacklistArray });
}

/**
 * Get blacklist
 */
const getBlacklist = (sendResponse, domainsAsRegex) => {
  // Return as regex
  if (domainsAsRegex)
    return sendResponse({ blacklist })

  // Return domains as strings
  const blacklistedDomains = blacklist.map(domain => convertToDomain(domain));
  sendResponse({ blacklist: blacklistedDomains })
}

/**
 * Checks if a domain is blacklisted
 */
const isBlacklisted = (sendResponse, domainToCheck) => {
  const isBlacklisted = blacklist.some((domain) => new RegExp(domain).test(domainToCheck));

  sendResponse({ isBlacklisted })
}

/**
 * Adds domain to blacklist
 */
const toggleBlacklistedDomain = (domain) => {
  const isBlacklisted = blacklist.some((regex) => new RegExp(regex).test(domain));

  // Add or remove domain from blacklist
  if (isBlacklisted) {
    blacklist = blacklist.filter(domain => domain && !new RegExp(domain).test(domain));
  } else {
    const regexDomain = convertToRegex(domain);
    blacklist.push(regexDomain);
  }

  chrome.storage.sync.set({ blacklist });
}

/**
 * Handles keyboard shortcuts of the extension
 */
const shortcutHandler = (command) => {
  switch (command) {
    case "kill-switch":
      closeBlacklistedTabs();
      break;

    case "undo-kill-switch":
      openKilledTabs();
      break;

    default:
      break;
  }
}

/**
 * Handles messaging from other parts of the extension
 */
const messageHandler = (request, sender, sendResponse) => {
  switch (request.command) {
    case "kill-switch":
      closeBlacklistedTabs();
      break;

    case "undo-kill-switch":
      openKilledTabs();
      break;

    case "get-blacklist":
      getBlacklist(sendResponse, request.domainsAsRegex);
      break;

    case "set-blacklist":
      setBlacklist(request.blacklist);
      break;

    case "is-blacklisted":
      isBlacklisted(sendResponse, request.domain);
      break;

    case "toggle-blacklisted-domain":
      toggleBlacklistedDomain(request.domain)
      break;

    default:
      break;
  }
}

/**
 * Handles storage change
 */
const storageChangeHandler = (changes, namespace) => {
  for (let [key, { newValue }] of Object.entries(changes)) {
    if (key === "blacklist")
      blacklist = newValue;
  }
}

/**
 * Handles installation 
 */
const onInstalledHandler = () => {
  setBlacklist(defaultBlacklist);
}

/**
 * Initialize listeners & blacklist
 */
chrome.commands.onCommand.addListener(shortcutHandler);
chrome.runtime.onMessage.addListener(messageHandler);
chrome.storage.onChanged.addListener(storageChangeHandler);
chrome.runtime.onInstalled.addListener(onInstalledHandler);
chrome.storage.sync.get(["blacklist"], (result) => {
  blacklist = result.blacklist || [];
});
