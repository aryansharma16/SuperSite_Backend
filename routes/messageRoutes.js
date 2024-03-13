const express = require("express");
const { protect } = require("../middlewares/authMiddleWare");
const { sendMessage, allMessages } = require("../controllers/messageControllers");
const router = express.Router();


router.route('/').post(protect , sendMessage)      // to send message to user to user
router.route('/:chatId').get(protect , allMessages)   // get all the messages of perticular chat 


module.exports = router;
