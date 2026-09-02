import mongoose from "mongoose";

// shcema
const userSchema = new mongoose.Schema({
    user_name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
     //   unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"user",
        enum:["user","admin"],
    },
});

// model
const User = mongoose.model("user",userSchema);

export default User;