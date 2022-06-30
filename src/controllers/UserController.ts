import { Request, RequestHandler, Response } from "express";
import { UserManager } from "../models";
import { UpdatedUser, User } from "../models/UserManager";
import * as argon2 from "argon2";
import { generateToken } from "../services/auth";
import Joi from "joi";
import { Error } from ".";

interface UserWithRole extends User {
  role_name: string;
}

export default class UserController {
  static register: RequestHandler = async (req: Request, res: Response) => {
    const { email, password, role } = req.body;
    if (!email) {
      if (!password) {
        return res.status(500).send({
          error: "Email and password missing",
        });
      }
      return res.status(500).send({
        error: "Email missing",
      });
    }
    if (!password)
      return res.status(500).send({
        error: "Password missing",
      });

    Promise.all([UserManager.findByMail(email), argon2.hash(password)]).then(
      ([existingEmail, hashPassword]) => {
        if (existingEmail[0])
          return res.status(403).send({
            error: "Email already used",
          });
        UserManager.insert({ ...req.body, password: hashPassword })
          .then(([result]: any) => {
            res.status(201).send({
              id: result.insertId,
              email: email,
              role: role,
            });
          })
          .catch((err: Error) => {
            console.error(err);
            res.status(500).send({
              error: err.message,
            });
          });
      }
    );
  };

  static login: RequestHandler = (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email) {
      if (!password) {
        return res.status(500).send({
          error: "Email and password missing",
        });
      }
      return res.status(500).send({
        error: "Email missing",
      });
    }
    if (!password)
      return res.status(500).send({
        error: "Password missing",
      });

    UserManager.findByMail(email)
      .then((existingEmail) => {
        if (!existingEmail[0]) {
          return res.status(500).send({
            error: "Email isn't registered",
          });
        } else {
          const { id, email, password: hash, role_id } = existingEmail[0];
          argon2.verify(hash, password).then((passVerified: boolean) => {
            if (!passVerified)
              return res.status(403).send({
                error: "Wrong password",
              });
            const token = generateToken(existingEmail[0]);
            return res
              .cookie("access_token", token, {
                // httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              })
              .status(200)
              .send({
                id,
                email,
                role_id,
              });
          });
        }
      })
      .catch((err: Error) => {
        console.error(err);
        res.status(500).send({
          error: err.message,
        });
      });
  };

  static browse: RequestHandler = (req: Request, res: Response) => {
    UserManager.findAllWithRole()
      .then((rows) => {
        const users = rows as unknown as UserWithRole[];
        res.status(201).send(
          users.map((person) => ({
            firstname: person.firstname,
            lastname: person.lastname,
            birthdate: person.birthdate,
            email: person.email,
            role: person.role_name,
          }))
        );
      })
      .catch((err: Error) => {
        console.error(err);
        res.status(500).send({
          error: err.message,
        });
      });
  };

  static logout: RequestHandler = (req: Request, res: Response) => {
    return res.clearCookie("access_token").sendStatus(200);
  };

  static edit = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10);
    const user: UpdatedUser = { ...req.body };
    
    if (req.body.password) {
      const hashedPassword = await argon2.hash(req.body.password);
      user.password = hashedPassword;
    }
    
    UserManager.validate(req.body, false)
    .then((validationError: Joi.ValidationError | undefined) => {
      if (validationError) return Promise.reject("Invalid data try again");
      
        return UserManager.update(user, id)
          .then(([result]: any) => {
            if (result.affectedRows === 0) {
              res.sendStatus(404);
            } else {
              res.sendStatus(204);
            }
          })
          .catch((err: Error) => {
            console.error(err);
            res.sendStatus(500);
          });
      })
      .catch((err: Error) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static delete: RequestHandler = (req: Request, res: Response) => {
    UserManager.delete(parseInt(req.params.id, 10))
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err: Error) => {
        console.error(err);
        res.sendStatus(500);
      });
  };
}
