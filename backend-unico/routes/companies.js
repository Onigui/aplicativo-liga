import express from 'express';
import { 
  getCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  requestCompanyRegistration,
  getCompanyRequests,
  updateCompanyStatus,
  approveCompany,
  rejectCompany
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
router.put('/:id/approve', validateToken, requireAdmin, approveCompany);
router.put('/:id/reject', validateToken, requireAdmin, rejectCompany);

export default router;
