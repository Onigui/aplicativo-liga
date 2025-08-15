import express from 'express';
import { login, register, companyLogin } from '../controllers/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/company-login', companyLogin);

export default router;
