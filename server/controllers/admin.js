import { createAdminToken } from '../middleware/admin.js';

export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json({
            success: false,
            message: 'Email and password required'
        });
    }

    const configuredEmail = String(process.env.ADMIN_EMAIL || '').toLowerCase();
    const submittedEmail = String(email || '').toLowerCase();

    if (!submittedEmail || !password || submittedEmail !== configuredEmail || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: 'Invalid admin credentials'
        });
    }

    const token = createAdminToken(configuredEmail);

    res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 12 * 60 * 60 * 1000,
        path: '/'
    });

    res.json({ success: true, message: 'Admin login successful' });
}

export async function logout(req, res) {
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
}