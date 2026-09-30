import { Router } from 'express';
import { checkKycStatus } from '../controllers/kyc.controller.js';

const router = Router();

router.get('/:address/status', checkKycStatus);

export default router;
