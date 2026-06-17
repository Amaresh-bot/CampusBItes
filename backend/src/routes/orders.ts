import { Router } from 'express';
import { createOrder, getUserOrders, getAdminOrders, updateOrderStatus, createPrintOrder, getPrintOrders, updatePrintOrderStatus, deletePrintOrder } from '../controllers/ordersController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

// Food Orders
router.post('/create', requireAuth, createOrder);
router.get('/user/:userId', requireAuth, getUserOrders);
router.get('/admin', requireAuth, requireAdmin, getAdminOrders);
router.patch('/:orderId/status', requireAuth, requireAdmin, updateOrderStatus);

// Print Orders
router.post('/print/create', requireAuth, createPrintOrder);
router.get('/print/user/:userId?', requireAuth, getPrintOrders);
router.put('/print/:orderId/status', requireAuth, requireAdmin, updatePrintOrderStatus);
router.delete('/print/:orderId', requireAuth, requireAdmin, deletePrintOrder);

export default router;
