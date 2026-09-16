import { config } from '@/config';
import v1Routes from '@/routes/v1';
import { errorResponse } from '@/utils/responses';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { paymentController } from './controller';
import { errorHandler } from './middlewares/error.middleware';
import inngestRoute from './routes/inngest.route';
import helmet from 'helmet';
import compression from 'compression';

const app = express();

// MIDDLEWARES

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Inline styles for Tailwind/CSS frameworks
        scriptSrc: ["'self'"], // Only your domain (Cloudflare proxies transparently)
        imgSrc: ["'self'", 'data:', 'https:'], // S3 images + base64
        fontSrc: ["'self'", 'data:'], // Your fonts (Cloudflare caches them)
        frameSrc: ["'self'"], // No external iframes
        objectSrc: ["'none'"], // Block plugins
        upgradeInsecureRequests: [], // Force HTTPS
      },
    },
    crossOriginEmbedderPolicy: false, // Allow S3 images
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudflare proxy
  }),
);
app.use(compression());

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

app.post(
  '/api/v1/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhookHandler,
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
