import { Router } from 'express';
import { assetController } from '../controllers/asset.controller.js';
import { asyncHandler } from '../middlewares/async.middleware.js';

const router = Router();

router.get('/', asyncHandler(assetController.getCategories));

export default router;
