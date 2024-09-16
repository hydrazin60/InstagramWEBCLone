import express, { urlencoded } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import UserAuthRouter from "./routes/userAuth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CorsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(cors(CorsOptions));

app.use("/instaclone/api/v1/user" , UserAuthRouter);

app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    console.log(`server error: ${err.message}`);
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log(`Database error: ${err.message}`);
  });
