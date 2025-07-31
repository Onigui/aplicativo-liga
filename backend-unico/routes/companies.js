import express from 'express';
import { 
  getCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  approveCompany,
  rejectCompany
} from '../controllers/companies.js';
import { validateToken, requireAdmin } from '../controllers/auth.js';

const router = express.Router();

// Rotas públicas (para cadastro de empresas)
router.post('/', createCompany);            // POST /api/admin/companies

// Rotas protegidas (requerem autenticação)
router.use(validateToken);                  // Middleware de autenticação

// Rotas para administradores
router.get('/', getCompanies);              // GET /api/admin/companies
router.get('/:id', getCompanyById);         // GET /api/admin/companies/:id
router.put('/:id', requireAdmin, updateCompany);          // PUT /api/admin/companies/:id
router.delete('/:id', requireAdmin, deleteCompany);       // DELETE /api/admin/companies/:id

// Rotas de aprovação/rejeição (apenas admin)
router.put('/:id/approve', requireAdmin, approveCompany); // PUT /api/admin/companies/:id/approve
router.put('/:id/reject', requireAdmin, rejectCompany);   // PUT /api/admin/companies/:id/reject

export default router;
