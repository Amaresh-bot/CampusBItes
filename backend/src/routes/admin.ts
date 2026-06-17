import { Router } from 'express';
import { getStudentsAdmin, verifyStudent, getAdminOrders, getPaymentLogs } from '../controllers/adminController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

router.get('/students', requireAuth, requireAdmin, getStudentsAdmin);
router.post('/verify-student', requireAuth, requireAdmin, verifyStudent);
router.get('/orders', requireAuth, requireAdmin, getAdminOrders);
router.get('/payment-logs', requireAuth, requireAdmin, getPaymentLogs);

export default router;
