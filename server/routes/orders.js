import { Router } from 'express';
import {
    createOrder,
    getMyOrder,
    myOrders,
    listOrders,
    updateOrder
} from '../controllers/orders.js';
import { requireUser } from '../middleware/clerk.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

router.post('/', requireUser, createOrder);
router.get('/mine', requireUser, myOrders);
router.get('/mine/:id', requireUser, getMyOrder);
router.get('/', requireAdmin, listOrders);
router.patch('/:id', requireAdmin, updateOrder);

export default router;
