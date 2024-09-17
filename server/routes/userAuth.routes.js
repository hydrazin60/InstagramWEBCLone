import express from "express";
import {
  getProfile,
  Login,
  Logout,
  Register,
} from "../controllers/userAuth.controllers.js";

const UserAuthRouter = express.Router();

UserAuthRouter.post("/register", Register);
UserAuthRouter.post("/login", Login);
UserAuthRouter.get("/Logout", Logout);
UserAuthRouter.get("/getprofile/:id", getProfile);

export default UserAuthRouter;
