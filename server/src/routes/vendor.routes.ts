import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new VendorController();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.get('/:id', roleMiddleware(['Admin', 'Employee']), controller.getById);
router.post('/', roleMiddleware(['Admin']), controller.create);
router.put('/:id', roleMiddleware(['Admin']), controller.update);
router.delete('/:id', roleMiddleware(['Admin']), controller.delete);

export default router;
