import express from 'express';
import { getUsers, createUser, toggleUserStatus } from '../controllers/users.js';
import { validateToken, requireAdmin } from '../controllers/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(validateToken);
router.use(requireAdmin);

// Buscar usuários
router.get('/', getUsers);

// Criar usuário
router.post('/', createUser);

// Atualizar status do usuário
router.put('/:id/toggle-status', toggleUserStatus);

export default router;
