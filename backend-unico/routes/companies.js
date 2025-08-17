import express from 'express';
import { 
  getCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  updateCompanyPassword,
  requestCompanyRegistration,
  getCompanyRequests,
  updateCompanyStatus
} from '../controllers/companies.js';
import { requireAdmin } from '../controllers/auth.js';

const router = express.Router();

// Rota pública para solicitações de cadastro (sem autenticação)
router.post('/request', requestCompanyRegistration);

// Rota pública para buscar solicitações (para o frontend)
router.get('/requests', getCompanyRequests);

// Rotas protegidas (apenas admin)
router.get('/', requireAdmin, getCompanies);                    // GET /api/admin/companies
router.get('/:id', requireAdmin, getCompanyById);              // GET /api/admin/companies/:id
router.post('/', requireAdmin, createCompany);                 // POST /api/admin/companies
router.put('/:id', requireAdmin, updateCompany);               // PUT /api/admin/companies/:id
router.delete('/:id', requireAdmin, deleteCompany);            // DELETE /api/admin/companies/:id
router.put('/:id/password', requireAdmin, updateCompanyPassword); // PUT /api/admin/companies/:id/password
router.put('/:id/status', requireAdmin, updateCompanyStatus);  // PUT /api/admin/companies/:id/status

export default router;
