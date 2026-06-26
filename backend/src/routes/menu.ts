import { Router } from 'express';
import { getMenuItems, addMenuItem, editMenuItem, deleteMenuItem, getReviews, addReview, editReview, deleteReview } from '../controllers/menuController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', getMenuItems);
router.post('/add', requireAuth, requireAdmin, addMenuItem);
router.put('/:itemId/edit', requireAuth, requireAdmin, editMenuItem);
router.delete('/:itemId/delete', requireAuth, requireAdmin, deleteMenuItem);

// Reviews routes
router.get('/:itemId/reviews', getReviews);
router.post('/:itemId/reviews', requireAuth, addReview);
router.put('/reviews/:reviewId', requireAuth, editReview);
router.delete('/reviews/:reviewId', requireAuth, deleteReview);

export default router;
