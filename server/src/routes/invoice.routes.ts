import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new InvoiceController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.get('/:id', roleMiddleware(['Admin', 'Employee']), controller.getById);
router.post('/', roleMiddleware(['Admin']), controller.create);
router.patch('/:id/status', roleMiddleware(['Admin']), controller.updateStatus);

export default router;
