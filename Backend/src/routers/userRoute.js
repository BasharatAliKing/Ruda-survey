import express from "express";
import {
  register,
  login,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
} from "../controllers/userController.js";
const route = express();
//**********************************************//
// Register User route
//**********************************************//
route.post("/register", register);
//**********************************************//
// Login User route
//**********************************************//
route.post("/login", login);
//**********************************************//
// GET All Users route
//**********************************************//
route.get("/users", getAllUsers);
//**********************************************//
// GET User By ID route
//**********************************************//
route.get("/user/:id", getUserById);
//**********************************************//
// DELETE User By ID route
//**********************************************//
route.delete("/user/:id", deleteUserById);
//**********************************************//
// Update User By ID route
//**********************************************//
route.put("/user/:id", updateUserById);

export default route;
