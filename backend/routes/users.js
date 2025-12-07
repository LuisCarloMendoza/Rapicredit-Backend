import express from "express";
import { userController } from "../controllers/user.controller.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { requireRole } from "../middleware/requireRole.js";

const userRouter = express.Router();

userRouter.post("/register", userController.register);

// Do not require the Firebase token middleware for login so users can
// authenticate with credentials (`usuario`/`email` + `password`).
//userRouter.post("/login", userController.login);

//userRouter.put("/:uid",  userController.updateByUid);

//userRouter.get("/",  userController.getAll);

// Delete user by codigoUsuario
//userRouter.delete("/codigo/:codigoUsuario", userController.deleteByCodigoUsuario);


// Registro de usuario: solo gerente autenticado
userRouter.post(
    "/register",
    verifyFirebaseToken,
    requireRole(['gerente']),
    userController.register
);

// Login: público
userRouter.post("/login", userController.login);

// Actualizar usuario: gerente o supervisor
userRouter.put(
    "/:uid",
    verifyFirebaseToken,
    requireRole(['gerente', 'supervisor']),
    userController.updateByUid
);

// Ver todos los usuarios: solo gerente
userRouter.get(
    "/",
    verifyFirebaseToken,
    requireRole(['gerente']),
    userController.getAll
);

// Eliminar usuario por codigoUsuario: solo gerente
userRouter.delete(
    "/codigo/:codigoUsuario",
    verifyFirebaseToken,
    requireRole(['gerente']),
    userController.deleteByCodigoUsuario
);

export default userRouter;
