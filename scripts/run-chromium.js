const { chromium } = require('@playwright/test');

(async () => {
  console.log("Launching Chromium in headed mode…");

  const browser = await chromium.launch({
    headless: false
  });

  console.log("Chromium Launched. Waiting 5 seconds…");

  // Keep the browser open
  await new Promise(r => setTimeout(r, 5000));

  await browser.close();
  console.log("Closed.");
})();
