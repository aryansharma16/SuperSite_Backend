const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const validRoles = ["teacher", "student", "admin"];

const userModel = mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, unique: true },
    password: { type: String, trim: true },
    role: {
      type: String,
      enum: validRoles
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  {
    timeStamps: true,
  }
);
 // adding the methods for this Model schema
userModel.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// this is middleware this will execute before the save of the model it will encrypt the password before saving in database
userModel.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  const salt = await bcrypt.genSalt(10); // higher the salt number more stronger the password will
  // now hash the password the password with this salt
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userModel);

module.exports = User;
