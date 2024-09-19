import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createNewPost,
  getAllPosts,
  getsingleUserPost,
} from "../controllers/post.controller.js";
import upload from "../middlewares/multer.js";

const postRouter = express.Router();

postRouter.post(
  "/createNewPost",
  upload.single("image"),
  isAuthenticated,
  createNewPost
);
postRouter.get("/getAllpost", isAuthenticated, getAllPosts);
postRouter.get("/yourposts", isAuthenticated, getsingleUserPost);
export default postRouter;
