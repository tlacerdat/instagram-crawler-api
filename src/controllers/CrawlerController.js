require("dotenv").config();
const puppeteer = require("puppeteer");

let browser;
let allDone = false;
exports.getInstaDataByUsername = async (req, res, next) => {
  const { username } = await req.params;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir: "./myUserDataDir",
      args: ["--lang=en-US,en", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    allDone = false;
  }

  const page = await browser.newPage();

  // Forcing browser to use english as language
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en",
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "language", {
      get: function () {
        return "en-US";
      },
    });
    Object.defineProperty(navigator, "languages", {
      get: function () {
        return ["en-US", "en"];
      },
    });
  });
  // Forcing browser to use english as language

  if (!allDone) {
    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(2000);
    const url = await page.evaluate(() => window.location.href);

    if (url.includes("/login")) {
      // Waiting inputs and submit button

      await Promise.all([
        page.waitForSelector('[name="username"]', { visible: true }),
        page.waitForSelector('[name="password"]', { visible: true }),
        page.waitForSelector('[type="submit"]', { visible: true }),
      ]);

      await page.click('[name="username"]');
      await page.type('[name="username"]', process.env.INSTA_USER);

      await page.click('[name="password"]');
      await page.type('[name="password"]', process.env.INSTA_USER_PASS);

      await page.click('[type="submit"]');
      await page.waitForTimeout(5000);

      // Saving session
      try {
        const buttonSaveLoginInfo = await page.waitForXPath('//button[contains(text(), "Save Info")]', {
          timeout: 15000,
        });
        await buttonSaveLoginInfo.click();
        await page.waitForTimeout(5000);
      } catch (error) {
        console.log("Alert: 'Save info' didn't appear.");
      }

      // Notifications
      try {
        const notNowBtn = await page.waitForXPath('//button[contains(text(), "Not Now")]', {
          timeout: 5000,
        });
        await notNowBtn.click();
      } catch (error) {
        console.log("Alert: 'Turn On Notifications' didn't appear.");
      }
    }
  }

  await page.goto("https://www.instagram.com/" + username + "/?__a=1", {
    waitUntil: "networkidle2",
  });
  allDone = true;
  await page.waitForTimeout(500);

  await page.waitForSelector("body pre");
  const graphQlContent = await page.evaluate(() => document.querySelector("body pre").textContent);
  await page.waitForTimeout(250);
  await page.close();
  // await browser.close();
  console.log("Done, user: " + username);

  if (graphQlContent && graphQlContent.length > 0) {
    await res.status(200).send(graphQlContent);
  } else {
    await res.status(400).json({
      message: "Exec error",
    });
  }
};
