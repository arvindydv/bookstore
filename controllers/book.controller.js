import { Book } from "../models/book.model.js";
import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// add book
const addBook = asyncHandler(async (req, res) => {
  const payload = req.body;

  if (
    !payload.title ||
    !payload.author ||
    !payload.price ||
    !payload.publishedDate ||
    !payload.category
  ) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "Title, author, price, category and publishedDate are required"
        )
      );
  }

  const findCategory = await Category.findOne({
    name: payload.category,
  });

  if (!findCategory) {
    return res.status(404).json(new ApiResponse(404, {}, "Category not found"));
  }
  payload.category = findCategory._id;
  const book = await Book.create(payload);
  return res
    .status(201)
    .json(new ApiResponse(201, book, "book added successfully"));
});

// retrive all books based on category
const getBooksByCategory = asyncHandler(async (req, res) => {
  const { name } = req.params;

  const findCategory = await Category.findOne({ name: name });

  if (!findCategory) {
    return res.status(404).json(new ApiResponse(404, {}, "Category not found"));
  }

  const books = await Book.find({ category: findCategory._id }).populate(
    "category"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, books, "Books retrieved successfully"));
});


// retive all books based on budget
const suggestBooksByBudget = asyncHandler(async (req, res) => {
  const { budget, categories } = req.query;

  if (!budget || !categories) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Budget and categories are required"));
  }

  const budgetAmount = parseFloat(budget);
  const categoriesArray = categories.split(",");

  if (isNaN(budgetAmount) || categoriesArray.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Invalid budget or categories format"));
  }

  // Find category IDs for the given category names
  const categoryDocs = await Category.find({ name: { $in: categoriesArray } });
  const categoryIds = categoryDocs.map((category) => category._id);

  if (categoryIds.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Categories not found"));
  }

 // Find books within the budget and matching the categories
  const books = await Book.find({
    category: { $in: categoryIds },
    price: { $lte: budgetAmount },
  }).populate("category");

  return res
    .status(200)
    .json(new ApiResponse(200, books, "Books retrieved successfully"));
});

export { addBook, getBooksByCategory, suggestBooksByBudget };
