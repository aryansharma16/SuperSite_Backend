const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMiddleWare");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers); //router.route('/').get(allUsers)

router.post("/login", authUser);

module.exports = router;
