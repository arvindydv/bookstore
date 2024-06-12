import { Router } from "express";
import { addBook, getBooksByCategory, suggestBooksByBudget } from "../controllers/book.controller.js";

const router = Router();

router.route("/add-book").post(addBook);
router.route("/category/:name").get(getBooksByCategory);
router.route("/suggest").get(suggestBooksByBudget);

export default router;
