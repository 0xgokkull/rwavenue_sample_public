import { Router } from 'express';
import { validatorController } from '../controllers/validator.controller.js';
import { asyncHandler } from '../middlewares/async.middleware.js';

const router = Router();

router.get('/expertise-categories', asyncHandler(validatorController.getExpertiseCategories));
router.post('/apply', asyncHandler(validatorController.applyAsValidator));
router.get('/', asyncHandler(validatorController.getValidators));
router.get('/:id/history', asyncHandler(validatorController.getValidatorHistory));
router.get('/:id/reviews', asyncHandler(validatorController.getValidatorReviews));
router.post('/:id/reviews', asyncHandler(validatorController.submitValidatorReview));
router.get('/:id', asyncHandler(validatorController.getValidatorById));

export default router;
