import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
            return callback(new Error('Only image files are allowed'));
        }

        callback(null, true);
    }
});

router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'gift-zone/products',
                    resource_type: 'image'
                },
                (error, data) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(data);
                }
            ).end(req.file.buffer);
        });

        res.status(201).json({
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
