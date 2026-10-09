import { Router } from 'express';
import multer from 'multer';

import cloudinary from '../config/cloudinary.js';
import { requireAdmin } from '../middleware/admin.js';
import { hasValidImageSignature } from '../utils/imageValidation.js';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            return callback(
                new Error('Only image files are allowed')
            );
        }

        callback(null, true);
    }
});

router.post(
    '/',
    requireAdmin,
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'Image is required'
                });
            }
            if (!hasValidImageSignature(req.file)) {
                return res.status(400).json({ message: 'The uploaded file is not a valid supported image.' });
            }

            const result = await new Promise(
                (resolve, reject) => {
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
                }
            );

            res.status(201).json({
                url: result.secure_url,
                publicId: result.public_id
            });
        } catch (error) {
            console.error('Product image upload failed:', error);
            res.status(500).json({
                message: 'Image upload failed'
            });
        }
    }
);

export default router;
