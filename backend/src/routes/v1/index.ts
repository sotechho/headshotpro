import express from 'express';
import authRoutes from './auth.route';
import paymentRoutes from './payment.route';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/payment', paymentRoutes);

export default router;
