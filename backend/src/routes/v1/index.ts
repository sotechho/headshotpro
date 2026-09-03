import express from 'express';
import authRoutes from './auth.route';
import headshotRoutes from './headshot.route';
import paymentRoutes from './payment.route';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/payment', paymentRoutes);
router.use('/headshots', headshotRoutes);

export default router;
