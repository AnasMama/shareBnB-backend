import Joi from "joi";
import AbstractManager from "./AbstractManager";

export interface UserHasProject {
  project_role: string;
  budget_part: number;
  user_id: number;
  project_id: number;
}

export default class UserHasProjectManager extends AbstractManager {
  static table = "user_has_project";

  static async insert(collaborator: UserHasProject) {
    return (await this.connection).query(
        `INSERT INTO ${UserHasProjectManager.table} SET ?`,
      [collaborator]
    )
  }

  static async validate(data: UserHasProject, forCreation: boolean = true) {
    const presence = forCreation ? "required" : "optional";
    return await Joi.object({
      role_name: Joi.string().presence(presence),
    }).validate(data, { abortEarly: false }).error;
  }

  static async deleteAll(id: number) {
    return (await this.connection).query(
      `DELETE FROM ${this.table} WHERE project_id = ?`,
      [id]
    );
  }
}
