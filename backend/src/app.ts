import { config } from '@/config';
import v1Routes from '@/routes/v1';
import { errorResponse } from '@/utils/responses';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { paymentController } from './controller';
import { errorHandler } from './middlewares/error.middleware';
import inngestRoute from './routes/inngest.route';

const app = express();

app.post(
  '/api/v1/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhookHandler,
);

// MIDDLEWARES

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'stripe-signature',
    ],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Server is running',
    status: 'success',
    timestamp: new Date().toISOString(),
  });
});

// ROUTES
app.use(config.apiVersionPrefix.v1, v1Routes);
app.use(inngestRoute);
// 404 Routes
app.use(function (req: Request, res: Response) {
  return errorResponse(res, 404, 'Route not found', [
    {
      path: req.originalUrl,
      message: 'Route not found',
    },
  ]);
});

// ERROR HANDLING
app.use(errorHandler);

export default app;
