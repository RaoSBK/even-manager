import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, roleMiddleware } from '../app';

const router = Router();
const controller = new UserController();

// Customers routes
router.get('/customers', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getCustomers(req, res));
router.get('/customers/:id', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getCustomerById(req, res));
router.post('/customers', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.createCustomer(req, res));
router.put('/customers/:id', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.updateCustomer(req, res));
router.patch('/customers/:id/toggle-active', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.toggleCustomerActive(req, res));

// Employees routes
router.get('/employees', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getEmployees(req, res));
router.get('/employees/:id', authMiddleware, roleMiddleware(['Admin', 'Employee']), (req, res) => controller.getEmployeeById(req, res));
router.post('/employees', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.createEmployee(req, res));
router.put('/employees/:id', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.updateEmployee(req, res));
router.patch('/employees/:id/toggle-active', authMiddleware, roleMiddleware(['Admin']), (req, res) => controller.toggleEmployeeActive(req, res));

export default router;
