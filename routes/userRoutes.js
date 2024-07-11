import express from "express";
import {
  getUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/create", createUser);
router.post("/login", loginUser);
router.put("/update", updateUser);
router.delete("/delete", deleteUser);
router.delete("/deleteall", deleteAllUsers);

export default router;
