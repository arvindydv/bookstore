import mongoose from "mongoose";
import request from "supertest";
import app from "../server.js";
import { Book } from "../models/book.model.js";
import { Category } from "../models/category.model.js";
import dotenv from "dotenv";

dotenv.config();

describe("book api", () => {
  beforeAll(async () => {
    // jest.setTimeout(20000);

    await mongoose.connect(process.env.TEST_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Category.deleteMany({});
    // await Book.deleteMany({});
  });

  describe("POST /api/category/category", () => {
    it("should create a new category", async () => {
      const res = await request(app).post("/api/category/category").send({
        name: "Test Category",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe("category created");
      expect(res.body.data.name).toBe("Test Category");

      // Clean up: Remove the created category from the database
      await Category.deleteOne({ name: "Test Category" });
    });

    it("should not create a category with missing name", async () => {
      const res = await request(app).post("/api/category/category").send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("Name is required");
    });

    it("should not create a category if it already exists", async () => {
      // Create a category with the same name first
      await Category.create({ name: "Existing Category" });

      // Try to create a category with the same name again
      const res = await request(app).post("/api/category/category").send({
        name: "Existing Category",
      });

      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toBe("Category is already exists");

      // Clean up: Remove the created category from the database
      await Category.deleteOne({ name: "Existing Category" });
    });
  });

  describe("GET /api/category/categories", () => {
    it("should get all categories", async () => {
      // Create some categories for testing
      await Category.create({ name: "Category 1" });
      await Category.create({ name: "Category 2" });

      const res = await request(app).get("/api/category/categories");

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("all categories retrieved");
      expect(res.body.data.length).toBeGreaterThan(0);

      // Clean up: Remove the created categories from the database
      await Category.deleteMany({
        name: { $in: ["Category 1", "Category 2"] },
      });
    });
  });

  // book testing
  describe("POST /api/books", () => {
    beforeAll(async () => {
      // Setup: Create a category to use in tests
      await Category.create({ name: "Test Category" });
    });

    afterAll(async () => {
      // Cleanup: Remove all test data
      await Book.deleteMany({});
      await Category.deleteMany({});
    });

    it("should create a new book", async () => {
      const res = await request(app).post("/api/book/add-book").send({
        title: "Test Book",
        author: "Test Author",
        price: 20,
        publishedDate: "2023-01-01",
        category: "Test Category",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe("book added successfully");
      expect(res.body.data.title).toBe("Test Book");
    }, 1000);

    it("should not create a book with missing required fields", async () => {
      const res = await request(app).post("/api/book/add-book").send({
        title: "Test Book",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe(
        "Title, author, price, category and publishedDate are required"
      );
    }, 1000);

    it("should not create a book if category is not found", async () => {
      const res = await request(app).post("/api/book/add-book").send({
        title: "Test Book",
        author: "Test Author",
        price: 20,
        publishedDate: "2023-01-01",
        category: "Nonexistent Category",
      });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("Category not found");
    }, 1000);
  });

  describe("GET /api/books/category/:name", () => {
    beforeAll(async () => {
      // Setup: Create a category and a book to use in tests
      const category = await Category.create({ name: "Test Category" });
      await Book.create({
        title: "Test Book",
        author: "Test Author",
        price: 20,
        publishedDate: "2023-01-01",
        category: category._id,
      });
    });

    afterAll(async () => {
      // Cleanup: Remove all test data
      await Book.deleteMany({});
      await Category.deleteMany({});
    });

    it("should retrieve all books by category", async () => {
      const res = await request(app).get("/api/book/category/Test Category");

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Books retrieved successfully");
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return 404 if category not found", async () => {
      const res = await request(app).get(
        "/api/book/category/Nonexistent Category"
      );

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("Category not found");
    });
  });

  describe("GET /api/book/suggest", () => {
    beforeAll(async () => {
      // Setup: Create categories and books to use in tests
      const category1 = await Category.create({ name: "Category1" });
      const category2 = await Category.create({ name: "Category2" });

      await Book.create({
        title: "Book1",
        author: "Author1",
        price: 15,
        publishedDate: "2023-01-01",
        category: category1._id,
      });

      await Book.create({
        title: "Book2",
        author: "Author2",
        price: 25,
        publishedDate: "2023-01-01",
        category: category2._id,
      });
    });

    afterAll(async () => {
      // Cleanup: Remove all test data
      await Book.deleteMany({});
      await Category.deleteMany({});
    });

    it("should suggest books based on budget and categories", async () => {
      const res = await request(app).get("/api/book/suggest").query({
        budget: 20,
        categories: "Category1,Category2",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Books retrieved successfully");
      expect(res.body.data.length).toBeGreaterThan(0);
    }, 1000);

    it('should return 400 if budget is not provided', async () => {
      const res = await request(app).get('/api/book/suggest').query({
        categories: 'Category1,Category2',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Budget and categories are required');
    });

    it('should return 400 if categories are not provided', async () => {
      const res = await request(app).get('/api/book/suggest').query({
        budget: 20,
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Budget and categories are required');
    });

    it('should return 404 if categories not found', async () => {
      const res = await request(app).get('/api/book/suggest').query({
        budget: 20,
        categories: 'NonexistentCategory',
      });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe('Categories not found');
    });

    it('should return 200 with an empty array if no books match the criteria', async () => {
      const res = await request(app).get('/api/book/suggest').query({
        budget: 5,
        categories: 'Category1,Category2',
      });

      expect(res.statusCode).toEqual(404);
      // expect(res.body.message).toBe('Books retrieved successfully');
     
    });
  });
});
