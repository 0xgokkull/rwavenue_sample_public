import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { asyncHandler } from '../middlewares/async.middleware.js';

const router = Router();

router.get('/', asyncHandler(dashboardController.getDashboardData));
router.get('/pending-validations', asyncHandler(dashboardController.getPendingValidations));
router.get('/action-required', asyncHandler(dashboardController.getActionRequired));
router.get('/total-value', asyncHandler(dashboardController.getTotalValue));

export default router;
