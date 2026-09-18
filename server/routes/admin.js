import { Router } from 'express';

import { login, logout } from '../controllers/admin.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

router.post('/login', login);
router.get('/logout', logout);
router.get('/verify-admin', requireAdmin, (req, res) => {
    res.json({ success: true });
});

export default router;