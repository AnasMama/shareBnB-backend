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

export default class UserManager extends AbstractManager {
  static table = "user";

  static async findByMail(email: string) {
    return (await this.connection)
      .query(`SELECT * FROM ${UserManager.table} WHERE email = ?`, [email])
      .then((result) => result[0]);
  }

  static async insert(user: User) {
    return (await this.connection).query(`INSERT INTO ${UserManager.table} SET ?`, [
      user,
    ]);
  }

  static async update(user: User) {
    return (await this.connection).query(`UPDATE ${UserManager.table} SET ?`, [user]);
  }
}
