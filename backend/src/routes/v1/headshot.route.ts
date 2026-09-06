import { headshotController } from '@/controller';
import { authenticate } from '@/middlewares';
import { upload } from '@/middlewares/upload.middleware';
import { Router } from 'express';

const router = Router();

router.use(authenticate);
router.get('/styles', headshotController.getAvailableStyles);
router.post(
  '/generate',
  upload.single('photo'),
  headshotController.generateHeadshot,
);
router.get('/', headshotController.getHeadshots);
router.get('/:id', headshotController.getHeadshotById);

export default router;
