import express from "express";
import {
  getProfile,
  Login,
  Logout,
  Register,
  updateProfile,
} from "../controllers/userAuth.controllers.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const UserAuthRouter = express.Router();

UserAuthRouter.post("/register", Register);
UserAuthRouter.post("/login", Login);
UserAuthRouter.get("/Logout", Logout);
UserAuthRouter.get("/getprofile/:id", getProfile);
UserAuthRouter.post("/editProfile", upload.fields([{ name: "profilePic" }]), isAuthenticated, updateProfile);

export default UserAuthRouter;
