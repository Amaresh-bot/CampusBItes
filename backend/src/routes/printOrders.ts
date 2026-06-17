import { Router } from 'express';
import { createPrintOrder, getPrintOrders, updatePrintOrderStatus, deletePrintOrder } from '../controllers/ordersController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

router.post('/create', requireAuth, createPrintOrder);
router.get('/user/:userId?', requireAuth, getPrintOrders);
router.get('/', requireAuth, requireAdmin, getPrintOrders);
router.patch('/:orderId/status', requireAuth, requireAdmin, updatePrintOrderStatus);
router.put('/:orderId/status', requireAuth, requireAdmin, updatePrintOrderStatus);
router.delete('/:orderId', requireAuth, requireAdmin, deletePrintOrder);

export default router;
