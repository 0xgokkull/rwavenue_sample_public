import { Router } from 'express';
import { assetController } from '../controllers/asset.controller.js';
import { asyncHandler } from '../middlewares/async.middleware.js';

const router = Router();

router.get('/featured', asyncHandler(assetController.getFeaturedAssets));
router.get('/search', asyncHandler(assetController.searchAssets));
router.get('/', asyncHandler(assetController.getAssets));
router.post('/', asyncHandler(assetController.createAsset));
router.get('/:id/history', asyncHandler(assetController.getAssetHistory));
router.get('/:id/similar', asyncHandler(assetController.getSimilarAssets));
router.post('/:id/bids', asyncHandler(assetController.placeBid));
router.post('/:id/purchase', asyncHandler(assetController.purchaseAsset));
router.post('/:id/verify', asyncHandler(assetController.verifyAsset));
router.get('/:id', asyncHandler(assetController.getAssetById));
router.put('/:id', asyncHandler(assetController.updateAsset));
router.delete('/:id', asyncHandler(assetController.deleteAsset));

export default router;
