import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// 🔐 Generate Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//****************************************** */
// register user
//****************************************** */
export const register = async (req, res) => {
  try {
    const { user_name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: true, message: "User Already Exists" });
    }
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = {
      user_name,
      email,
      password: hashedPassword,
      role,
    };
    await User.create(user);
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: "User registered Successfully!",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
//****************************************** */
// Login  user
//****************************************** */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials !",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials !",
      });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: "User Logged In Successfully.",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//****************************************** */
// GET ALL Users
//****************************************** */

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "All Users Fetched Successfully.",
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
//****************************************** */
// GET ALL Users
//****************************************** */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json({
      success: true,
      message: "User Fetched Successfully.",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
//****************************************** */
// DELETE User by ID
//****************************************** */
export const deleteUserById = async (req,res)=>{
    try{
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        res.status(200).json({
            success:true,
            message:"User Deleted Successfully."
        });
    }catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
export const updateUserById = async (req,res)=>{
    try{
        const {id}= req.params;
        const user = req.body;
        const updatedUser = await User.findByIdAndUpdate(id,
             user,
          //  {new:true}
        )
        res.status(200).json({
            success:true,
            message:"User Updated Successfully.",
            user,
        });
    }catch(err){
         res.status(500).json({
            success:false,
            message:err.message
        })
    }
}