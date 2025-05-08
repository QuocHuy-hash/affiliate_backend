import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './infrastructure/config/database';
import { OfferCronJob } from './infrastructure/cron/OfferCronJob';
import { swaggerSpec } from './infrastructure/api-docs/swagger';
import offerRoutes from './interfaces/routes/offerRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function startApp() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    // Middleware
    app.use(express.json());
    app.use(cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(compression());
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
    }));

    // API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Routes
    app.use('/api/offers', offerRoutes);

    // 404 handler
    app.use((req, res, next) => {
      res.status(404).json({ message: 'Not Found' });
    });

    // Error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error(err);
      res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
      });
    });

    // Khởi động server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Khởi động cron job
    const offerCronJob = new OfferCronJob();
    offerCronJob.start();
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

startApp(); 