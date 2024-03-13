const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passedd into Request");
    return res.sendStatus(400);
  }

  // create new message
  var newMessage = {
    sender: req.user._id, // logged in used id from middleware next
    content: content, // from the req.body
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    // now populate senders name and pic
    message = await message.populate("sender", "name pic");
    // now populate senders chat of this message al the caht
    message = await message.populate("chat");
    // now populate all the users in this chat
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    // now update lastest message every time with new message
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    console.log(
      " Error from send message --",
      error,
      " Error from send message --"
    );
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
module.exports = { sendMessage, allMessages };
