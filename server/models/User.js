// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//             trim: true,
//             minlength: 2,
//             maxlength: 100
//         },

//         email: {
//             type: String,
//             required: true,
//             unique: true,
//             lowercase: true,
//             trim: true,
//             index: true
//         },

//         password: {
//             type: String,
//             required: true,
//             minlength: 8,
//             select: false
//         },

//         role: {
//             type: String,
//             enum: ['user', 'admin'],
//             default: 'user'
//         },

//         isEmailVerified: {
//             type: Boolean,
//             default: false
//         },

//         emailVerificationToken: {
//             type: String,
//             default: null
//         },

//         emailVerificationExpires: {
//             type: Date,
//             default: null
//         },

//         passwordResetToken: {
//             type: String,
//             default: null
//         },

//         passwordResetExpires: {
//             type: Date,
//             default: null
//         },

//         refreshTokenHash: {
//             type: String,
//             default: null
//         }
//     },
//     {
//         timestamps: true
//     }
// );

// export default mongoose.model('User', userSchema);