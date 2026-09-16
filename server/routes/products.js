import { Router } from 'express';

import { listProducts, getProduct, getRelatedProducts, createProduct, updateProduct, deleteProduct } from '../controllers/products.js';
import { requireAdmin } from '../middleware/admin.js';
const router = Router();

router.get('/', listProducts);
router.get('/related/:category', getRelatedProducts);
router.get('/:slug', getProduct);
router.post('/', requireAdmin, createProduct);
router.patch('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;