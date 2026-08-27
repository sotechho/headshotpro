import { paymentController } from '@/controller';
import { authenticate } from '@/middlewares';
import express from 'express';

const router = express.Router();

router.get('/packages', paymentController.getCreditPackages);
router.get('/packages/:id', paymentController.getCreditPackageById);

router.use(authenticate);

router.post('/process', paymentController.processPayment);

export default router;
