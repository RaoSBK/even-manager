import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new EventController();

// Event routes
router.get('/', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getEvents(req, res));
router.get('/:id', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getEventById(req, res));
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.createEvent(req, res));
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.updateEvent(req, res));
router.patch('/:id/cancel', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.cancelEvent(req, res));

// Event tasks routes
router.post('/:id/tasks', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.createTask(req, res));
router.put('/tasks/:taskId', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.updateTask(req, res));
router.delete('/tasks/:taskId', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.deleteTask(req, res));

export default router;
