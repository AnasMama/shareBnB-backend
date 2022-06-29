import { db } from "../db-config";

export default class AbstractManager {
  static connection = db;
  static table: string;

  constructor(table: string) {
    AbstractManager.table = table;
  }

  static async find(id: number) {
    return (await this.connection).query(
      `SELECT * FROM  ${this.table} WHERE id = ?`,
      [id]
    );
  }

  static async findAll() {
    return (await this.connection)
      .query(`SELECT * FROM  ${this.table}`)
      .then(result => result[0]);
  }

  static async delete(id: number) {
    return (await this.connection).query(
      `DELETE FROM ${this.table} WHERE id = ?`,
      [id]
    );
  }
}
