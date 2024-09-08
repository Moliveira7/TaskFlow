import express from 'express';
import { registerUser, loginUser, deleteUser, updateUser } from '../controllers/userController.js'; // Importar updateUser
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota de registro de usuário
router.post('/register', registerUser);

// Rota de login de usuário
router.post('/login', loginUser);

// Rota para atualizar usuário (necessita de autenticação)
router.put('/:email', authenticateJWT, updateUser); // Nova rota para atualização de usuário

// Rota para deletar usuário (necessita de autenticação)
router.delete('/:email', authenticateJWT, deleteUser);

export default router;
