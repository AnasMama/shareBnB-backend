import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserManager";
import * as jwt from "jsonwebtoken";

interface RequestAuth extends Request {
  userId: string;
  userRole: string;
}

const secret = process.env.JWT_AUTH_SECRET;

const generateToken = (user: User) => {
  const { id, email, role_id } = user;
  if (secret) jwt.sign({ id, email, role_id }, secret, { expiresIn: "1h" });
};

const authorization = (req: RequestAuth, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) return res.sendStatus(401);
  try {
    if (secret) {
      const data = jwt.verify(token, secret);
      if (typeof data !== "string") {
        req.userId = data.id;
        req.userRole = data.role_id;
      }
    }
    return next();
  } catch {
    return res.sendStatus(401);
  }
};

const isAdmin = (req: RequestAuth, res: Response, next: NextFunction) => {
  if (req.userRole === "1") return next();
  return res.sendStatus(403);
};

export { generateToken, authorization, isAdmin };
