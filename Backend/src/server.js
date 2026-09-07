import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
// import routes from routes folders
import userRoute from "./routers/userRoute.js";
import surveyRoute from "./routers/surveyRouter.js"; 

const MONGO_URI =
  process.env.MONGO_URI 

const allowedOrigins = [
  "https://ruda-survay.nespakprogresscenter.com",
  "https://api.ruda-surv.nespakprogresscenter.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// Middleware
app.use(morgan("dev")); 
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use("/images", express.static("public/images"));
app.use("/excel", express.static("public/excel"));
   
// Routes 
app.use("/api", userRoute);
app.use("/api", surveyRoute);
 
// Example route
app.get("/", (req,res)=>{
    res.status(200).json({
        success:true,
        json:"Welcome to the Ruda Survey APIs"
    })
})
// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// mongo code 
mongoose 
  .connect(MONGO_URI, { 
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
