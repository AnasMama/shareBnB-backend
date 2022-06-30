import { Router } from 'express';
import { UserController } from "./controllers";
import ProjectController from './controllers/ProjectController';

const { authorization, isAdmin } = require("./services/auth");

const router = Router();

router.post("/users/register", UserController.register);
router.post("/users/login", UserController.login);
router.get("/users", authorization, isAdmin, UserController.browse);
router.get("/users/logout", authorization, UserController.logout);
router.put("/users/:id", authorization, UserController.edit);
router.delete("/users/:id", authorization, isAdmin, UserController.delete);

router.get("/projects", ProjectController.browse);
router.get("/projects/:id", ProjectController.read);
router.post("/projects", ProjectController.add);
router.delete("/projects/:id", ProjectController.delete);

export default router;