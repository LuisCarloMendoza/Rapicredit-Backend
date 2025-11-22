import express from "express";
import { userController } from "../controllers/user.controller.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const userRouter = express.Router();

userRouter.post("/register", userController.register);

userRouter.post("/login", verifyFirebaseToken, userController.login);

userRouter.put("/:uid", verifyFirebaseToken, userController.updateByUid);

export default userRouter;
