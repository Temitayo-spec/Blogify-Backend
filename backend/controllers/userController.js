// const express = require("express");
// const router = express.Router();
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const bcrypt = require("bcrypt");
const fs = require("fs");

// Genrate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST api/auth/login
// @desc    Login user / Returning JWT token
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide an email and password");
  }

  // Check for existing user
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exist");
  }

  // Validate password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  if (user) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        ...user._doc,
        profile: {
          data: user.profile.data.toString("base64"),
          contentType: user.profile.contentType,
        },
      },
      token: generateToken(user._id),
    });
  }
});

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  // hashing the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // check if profile image is provided
  if (req.file) {
    const user = new User({
      name,
      email,
      password: passwordHash,
      profile: {
        data: fs.readFileSync("upload/" + req.file.filename),
        contentType: req.file.mimetype,
      },
    });

    const createdUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...createdUser._doc,
        profile: {
          data: createdUser.profile.data.toString("base64"),
          contentType: createdUser.profile.contentType,
        },
      },
      token: generateToken(createdUser._id),
    });
  } else {
    const user = new User({
      name,
      email,
      password: passwordHash,
    });

    const createdUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...createdUser._doc,
        profile: {
          data: "",
          contentType: "",
        },
      },
    });
  }
});

// @route PUT api/auth/update
// @desc Update user details
// @access Private
const update = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // check if profile image is provided
  if (req.file) {
    const user = await User.findById(req.user.id);

    // check if user is found
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // check if user is updating their own profile
    if (user.id !== req.user.id) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.password = password || user.password;
      user.profile = {
        data: fs.readFileSync("upload/" + req.file.filename),
        contentType: req.file.mimetype,
      };

      // change the username on post made by user
      await Post.updateMany(
        { userId: req.user._id },
        { $set: { username: user.name } }
      );

      const updatedUser = await user.save();

      res.status(201).json({
        success: true,
        message: "User updated successfully",
        user: {
          ...updatedUser._doc,
          profile: {
            data: updatedUser.profile.data.toString("base64"),
            contentType: updatedUser.profile.contentType,
          },
        },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } else {
    const user = await User.findById(req.user.id);

    // check if user is found
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // check if user is updating their own profile
    if (user.id !== req.user.id) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.password = password || user.password;

      // change the username on post made by user
      await Post.updateMany(
        { userId: req.user._id },
        { $set: { "username": user.name } }
      );

      const updatedUser = await user.save();

      res.status(201).json({
        success: true,
        message: "User updated successfully",
        user: {
          ...updatedUser._doc,
          profile: {
            data: "",
            contentType: "",
          },
        },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  }
});

// @route DELETE api/auth/delete/:id
// @desc Delete user
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user && user._id.toString() === req.user.id.toString()) {
    try {
      await Post.deleteMany({ username: user.username });
    } catch (error) {
      res.status(500);
      throw new Error("Something went wrong");
    }
    await user.remove();
    res.json({ message: "User removed successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @route GET api/auth/user
// @desc Get user data
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (user.profile.data !== "") {
    res.json({
      success: true,
      user: {
        ...user._doc,
        profile: {
          data: user.profile.data.toString("base64"),
          contentType: user.profile.contentType,
        },
      },
    });
  } else {
    res.json({
      success: true,
      user: {
        ...user._doc,
        profile: {
          data: "",
          contentType: "",
        },
      },
    });
  }
});

module.exports = {
  register,
  login,
  update,
  deleteUser,
  getUser,
};
