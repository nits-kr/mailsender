const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  // In the PHP version, passwords are base64 encoded.
  // We will handle that transition in the auth logic.
  return enteredPassword === this.password;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
