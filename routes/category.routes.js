import { Router } from "express";
import {
  createCategory,
  getAllCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.route("/category").post(createCategory);
router.route("/categories").get(getAllCategory);

export default router;
