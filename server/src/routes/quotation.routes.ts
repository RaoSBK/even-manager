import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new QuotationController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.get('/:id', roleMiddleware(['Admin', 'Employee']), controller.getById);
router.post('/', roleMiddleware(['Admin']), controller.create);
router.put('/:id', roleMiddleware(['Admin']), controller.update);
router.patch('/:id/status', roleMiddleware(['Admin', 'Employee']), controller.updateStatus);

export default router;
