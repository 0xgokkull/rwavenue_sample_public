import { Router } from 'express';
import { validatorController } from '../controllers/validator.controller.js';
import { asyncHandler } from '../middlewares/async.middleware.js';

const router = Router();

router.post('/', asyncHandler(validatorController.createValidationRequest));
router.get('/:id', asyncHandler(validatorController.getValidationRequest));
router.put('/:id', asyncHandler(validatorController.updateValidationRequest));

export default router;
