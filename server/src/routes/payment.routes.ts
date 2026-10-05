import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new PaymentController();

// Public webhook endpoint (invoked by Razorpay servers)
router.post('/razorpay/webhook', controller.processRazorpayWebhook);

// Protected routes (require user JWT auth)
router.use(authMiddleware);

router.post('/razorpay/verify', controller.verifyRazorpayPayment);
router.post('/razorpay/retry', controller.retryRazorpayOrder);

router.get('/', roleMiddleware(['Admin', 'Employee']), controller.getAll);
router.get('/:id', roleMiddleware(['Admin', 'Employee']), controller.getById);
router.post('/', roleMiddleware(['Admin']), controller.create);
router.patch('/:id/status', roleMiddleware(['Admin']), controller.updateStatus);

export default router;
