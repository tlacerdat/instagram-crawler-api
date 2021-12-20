const auth = require("../middleware/auth");
const CrawlerController = require("../controllers/CrawlerController");

module.exports = (app) => {
  app.get("/feed-info/:username", auth, CrawlerController.getInstaDataByUsername);
};
