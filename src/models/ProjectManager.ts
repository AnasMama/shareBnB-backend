import Joi from "joi";
import AbstractManager from "./AbstractManager";
import UserHasProjectManager from "./UserHasProjectManager";

export interface Project {
  id?: number;
  name: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  project_cost: number;
  share_link: string;
  is_private: boolean;
}

interface ProjectUpdated {
  id: number;
  name?: string;
  description?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  project_cost?: number;
  share_link?: string;
}

export default class ProjectManager extends AbstractManager {
  static table = "project";

  static async insert(project: Project) {
    return (await this.connection).query(
      `INSERT INTO ${ProjectManager.table} SET ?`,
      [project]
    );
  }

  static async update(project: ProjectUpdated, id: number) {
    return (await this.connection).query(
      `UPDATE ${ProjectManager.table} SET ? WHERE id = ?`,
      [project, id]
    );
  }

  static async findAllForAnUser(idUser: number) {
    return (await this.connection).query(
      `SELECT p.*, up.project_role, up.budget_part FROM ${ProjectManager.table} as p JOIN ${UserHasProjectManager.table} as up ON up.project_id = p.id  WHERE up.user_id = ?`,
      [idUser]
    ).then((result) => {
      const project = result[0] as unknown as Project[];
      return project
    });;
  }

  static async findByNameForAnUser(name: string, idUser: number) {
    return (await this.connection).query(
      `SELECT p.*, up.project_role, up.budget_part FROM ${ProjectManager.table} as p JOIN ${UserHasProjectManager.table} as up ON up.project_id = p.id WHERE p.name = ? AND up.user_id = ?`,
      [name, idUser]
    ).then((result) => {
      const projects = result[0] as unknown as Project[];
      return projects
    });;
  }

  static async validate(data: Project, forCreation: boolean = true) {
    const presence = forCreation ? "required" : "optional";
    return await Joi.object({
      name: Joi.string().max(255).presence(presence),
      description: Joi.string().max(255),
      type: Joi.string().max(255).presence(presence),
      start_date: Joi.string().max(255).presence(presence),
      end_date: Joi.string().max(255).presence(presence),
      project_cost: Joi.number().presence(presence),
      share_link: Joi.string().max(255).presence(presence),
      is_private: Joi.boolean()
    }).validate(data, { abortEarly: false }).error;
  }
}
