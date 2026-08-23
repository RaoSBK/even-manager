import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new ReportController();

router.get('/overview', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getDashboardOverview(req, res));

export default router;
