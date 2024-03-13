const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { genrateToken } = require("../config/genrateToken");

// register user for first time Controller
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All the Feilds!");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: genrateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

// login Controller
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: genrateToken(user._id),
      message: "User Loged In",
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email Or Password");
  }
});

// This is a logical operator in MongoDB that performs a logical OR operation on an array of expressions.
// It returns true if at least one of the expressions is true. In this case,
//there are two expressions within the array.
// ----------- get all users  ----------  //
//  /api/user?search=piyush
const allUsers = asyncHandler(async (req, res) => {
  console.log("After Next middleware protect", req.user);
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  console.log(keyword, "keywordss");
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }); // this will return all the users according the search expect the current user
  res.send(users);
});
module.exports = {
  registerUser,
  authUser,
  allUsers,
};
