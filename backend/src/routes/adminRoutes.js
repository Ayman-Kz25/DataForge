import { Router } from 'express';
const router = Router();
import { getUsers, updateUserStatus, getSystemStats, getSuspiciousAlerts } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

router.use(protect, requireAdmin);

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/stats', getSystemStats);
router.get('/alerts', getSuspiciousAlerts);

export default router;
