import { Router } from 'express';
import { getWalletByUserId, updateAutoTopup, verifyWalletPIN, updateWalletPIN, getTransactionsByUserId } from '../controllers/walletController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/:userId', requireAuth, getWalletByUserId);
router.post('/auto-topup', requireAuth, updateAutoTopup);
router.post('/verify-pin', requireAuth, verifyWalletPIN);
router.post('/update-pin', requireAuth, updateWalletPIN);
router.get('/:userId/transactions', requireAuth, getTransactionsByUserId);

export default router;
