const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

// @route POST api/category
// @desc Create a category
// @access Private
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const newCategory = new Category({
    name,
  });

  const category = await newCategory.save();
  res.status(200).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

// @route GET api/category
// @desc Get all categories
// @access Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    categories,
  });
});

module.exports = { createCategory, getCategories };
