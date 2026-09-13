import jwt from 'jsonwebtoken';

export function createAdminToken(email) {
    return jwt.sign(
        {
            email,
            role: 'admin'
        },
        process.env.ADMIN_JWT_SECRET,
        {
            expiresIn: '12h'
        }
    );
}

export function requireAdmin(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Admin login required' });
    }

    try {
        const data = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

        if (
            data.role !== 'admin' ||
            data.email !== String(process.env.ADMIN_EMAIL).toLowerCase()
        ) {
            throw new Error('Invalid admin session');
        }

        req.adminEmail = data.email;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired admin session' });
    }
}
