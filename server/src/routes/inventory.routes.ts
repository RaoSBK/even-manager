import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new InventoryController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.get('/summary', roleMiddleware(['Admin', 'Employee']), controller.getSummary);
router.get('/:id', roleMiddleware(['Admin', 'Employee']), controller.getById);
router.get('/:id/transactions', roleMiddleware(['Admin', 'Employee']), controller.getTransactions);

router.post('/', roleMiddleware(['Admin']), controller.create);
router.put('/:id', roleMiddleware(['Admin']), controller.update);
router.patch('/:id/quantity', roleMiddleware(['Admin', 'Employee']), controller.updateQuantity);
router.delete('/:id', roleMiddleware(['Admin']), controller.delete);

export default router;
