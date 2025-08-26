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
import { requireAdmin } from '../controllers/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/request', requestCompanyRegistration);
router.get('/requests', getCompanyRequests);

// Rotas protegidas por admin
router.get('/', requireAdmin, getCompanies);
router.get('/:id', requireAdmin, getCompanyById);
router.post('/', requireAdmin, createCompany);
router.put('/:id', requireAdmin, updateCompany);
router.delete('/:id', requireAdmin, deleteCompany);
router.put('/:id/status', requireAdmin, updateCompanyStatus);

export default router;
