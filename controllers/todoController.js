import Todo from "../models/Todo.js";
import User from "../models/User.js";

export const createTodo = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({ status: 400, message: "User Not Found" });

    const todo = new Todo({
      title: req.body.title,
      description: req.body.description,
      user: user._id,
    });
    await todo.save();
    res
      .status(201)
      .json({ status: 201, message: "To-Do created successfully", todo });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error creating To-Do",
      error: err.message,
    });
  }
};

export const getTodos = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ status: 400, message: "User Not Found" });

    const todos = await Todo.find({ user: user._id });
    res.status(200).json({
      status: 200,
      message: "Todos retrieved successfully",
      user,
      todos,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error retrieving Todos",
      error: err.message,
    });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { todoid } = req.query;
    const updateData = req.body;
    const todo = await Todo.findOneAndUpdate(
      { _id: todoid },
      { $set: updateData },
      { new: true }
    );

    if (!todo) res.status(401).json({ status: 404, message: "Todo Not Found" });

    res
      .status(200)
      .json({ status: 200, message: "Todo updated successfully", todo });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error updating todo",
      error: err.message,
    });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { todoid } = req.query;
    const todo = await Todo.findOneAndDelete({ _id: todoid });
    if (!todo)
      return res
        .status(404)
        .json({ status: 404, message: "Todo Not Found, check todo id" });

    res
      .status(200)
      .json({ status: 200, message: "Todo deleted successfully", todo });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};
