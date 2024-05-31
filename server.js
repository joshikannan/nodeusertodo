import express from "express"; // import express
import bcrypt from "bcrypt"; // to hash and salt the password
import dotenv from "dotenv"; // access ids in .env file
import mongoose from "mongoose";
import cors from "cors";
const app = express(); // use express in our app
app.use(express.json()); // Middleware to parse JSON  // use json in our app
dotenv.config(); // Load environment variables from .env file

app.use(cors());

// =========================================================== || todo schema || ===========================================================

// Define todo schema
const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // user id
  },
  { timestamps: true }
);

// Create Todo model
const Todo = mongoose.model("Todo", todoSchema);

// =========================================================== || User schema || ===========================================================

// User Scheme
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, required: true },
  todos: { type: mongoose.Schema.Types.ObjectId, ref: "Todo" }, // todo id
});

// Create User model
const User = mongoose.model("User", userSchema);
// const users = []; // must store data in database // on every reload of server,  users became empty

app.get("/", (req, res) => {
  res.json({ message: "" });
});

// =========================================================== || user routes || ===========================================================
//GET route to getallusers list
app.get("/users", async (req, res) => {
  // res.json(users);
  // instead of getting users data from above array get data from database

  try {
    const users = await User.find(); // Fetch all users from the database
    res.json({ status: 200, message: "Successfull", users: users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// POST route to create user
app.post("/user/create", async (req, res) => {
  try {
    // const salt = await bcrypt.genSalt(); // generate a salt with 10 rounds
    // const hashedPassword = await bcrypt.hash(req.body.password, salt); // hash the password with the salt
    //  console.log("salt", salt);
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // bcrypt can make hash and salt in single step // above 1st 2 lines in single line
    console.log("hashedPassword", hashedPassword);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    }); // create user object with hashed password
    // users.push(user); // add new user to users array in this page
    await user.save(); // Save the user to the database instead of saving it in local users array
    res
      .status(201)
      .json({ status: 201, message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error creating user",
      error: err.message,
    });
  }
});

// POST route to authenticate (login user ) a user
app.post("/user/login", async (req, res) => {
  // const user = users.find((user) => user.email === req.body.email); // find if user in users array
  // if (!user) return res.status(400).json({ message: "User Not Found" });
  try {
    const user = await User.findOne({ email: req.body.email }); // find if user in users collection in logindb
    if (!user) res.status(400).json({ status: 400, message: "User Not Found" });

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isValidPassword) {
      res
        .status(200)
        .json({ status: 200, message: "Login Successful", user: user });
    } else {
      res.status(401).json({ status: 401, message: "Incorrect Password" });
    }
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
});

// PUT route // update the users
// The $set operator ensures that only the specified fields are modified. and remaining are unchanged
app.put("/user/update", async (req, res) => {
  try {
    const { email } = req.query; //The user's email is retrieved from the query parameters
    const updateData = req.body;
    // const user = await User.findOne({ email });
    const user = await User.findOneAndUpdate(
      { email }, // filter by email
      { $set: updateData }, // by using $set only update the specified feild
      { new: true } // This option returns the updated document,  it updates in User model too
    );

    if (!user)
      res.status(401).json({
        status: 401,
        message: "User Not Found",
      });

    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      updateduser: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error updating user",
      error: err.message,
    });
  }
});

// DELETE route to delete a user
app.delete("/user/delete", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ status: 404, message: "User Not Found" });
    }
    res
      .status(200)
      .json({ status: 200, message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
});

// DELETE route to delete all users
app.delete("/users/deleteall", async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.status(200).json({
      status: 200,
      message: "All users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error deleting users",
      error: err.message,
    });
  }
});

// =========================================================== || todo routes || ===========================================================

// POST route // create todo
app.post("/todo/create", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }); // 1st verify user, then add todo to that user // use id insted od email if frontend build
    if (!user)
      return res.status(400).json({ status: 400, message: "User Not Found" });

    // create to do based on Todo Schema
    const todo = new Todo({
      title: req.body.title,
      description: req.body.description,
      user: user._id, // info of user
    });

    await todo.save(); // saved in todo model

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
});

//get route  get todo of specific user by mailid // better use user id for later
// http://localhost:5000/gettodos/?email=vishwa@gmail.com // structure of routes
app.get("/todos/getall", async (req, res) => {
  try {
    const { email } = await req.query; // Extract email from the query parameters
    console.log("email", email);
    const user = await User.findOne({ email: email });
    if (!user) res.status(400).json({ status: 400, message: "User Not Found" });

    const todos = await Todo.find({ user: user._id }); // Find todos with user's ID
    res.status(200).json({
      status: 200,
      message: "Todos retrieved successfully",
      user: user,
      todos: todos,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error retrieving Todos",
      error: err.message,
    });
  }
});

// PUT route Update the todo
app.put("/todo/update", async (req, res) => {
  try {
    const { todoid } = req.query;
    const updateData = req.body;
    const todo = await Todo.findOneAndUpdate(
      { _id: todoid }, // filter by id
      { $set: updateData }, // Update: set the fields provided in updateData
      { new: true } // Options: return the updated document , it updates in Todo model too
    );
    if (!todo)
      res.status(401).json({
        status: 404,
        message: "Todo Not Found",
      });
    res.status(200).json({
      status: 200,
      message: "Todo updated successfully",
      todo,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error updating todo",
      error: err.message,
    });
  }
});

// DELETE route to delete a todo
app.delete("/todo/delete", async (req, res) => {
  try {
    const { todoid } = req.query;
    console.log("todoid", todoid);
    const todo = await Todo.findOneAndDelete({ _id: todoid });
    if (!todo) {
      return res
        .status(404)
        .json({ status: 404, message: "Todo Not Found ,check todo  id" });
    }
    res
      .status(200)
      .json({ status: 200, message: "Todo deleted successfully", todo });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
});

// Define the port where the server will run
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//mongo db connection
const MONGODB_URL = process.env.MONGODB_URL;
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("dbconnected succesfully");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
