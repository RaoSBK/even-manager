import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new SearchController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.search);

export default router;
