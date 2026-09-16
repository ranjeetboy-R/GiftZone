import { Router } from 'express';
import { createOrder, getMyOrder, myOrders, listOrders, updateOrder } from '../controllers/orders.js';
import { requireUser } from '../middleware/clerk.js';
import { requireAdmin } from '../middleware/admin.js';
import multer from 'multer';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },

    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
            return callback(
                new Error('Only image files are allowed')
            );
        }

        callback(null, true);
    }
});


router.post('/', requireUser, upload.single('paymentProof'), createOrder);
router.get('/mine', requireUser, myOrders);
router.get('/mine/:id', requireUser, getMyOrder);
router.get('/', requireAdmin, listOrders);
router.patch('/:id', requireAdmin, updateOrder);

export default router;
