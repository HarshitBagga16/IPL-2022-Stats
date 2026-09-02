import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { router } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// This function creates and configures an Express application with various middleware, routes, and error handling. It returns the configured Express application instance.
//express library is used to create the express application and configure it with various middleware, routes, and error handling. It returns the configured express application instance.
export function createApp() {
  const app = express();

  // Security middleware
  // Helmet helps secure the app by setting various HTTP headers. Here, we disable the content security policy for simplicity.
  app.use(helmet({ contentSecurityPolicy: false }));
  // CORS middleware allows cross-origin requests. Here, we allow all origins and only GET methods with specific headers.
  app.use(cors({ origin: '*', methods: ['GET'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  // Compression middleware compresses response bodies for all requests that traverse through the middleware, improving performance.
  app.use(compression());
  // Logging middleware logs HTTP requests. The 'combined' format provides detailed information about each request.
  app.use(morgan('combined'));
  // Body parsing middleware allows the app to parse incoming request bodies in JSON and URL-encoded formats.
  app.use(express.json());
  // This middleware parses incoming requests with URL-encoded payloads. The 'extended: true' option allows for rich objects and arrays to be encoded into the URL-encoded format.
  app.use(express.urlencoded({ extended: true }));

  // Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'IPL 2022 API Docs',
  }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'IPL API', version: '1.0.0' });
  });

  // API routes
  app.use('/api', router);

  // 404 & Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
