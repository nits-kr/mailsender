const User = require("../models/User");
const { userLoginSchema } = require("../utils/validators");
const generateToken = require("../utils/generateToken");
const axios = require("axios");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ id: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { name, email, password, designation, status } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Get the latest ID
    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? lastUser.id + 1 : 1;

    const user = await User.create({
      id: nextId,
      name,
      email,
      password, // Note: In production, use bcrypt. Moving existing base64 for now for parity.
      designation,
      status: status || "1",
    });

    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
};

const authUser = async (req, res) => {
  try {
    userLoginSchema.parse(req.body);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: error.errors });
  }

  const { uemail, password } = req.body;

  // Base64 encode credentials as required by the legacy PHP API
  const b64_uemail = Buffer.from(uemail).toString("base64");
  const b64_password = Buffer.from(password).toString("base64");

  try {
    const authUrl = `http://173.249.50.153/admin/autheticate.php?username=${b64_uemail}&password=${b64_password}`;
    const response = await axios.get(authUrl);
    let cred = response.data;

    // Handle string or object responses defensively
    if (typeof cred !== "string" && cred.data) {
      cred = cred.data; // Sometimes axios wraps text
    } else if (typeof cred !== "string") {
      cred = String(cred);
    }
    cred = cred.trim();

    if (cred === "|||||") {
      return res.status(401).json({ message: "Invalid Details" });
    }

    const credn = cred.split("|");
    const id = parseInt(credn[0], 10);
    const username = credn[1];
    const name = credn[2];
    const designation = credn[3];
    // external password is credn[4]
    const status = credn[5] ? credn[5].trim() : "0";

    if (status !== "1") {
      return res.status(403).json({ message: "Blocked" });
    }

    // Upsert user in local DB to keep routes functioning completely
    let user = await User.findOne({ email: uemail });
    if (!user) {
      // Find latest ID if API didn't provide a reliable one
      const lastUser = await User.findOne().sort({ id: -1 });
      const nextId = lastUser ? lastUser.id + 1 : 1;

      user = await User.create({
        id: isNaN(id) ? nextId : id,
        name: name || username || "Unknown",
        email: uemail,
        password: password, // Base64 encoding handled ad-hoc or standard bcrypt if desired later, but right now we bypass local auth.
        designation: designation || "Admin",
        status: status,
      });
    } else {
      user.name = name || username || user.name;
      user.designation = designation || user.designation;
      user.status = status;
      await user.save();
    }

    res.json({
      _id: user._id,
      id: user.id,
      name: user.name,
      email: user.email,
      designation: user.designation,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Authentication Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.designation = req.body.designation || user.designation;
      user.status = req.body.status || user.status;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });

    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

module.exports = {
  authUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
