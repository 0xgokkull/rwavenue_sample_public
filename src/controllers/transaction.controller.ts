import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service.js';
import { getParam } from '../utils/params.js';

export const transactionController = {
  async processPurchase(req: Request, res: Response) {
    const transaction = await transactionService.processPurchase(req.body);
    if (!transaction) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(201).json(transaction);
  },

  async processBid(req: Request, res: Response) {
    const result = await transactionService.processBid(req.body);
    if (!result) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(201).json(result);
  },

  async getTransactionHistory(req: Request, res: Response) {
    const result = await transactionService.getTransactionHistory(
      req.query as Record<string, string>,
    );
    res.json(result);
  },

  async getTransactionById(req: Request, res: Response) {
    const transaction = await transactionService.getTransactionById(getParam(req.params.id));
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  },

  async processRefund(req: Request, res: Response) {
    const refund = await transactionService.processRefund(
      getParam(req.params.id),
      req.body.reason,
      Number(req.body.amount),
    );
    if (!refund) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(refund);
  },

  async getPaymentMethods(req: Request, res: Response) {
    res.json(await transactionService.getPaymentMethods(getParam(req.params.userId)));
  },

  async addPaymentMethod(req: Request, res: Response) {
    const method = await transactionService.addPaymentMethod(getParam(req.params.userId), req.body);
    res.status(201).json(method);
  },

  async removePaymentMethod(req: Request, res: Response) {
    const removed = await transactionService.removePaymentMethod(
      getParam(req.params.userId),
      getParam(req.params.paymentMethodId),
    );
    if (!removed) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    res.status(204).send();
  },

  async getTransactionStats(req: Request, res: Response) {
    res.json(await transactionService.getTransactionStats(getParam(req.params.userId)));
  },
};
