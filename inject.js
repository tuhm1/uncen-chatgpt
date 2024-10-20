const script = document.createElement("script");
script.src = chrome.runtime.getURL("intercept.js");
document.documentElement.appendChild(script);
