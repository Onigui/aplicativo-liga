import express from 'express';
import { 
  login, 
  register, 
  validateToken, 
  requireAdmin,
  companyLogin,
  requestCompanyPasswordReset,
  resetCompanyPassword
} from '../controllers/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/company-login', companyLogin);
router.post('/company-password-reset', requestCompanyPasswordReset);
router.post('/company-password-reset/confirm', resetCompanyPassword);

// Middleware de autenticação para rotas protegidas
router.use(validateToken);

// Rotas protegidas
router.get('/validate', (req, res) => {
  res.json({ 
    success: true, 
    user: req.user,
    message: 'Token válido' 
  });
});

export default router;
