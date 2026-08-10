import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller.js';
import { assetController } from '../controllers/asset.controller.js';
import { asyncHandler } from '../middlewares/async.middleware.js';

const router = Router();

router.post('/purchase', asyncHandler(transactionController.processPurchase));
router.post('/bid', asyncHandler(transactionController.processBid));
router.get('/history', asyncHandler(transactionController.getTransactionHistory));
router.get('/:id', asyncHandler(transactionController.getTransactionById));
router.post('/:id/refund', asyncHandler(transactionController.processRefund));

const userRouter = Router();

userRouter.get('/:userId/assets', asyncHandler(assetController.getUserAssets));
userRouter.get('/:userId/payment-methods', asyncHandler(transactionController.getPaymentMethods));
userRouter.post('/:userId/payment-methods', asyncHandler(transactionController.addPaymentMethod));
userRouter.delete(
  '/:userId/payment-methods/:paymentMethodId',
  asyncHandler(transactionController.removePaymentMethod),
);
userRouter.get('/:userId/transaction-stats', asyncHandler(transactionController.getTransactionStats));

export { router as transactionRoutes, userRouter as userRoutes };
