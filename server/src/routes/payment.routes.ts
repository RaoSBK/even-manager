import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new PaymentController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.get('/:id', roleMiddleware(['Admin', 'Employee']), controller.getById);
router.post('/', roleMiddleware(['Admin']), controller.create);
router.patch('/:id/status', roleMiddleware(['Admin']), controller.updateStatus);

export default router;
