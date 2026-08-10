import { Router } from 'express';
import healthRoutes from './health.routes.js';
import assetRoutes from './asset.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import validatorRoutes from './validator.routes.js';
import validationRequestRoutes from './validationRequest.routes.js';
import categoryRoutes from './category.routes.js';
import { transactionRoutes, userRoutes } from './transaction.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/assets', assetRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/validators', validatorRoutes);
router.use('/validation-requests', validationRequestRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/users', userRoutes);

export default router;
