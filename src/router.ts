import { Router } from 'express';
import { UserController } from "./controllers";

// const { authorization, isAdmin } = require("./services/auth");


const router = Router();

router.post("/users/register", UserController.register);
router.post("/users/login", UserController.login);
router.get("/users", UserController.browse);
router.get("/users/logout", UserController.logout);
// router.put("/users/:id", UserController.edit);
// router.delete("/users/:id", UserController.delete);

export default router;