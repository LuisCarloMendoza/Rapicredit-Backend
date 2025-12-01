import express from "express";
import { userController } from "../controllers/user.controller.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const userRouter = express.Router();

userRouter.post("/register", userController.register);

// Do not require the Firebase token middleware for login so users can
// authenticate with credentials (`usuario`/`email` + `password`).
userRouter.post("/login", userController.login);

userRouter.put("/:uid", verifyFirebaseToken, userController.updateByUid);

userRouter.get("/", verifyFirebaseToken, userController.getAll);

export default userRouter;
