import express from 'express';
import { registerUser, loginUser, deleteUser } from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/:email', authenticateJWT, deleteUser);

export default router;
