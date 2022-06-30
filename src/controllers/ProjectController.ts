import { Request, RequestHandler, Response } from "express";
import { Error } from ".";
import { ProjectManager } from "../models";
import { Project } from "../models/ProjectManager";
import UserHasProjectManager, {
  UserHasProject,
} from "../models/UserHasProjectManager";

export default class ProjectController {
  static browse: RequestHandler = (req: Request, res: Response) => {
    ProjectManager.findAll()
      .then((rows) => {
        const users = rows as unknown as Project[];
        res.status(201).send(
          users.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            type: project.type,
            start_date: project.start_date,
            end_date: project.end_date,
            project_cost: project.project_cost,
            share_link: project.share_link,
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

  static read: RequestHandler = (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    ProjectManager.find(id)
      .then((project: Project) => {
        if (project === null) {
          res.sendStatus(404);
        } else {
          res.status(201).send(project);
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  static add: RequestHandler = (req: Request, res: Response) => {
    let projectCreated: Project | null = null;

    const {
      user_id,
      name,
      description,
      type,
      start_date,
      end_date,
      project_cost,
      share_link,
      is_private,
    } = req.body;

    const projectToCreate: Project = {
      name: name,
      description: description,
      type: type,
      start_date: start_date,
      end_date: end_date,
      project_cost: project_cost,
      share_link: share_link,
      is_private: is_private,
    };

    Promise.all([
      ProjectManager.findByNameForAnUser(name, user_id),
      ProjectManager.validate(projectToCreate),
    ])
      .then(([existingName, validationError]) => {
        if (existingName[0])
          return res.status(403).send({
            error: "Name already used",
          });
        if (validationError)
          return res.status(403).send({
            error: "Invalid data try again",
          });

        ProjectManager.insert(projectToCreate)
          .then(([projectInserted]: any) => {
            projectCreated = {
              ...projectToCreate,
              id: projectInserted.insertId,
            };

            const projectCreator: UserHasProject = {
              project_role: "master",
              budget_part: 1,
              user_id: parseInt(user_id, 10),
              project_id: projectInserted.insertId,
            };

            UserHasProjectManager.insert(projectCreator)
              .then(() =>
                res.status(201).send({ ...projectCreated, ...projectCreator })
              )
              .catch((err: Error) => {
                console.error(err);
                res.status(500).send({
                  error: err.message,
                });
              });
          })
          .catch((err: Error) => {
            console.error(err);
            res.status(500).send({
              error: err.message,
            });
          });
      })
      .catch((err: Error) => {
        console.error(err);
        res.status(500).send({
          error: err.message,
        });
      });
  };

  static delete: RequestHandler = (req: Request, res: Response) => {
    const projectId: number = parseInt(req.params.id, 10);
    UserHasProjectManager.deleteAll(projectId)
      .then(() => {
        ProjectManager.delete(projectId)
          .then(() => {
            res.status(204).send("Project deleted !");
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
}
