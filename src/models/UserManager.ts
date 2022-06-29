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

  static async findByMail(email: string): Promise<User[]> {
    return (await this.connection)
      .query(`SELECT * FROM ${UserManager.table} WHERE email = ?`, [email])
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

  static async update(user: User) {
    return (await this.connection).query(`UPDATE ${UserManager.table} SET ?`, [
      user,
    ]);
  }
}
