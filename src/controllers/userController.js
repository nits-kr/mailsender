const mongoose = require("mongoose");
const axios = require("axios");

const User = require("../models/User");
const {
  userLoginSchema,
  userCreateSchema,
  userUpdateSchema,
} = require("../utils/validators");
const generateToken = require("../utils/generateToken");

const isAdminUser = (user) => user && user.designation === "Admin";

const normalizeStatus = (status) => (String(status) === "0" ? "0" : "1");

const normalizeHeaderAccess = (value, fallback = "0") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value) === "1" ? "1" : "0";
};

const findUserByIdentifier = async (identifier) => {
  if (mongoose.isValidObjectId(identifier)) {
    const byObjectId = await User.findById(identifier);
    if (byObjectId) {
      return byObjectId;
    }
  }

  const numericId = Number(identifier);
  if (Number.isFinite(numericId)) {
    return User.findOne({ id: numericId });
  }

  return null;
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const query = isAdminUser(req.user) ? {} : { id: req.user.id };
    const users = await User.find(query).sort({ id: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    userCreateSchema.parse(req.body);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: error.errors });
  }

  const {
    name,
    email,
    password,
    designation,
    status,
    header_acces,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? lastUser.id + 1 : 1;

    const user = await User.create({
      id: nextId,
      name,
      email,
      password,
      designation,
      status: normalizeStatus(status),
      header_acces: normalizeHeaderAccess(header_acces),
    });

    res.status(201).json(user);
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

  const b64_uemail = Buffer.from(uemail).toString("base64");
  const b64_password = Buffer.from(password).toString("base64");

  try {
    const authUrl = `http://173.249.50.153/admin/autheticate.php?username=${b64_uemail}&password=${b64_password}`;
    const response = await axios.get(authUrl);
    let cred = response.data;

    if (typeof cred !== "string" && cred.data) {
      cred = cred.data;
    } else if (typeof cred !== "string") {
      cred = String(cred);
    }
    cred = cred.trim();

    if (cred === "|||||" || !cred || cred.includes("html")) {
      const localUser = await User.findOne({
        email: uemail,
        password: password,
      });
      if (localUser) {
        return res.json({
          _id: localUser._id,
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          designation: localUser.designation,
          status: localUser.status,
          header_acces: localUser.header_acces || "0",
          token: generateToken(localUser._id),
        });
      }
      return res.status(401).json({ message: "Invalid Details" });
    }

    const credn = cred.split("|");
    const id = parseInt(credn[0], 10);
    const username = credn[1];
    const name = credn[2];
    const designation = credn[3];
    const status = credn[5] ? credn[5].trim() : "0";

    if (status !== "1") {
      return res.status(403).json({ message: "Blocked" });
    }

    let user = await User.findOne({ email: uemail });
    if (!user) {
      const lastUser = await User.findOne().sort({ id: -1 });
      const nextId = lastUser ? lastUser.id + 1 : 1;

      user = await User.create({
        id: Number.isNaN(id) ? nextId : id,
        name: name || username || "Unknown",
        email: uemail,
        password: password,
        designation: designation || "Admin",
        status: normalizeStatus(status),
        header_acces: "0",
      });
    } else {
      user.name = name || username || user.name;
      user.designation = designation || user.designation;
      user.status = normalizeStatus(status);
      if (!user.header_acces) {
        user.header_acces = "0";
      }
      await user.save();
    }

    res.json({
      _id: user._id,
      id: user.id,
      name: user.name,
      email: user.email,
      designation: user.designation,
      status: user.status,
      header_acces: user.header_acces || "0",
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
// @access  Private
const updateUser = async (req, res) => {
  try {
    userUpdateSchema.parse(req.body);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: error.errors });
  }

  try {
    const user = await findUserByIdentifier(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = isAdminUser(req.user);
    const isSelf = String(user._id) === String(req.user._id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (isAdmin) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.designation = req.body.designation || user.designation;
      user.status =
        req.body.status !== undefined
          ? normalizeStatus(req.body.status)
          : user.status;
      user.header_acces = normalizeHeaderAccess(
        req.body.header_acces,
        user.header_acces || "0",
      );
    }

    if (req.body.password !== undefined && req.body.password !== "") {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const user = await findUserByIdentifier(req.params.id);

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
