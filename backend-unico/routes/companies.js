import express from 'express';
import { 
  getCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  requestCompanyRegistration,
  getCompanyRequests,
  updateCompanyStatus
} from '../controllers/companies.js';
import { requireAdmin, validateToken } from '../controllers/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/request', requestCompanyRegistration);
router.get('/requests', getCompanyRequests);

// Rotas protegidas por admin (primeiro valida token, depois verifica se é admin)
router.get('/', validateToken, requireAdmin, getCompanies);
router.get('/:id', validateToken, requireAdmin, getCompanyById);
router.post('/', validateToken, requireAdmin, createCompany);
router.put('/:id', validateToken, requireAdmin, updateCompany);
router.delete('/:id', validateToken, requireAdmin, deleteCompany);
router.put('/:id/status', validateToken, requireAdmin, updateCompanyStatus);

export default router;
