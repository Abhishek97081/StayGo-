const express = require("express");
const router = express.Router();
const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.renderLoginForm);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  userController.login
);

// Logout routes
router.get("/logout", userController.logout);
router.delete("/logout", userController.logout);

module.exports = router;