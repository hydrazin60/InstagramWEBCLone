import express, { urlencoded } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import UserAuthRouter from "./routes/userAuth.routes.js";
import postRouter from "./routes/post.routes.js";
import multer from "multer";

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

import CommentSchema from "./models/comment.model.js";
import PostSchema from "./models/post.model.js";
import UserSchema from "./models/user.model.js";
 
if (!mongoose.models.Comment) {
  mongoose.model("Comment", CommentSchema);
}
if (!mongoose.models.Post) {
  mongoose.model("Post", PostSchema);
}
if (!mongoose.models.User) {
  mongoose.model("User", UserSchema);
}

export const Comment = mongoose.model("Comment");
export const Post = mongoose.model("Post");
export const User = mongoose.model("User");

app.use("/instaclone/api/v1/user", UserAuthRouter);
app.use("/instaclone/api/v1/post", postRouter);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        sucess: false,
        message: "File size is too large. Maximum size allowed is 2MB.",
      });
    }
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

app.listen(PORT, (err) => {
  if (!err) {
    console.log(`Server is running on port ${PORT}`);
  } else {
    console.log(`server error: ${err.message}`);
  }
});
