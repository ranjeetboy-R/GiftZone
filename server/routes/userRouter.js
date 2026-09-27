import express from 'express';
import { deleteUser, getAllUsers } from '../controllers/userController.js';
import { requireAdmin } from '../middleware/admin.js';

const userRouter = express.Router();

userRouter.get('/get-allUsers', requireAdmin, getAllUsers);
userRouter.delete('/delete-user/:id', requireAdmin, deleteUser);

export default userRouter;