import express from "express";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";

const router = express.Router();

router.post("/create", createTodo);
router.get("/getall", getTodos);
router.put("/update", updateTodo);
router.delete("/delete", deleteTodo);

export default router;
