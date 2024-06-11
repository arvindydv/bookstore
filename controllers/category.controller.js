import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create categories
const createCategory = asyncHandler(async (req, res) => {
  const payload = req.body;

  if (!payload.name) {
    return res.status(400).json(new ApiResponse(400, {}, "Name is required"));
  }

  const findCategory = await Category.findOne({
    name: payload.name,
  });

  if (findCategory) {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "Category is already exists"));
  }

  const category = await Category.create(payload);
  return res
    .status(201)
    .json(new ApiResponse(201, category, "category created"));
});

const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "all categories retrieved"));
});

export { createCategory, getAllCategory };
