import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new CalendarController();

router.get('/', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getCalendarEvents(req, res));

export default router;
