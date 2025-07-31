import express from 'express';
import { getDashboardData, getReports, getSettings, updateSettings } from '../controllers/admin.js';
import { validateToken, requireAdmin } from '../controllers/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(validateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardData);

// Relatórios
router.get('/reports', getReports);

// Configurações
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router; 