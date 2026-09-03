import { headshotController } from '@/controller';
import { authenticate } from '@/middlewares';
import { Router } from 'express';

const router = Router();

router.use(authenticate);
router.get('/styles', headshotController.getAvailableStyles);
export default router;
