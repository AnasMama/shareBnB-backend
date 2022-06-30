import { db } from "../db-config";
import { Project } from "./ProjectManager";

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
    ).then((result) => {
        const items = result as unknown as any[];
        return items[0]
      });
  }

  static async findAll() {
    return (await this.connection)
      .query(`SELECT * FROM  ${this.table}`)
      .then(result => {
        const items = result as unknown as any[];
        return items[0]
      });
  }

  static async delete(id: number) {
    return (await this.connection).query(
      `DELETE FROM ${this.table} WHERE id = ?`,
      [id]
    );
  }
}
