import { paymentController } from '@/controller';
import express from 'express';

const router = express.Router();

router.get('/packages', paymentController.getCreditPackages);
router.get('/packages/:id', paymentController.getCreditPackageById);

export default router;
