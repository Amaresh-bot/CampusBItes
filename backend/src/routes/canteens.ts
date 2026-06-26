import { Router } from 'express';
import { getCanteensByCollege, createCanteen, getOperatingHours, updateOperatingHours } from '../controllers/collegeController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

router.get('/college/:collegeId', getCanteensByCollege);
router.post('/', requireAuth, createCanteen);

// Operating Hours routes
router.get('/operating-hours', getOperatingHours);
router.post('/operating-hours', requireAuth, requireAdmin, updateOperatingHours);

export default router;
