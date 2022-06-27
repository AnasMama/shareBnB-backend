import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserManager";

interface RequestAuth extends Request {
  userId: string;
  userRole: string;
}

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_AUTH_SECRET;

const generateToken = (user: User) => {
  const { id, email, role_id } = user;
  const token = jwt.sign({ id, email, role_id }, secret, { expiresIn: "1h" });
  return token;
};

const authorization = (req: RequestAuth, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) return res.sendStatus(401);
  try {
    const data = jwt.verify(token, process.env.JWT_AUTH_SECRET);
    req.userId = data.id;
    req.userRole = data.role_id;
    return next();
  } catch {
    return res.sendStatus(401);
  }
};

const isAdmin = (req: RequestAuth, res: Response, next: NextFunction) => {
  if (req.userRole === "ROLE_ADMIN") return next();
  return res.sendStatus(403);
};

export { generateToken, authorization, isAdmin };