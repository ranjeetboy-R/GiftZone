// import jwt from 'jsonwebtoken';

// export function requireAuth(req, res, next) {
//     try {
//         const authorization = req.headers.authorization;

//         if (!authorization?.startsWith('Bearer ')) {
//             return res.status(401).json({
//                 message: 'Authentication required.'
//             });
//         }

//         const token = authorization.split(' ')[1];

//         const payload = jwt.verify(
//             token,
//             process.env.JWT_ACCESS_SECRET
//         );

//         req.user = payload;

//         next();
//     } catch (error) {
//         return res.status(401).json({
//             message: 'Invalid or expired access token.'
//         });
//     }
// }

// export function requireAdmin(req, res, next) {
//     if (req.user?.role !== 'admin') {
//         return res.status(403).json({
//             message: 'Admin access required.'
//         });
//     }

//     next();
// }