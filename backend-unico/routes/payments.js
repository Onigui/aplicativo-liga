import express from 'express';
import { getPayments } from '../controllers/payments.js';

const router = express.Router();

router.get('/', getPayments);

export default router;
