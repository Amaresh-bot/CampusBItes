import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentsController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/create-order', requireAuth, createRazorpayOrder);
router.post('/verify', requireAuth, verifyRazorpayPayment);

export default router;
