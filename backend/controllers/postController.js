const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const fs = require("fs");

// @route POST api/posts
// @desc Create a post
// @access Private
const createPost = asyncHandler(async (req, res) => {
  const { title, content, username, categories } = req.body;

  // Check if image is provided
  if (req.file) {
    const post = new Post({
      title,
      content,
      image: {
        data: fs.readFileSync("uploads/" + req.file.filename),
        contentType: req.file.mimetype,
      },
      username,
      userId: req.user.id,
      categories: categories.split(",").map((category) => category.trim()),
    });

    const createdPost = await post.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: {
        ...createdPost._doc,
        image: {
          data: createdPost.image.data.toString("base64"),
          contentType: createdPost.image.contentType,
        },
      },
    });
  } else {
    const post = new Post({
      title,
      content,
      username,
      userId: req.user.id,
      categories,
    });

    const createdPost = await post.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: {
        ...createdPost._doc,
        image: {
          data: "",
          contentType: "",
        },
      },
    });
  }
});

// @route GET api/posts
// @desc Get all posts
// @access Private
const getPosts = asyncHandler(async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      });
    } else {
      posts = await Post.find();
    }
    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",

      posts: posts.map((post) => {
        return {
          ...post._doc,
          image: {
            data: post?.image?.data?.toString("base64"),
            contentType: post?.image?.contentType,
          },
        };
      }),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route GET api/posts/:id
// @desc Get a post
// @access Private
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.status(200).json({
      success: true,
      message: "Post found",
      post: {
        ...post._doc,
        image: {
          data: post?.image?.data?.toString("base64"),
          contentType: post?.image?.contentType,
        },
      },
    });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

// @route PUT api/posts/:id
// @desc Update a post
// @access Private
const updatePost = asyncHandler(async (req, res) => {
  const { title, content, image, categories, username } = req.body;
  const post = await Post.findById(req.params.id);
  if (post) {
    post.title = title || post.title;
    post.content = content || post.content;
    post.image = image || post.image;
    post.categories =
      categories.split(",").map((category) => category.trim()) ||
      post.categories;
    post.username = username || post.username;
    const updatedPost = await post.save();
    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: {
        ...updatedPost._doc,
        image: updatedPost.image.data.toString("base64"),
      },
    });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

// @route DELETE api/posts/:id
// @desc Delete a post
// @access Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    await post.remove();
    res.status(200).json({
      success: true,
      message: "Post removed successfully",
    });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};
