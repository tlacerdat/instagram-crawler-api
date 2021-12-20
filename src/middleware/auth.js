require("dotenv").config();

function isAuthorized(req, res, next) {
  const { token } = req.headers;

  if (!token || token !== process.env.TOKEN) {
    console.log("Unauthorized");
    return res.status(401).json({
      error: "Unauthorized",
    });
  }
  return next();
}

module.exports = isAuthorized;
