// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// import User from '../models/User.js';

// import {
//     createAccessToken,
//     createRefreshToken,
//     hashToken,
//     generateRandomToken,
//     setRefreshCookie,
//     clearRefreshCookie
// } from '../utils/auth.js';

// function sanitizeUser(user) {
//     return {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isEmailVerified: user.isEmailVerified
//     };
// }

// export async function signup(req, res) {
//     try {
//         const { name, email, password } = req.body;

//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 message: 'Name, email and password are required.'
//             });
//         }

//         if (password.length < 8) {
//             return res.status(400).json({
//                 message: 'Password must be at least 8 characters.'
//             });
//         }

//         const normalizedEmail = email.trim().toLowerCase();

//         const existingUser = await User.findOne({
//             email: normalizedEmail
//         });

//         if (existingUser) {
//             return res.status(409).json({
//                 message: 'An account with this email already exists.'
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 12);

//         const verificationToken = generateRandomToken();

//         const user = await User.create({
//             name: name.trim(),
//             email: normalizedEmail,
//             password: hashedPassword,
//             emailVerificationToken: hashToken(verificationToken),
//             emailVerificationExpires: new Date(
//                 Date.now() + 30 * 60 * 1000
//             )
//         });

//         // Send verification email here.
//         // await sendVerificationEmail(user.email, verificationToken);

//         return res.status(201).json({
//             message: 'Account created successfully.',
//             user: sanitizeUser(user)
//         });
//     } catch (error) {
//         console.error('Signup error:', error);

//         return res.status(500).json({
//             message: 'Unable to create account.'
//         });
//     }
// }

// export async function login(req, res) {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 message: 'Email and password are required.'
//             });
//         }

//         const normalizedEmail = email.trim().toLowerCase();

//         const user = await User.findOne({
//             email: normalizedEmail
//         }).select('+password');

//         if (!user) {
//             return res.status(401).json({
//                 message: 'Invalid email or password.'
//             });
//         }

//         const passwordMatch = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!passwordMatch) {
//             return res.status(401).json({
//                 message: 'Invalid email or password.'
//             });
//         }

//         const accessToken = createAccessToken(user);
//         const refreshToken = createRefreshToken(user);

//         user.refreshTokenHash = hashToken(refreshToken);

//         await user.save();

//         setRefreshCookie(res, refreshToken);

//         return res.json({
//             message: 'Login successful.',
//             accessToken,
//             user: sanitizeUser(user)
//         });
//     } catch (error) {
//         console.error('Login error:', error);

//         return res.status(500).json({
//             message: 'Unable to login.'
//         });
//     }
// }

// export async function refreshAccessToken(req, res) {
//     try {
//         const refreshToken = req.cookies.refreshToken;

//         if (!refreshToken) {
//             return res.status(401).json({
//                 message: 'Refresh token missing.'
//             });
//         }

//         const payload = jwt.verify(
//             refreshToken,
//             process.env.JWT_REFRESH_SECRET
//         );

//         const user = await User.findById(payload.userId);

//         if (!user || !user.refreshTokenHash) {
//             clearRefreshCookie(res);

//             return res.status(401).json({
//                 message: 'Invalid refresh token.'
//             });
//         }

//         const incomingHash = hashToken(refreshToken);

//         if (incomingHash !== user.refreshTokenHash) {
//             clearRefreshCookie(res);

//             return res.status(401).json({
//                 message: 'Invalid refresh token.'
//             });
//         }

//         const newAccessToken = createAccessToken(user);
//         const newRefreshToken = createRefreshToken(user);

//         user.refreshTokenHash = hashToken(newRefreshToken);

//         await user.save();

//         setRefreshCookie(res, newRefreshToken);

//         return res.json({
//             accessToken: newAccessToken
//         });
//     } catch (error) {
//         clearRefreshCookie(res);

//         return res.status(401).json({
//             message: 'Session expired. Please login again.'
//         });
//     }
// }

// export async function logout(req, res) {
//     try {
//         const refreshToken = req.cookies.refreshToken;

//         if (refreshToken) {
//             try {
//                 const payload = jwt.verify(
//                     refreshToken,
//                     process.env.JWT_REFRESH_SECRET
//                 );

//                 await User.findByIdAndUpdate(
//                     payload.userId,
//                     {
//                         $set: {
//                             refreshTokenHash: null
//                         }
//                     }
//                 );
//             } catch {
//                 // Ignore invalid/expired refresh token.
//             }
//         }

//         clearRefreshCookie(res);

//         return res.json({
//             message: 'Logged out successfully.'
//         });
//     } catch (error) {
//         clearRefreshCookie(res);

//         return res.json({
//             message: 'Logged out successfully.'
//         });
//     }
// }

// export async function getCurrentUser(req, res) {
//     try {
//         const user = await User.findById(req.user.userId);

//         if (!user) {
//             return res.status(404).json({
//                 message: 'User not found.'
//             });
//         }

//         return res.json({
//             user: sanitizeUser(user)
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Unable to get user.'
//         });
//     }
// }