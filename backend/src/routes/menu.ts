import { Router } from 'express';
import { getMenuItems, addMenuItem, editMenuItem, deleteMenuItem } from '../controllers/menuController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', getMenuItems);
router.post('/add', requireAuth, requireAdmin, addMenuItem);
router.put('/:itemId/edit', requireAuth, requireAdmin, editMenuItem);
router.delete('/:itemId/delete', requireAuth, requireAdmin, deleteMenuItem);

export default router;
