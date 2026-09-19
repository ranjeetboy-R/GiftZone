// import crypto from 'crypto';
// import jwt from 'jsonwebtoken';

// export function createAccessToken(user) {
//     return jwt.sign(
//         {
//             userId: user._id.toString(),
//             role: user.role
//         },
//         process.env.JWT_ACCESS_SECRET,
//         {
//             expiresIn: '15m'
//         }
//     );
// }

// export function createRefreshToken(user) {
//     return jwt.sign(
//         {
//             userId: user._id.toString()
//         },
//         process.env.JWT_REFRESH_SECRET,
//         {
//             expiresIn: '30d'
//         }
//     );
// }

// export function hashToken(token) {
//     return crypto
//         .createHash('sha256')
//         .update(token)
//         .digest('hex');
// }

// export function generateRandomToken() {
//     return crypto.randomBytes(32).toString('hex');
// }

// export function setRefreshCookie(res, token) {
//     res.cookie('refreshToken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         maxAge: 30 * 24 * 60 * 60 * 1000,
//         path: '/api/auth'
//     });
// }

// export function clearRefreshCookie(res) {
//     res.clearCookie('refreshToken', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         path: '/api/auth'
//     });
// }