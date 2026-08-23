import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  private taskService = new TaskService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        assignedTo: req.query.assignedTo as string,
        eventId: req.query.eventId as string,
        status: req.query.status as string,
        priority: req.query.priority as string
      };
      const list = await this.taskService.getAll(filters);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await this.taskService.getById(req.params.id as string);
      res.status(200).json(task);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await this.taskService.create(req.body);
      res.status(201).json(task);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await this.taskService.update(req.params.id as string, req.body);
      res.status(200).json(task);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await this.taskService.delete(req.params.id as string);
      res.status(200).json(task);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
export default TaskController;
