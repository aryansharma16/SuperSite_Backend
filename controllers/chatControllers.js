const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// To access the chat with particular user or if not avliable then create
const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body; // if ther is chat with of Login user  this userID then show otherwise create new chat with this id
  //console.log("AfterNextaccessChat", req);
  if (!userId) {
    console.log("UserId Param not sent with request");

    return res.sendStatus(400);
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      // both should true
      { users: { $elemMatch: { $eq: req.user._id } } }, // current login user
      { users: { $elemMatch: { $eq: userId } } }, // user with chat
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  console.log("chatt11", isChat, "chattt1");
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  console.log("chatt11", isChat[0], "chattt1");

  if (isChat.length > 0) {
    res.send(isChat[0]); // if chat is present between users show
  } else {
    // otherwise create new chat between them
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      console.log("FullChat....", FullChat, "..FullChat...");

      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
// to access all the chats that current user has started
const fetchChat = expressAsyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        // console.log("total chats a user have with other users...--", results);
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// this will create group useing name and users list
const createGroupChat = expressAsyncHandler(async (req, res) => {
  // create Group using the Group name and the list of the users we mant to add
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the Feilds" });
  }
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More Than 2 users required to form a group chat");
  }
  users.push(req.user); // current login user will always part of the group when login user will create group he will the be the part of the group
  try {
    var groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user, // current user will be the admin of the group
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//  rename the particular group
const renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});
// add user to the group
const addToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Not Added in Group");
  } else {
    res.json(added);
  }
});

// now remove from the Group
const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Not removed from Group");
  } else {
    res.json(removed);
  }
});
module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
