import mongoose from "mongoose";

// shcema
const userSchema = new mongoose.Schema({
    user_name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
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
}, { timestamps: true });

userSchema.index({ email: 1 });

// model
const User = mongoose.model("user",userSchema);

export default User;