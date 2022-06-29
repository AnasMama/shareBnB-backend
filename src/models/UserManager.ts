import Joi from "joi";
import AbstractManager from "./AbstractManager";

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  birthdate: number;
  login: string;
  password: string;
  email: string;
  role_id: number;
}

export interface UpdatedUser {
  id: number;
  firstname?: string;
  lastname?: string;
  birthdate?: number;
  login?: string;
  password?: string;
  email?: string;
  role_id?: number;
}

export default class UserManager extends AbstractManager {
  static table = "user";

  static async findByMail(email: string): Promise<User[]> {
    return (await this.connection)
      .query(`SELECT * FROM ${UserManager.table} WHERE email = ?`, [email])
      .then((result) => {
        const users = (result[0] as unknown) as User[]
        return users;
      });
  }

  static async findByLogin(login: string): Promise<User[]> {
    return (await this.connection)
      .query(`SELECT * FROM ${UserManager.table} WHERE login = ?`, [login])
      .then((result) => {
        const users = (result[0] as unknown) as User[]
        return users;
      });
  }

  static async insert(user: User) {
    return (await this.connection).query(
      `INSERT INTO ${UserManager.table} SET ?`,
      [user]
    );
  }

  static async insertMany(users: User[]) {
    const sql: string = `INSERT INTO ${UserManager.table} SET (?)`
    return (await this.connection).query(
      sql,
      [users]
    );
  }

  static async update(user: UpdatedUser, id: number) {
    return (await this.connection).query(`UPDATE ${UserManager.table} SET ? WHERE id = ?`, [
      user, id
    ]);
  }

  static async validate(data: User | UpdatedUser, forCreation: boolean = true) {
    const presence = forCreation ? "required" : "optional";
    return await Joi.object({
      firstname: Joi.string().max(255).presence(presence),
      lastname: Joi.string().max(255).presence(presence),
      birthdate: Joi.string().max(255).presence(presence),
      login: Joi.string().max(45).presence(presence),
      password: Joi.string().min(8).max(255).presence(presence),
      email: Joi.string().email().max(255).presence(presence),
      role_id: Joi.number().min(1).presence(presence),
    }).validate(data, { abortEarly: false }).error;
  };
}
