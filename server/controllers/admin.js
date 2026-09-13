import { createAdminToken } from '../middleware/admin.js';

export async function login(req, res) {
    const { email, password } = req.body;
    const configuredEmail = String(process.env.ADMIN_EMAIL || '').toLowerCase();

    if (
        !email ||
        !password ||
        email.toLowerCase() !== configuredEmail ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    res.json({
        token: createAdminToken(configuredEmail)
    });
}
