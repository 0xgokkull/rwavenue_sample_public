import { Request, Response } from 'express';
import { getKycStatus } from '../services/kyc.service.js';
import { ethers } from 'ethers';

export const checkKycStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;

    if (!/^0x[a-fA-F0-9]{39,40}$/.test(address)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    const status = await getKycStatus(address);
    res.json(status);
  } catch (error: any) {
    if (error.message === 'KYC_CONTRACT_ADDRESS is not configured') {
      res.status(500).json({ error: error.message });
      return;
    }
    console.error('KYC error:', error);
    res.status(502).json({ error: 'Failed to read KYC status from blockchain' });
  }
};
