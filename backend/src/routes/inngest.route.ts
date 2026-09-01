import { inngest } from '@/lib/inngest.client';
import { inngestFunctions } from '@/services/queue';
import { Router } from 'express';
import { serve } from 'inngest/express';

const router = Router();

router.use(
  '/api/inngest',
  serve({ client: inngest, functions: inngestFunctions }),
);

export default router;
