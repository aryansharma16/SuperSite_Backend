const express = require("express");
const { protect } = require("../middlewares/authMiddleWare");
const {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router(); // setup router

router.route("/").post(protect, accessChat); //  use to accessing and creating the chat // if the user is not logedin he can not access the chat
router.route("/").get(protect, fetchChat); // will get all the chats for particular user

router.route("/group").post(protect, createGroupChat); // to create group chat
router.route("/rename").put(protect, renameGroup); // rename the name of gorup
router.route("/groupRemove").put(protect, removeFromGroup); // remove from group or left the group
router.route("/groupadd").put(protect, addToGroup); // remove from group or left the group

module.exports = router;
