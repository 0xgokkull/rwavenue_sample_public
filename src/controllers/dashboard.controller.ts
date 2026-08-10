import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  async getDashboardData(req: Request, res: Response) {
    const { searchQuery, filterType } = req.query;
    const data = await dashboardService.getDashboardData(
      searchQuery as string | undefined,
      filterType as string | undefined,
    );
    res.json(data);
  },

  async getPendingValidations(_req: Request, res: Response) {
    res.json(await dashboardService.getPendingValidations());
  },

  async getActionRequired(_req: Request, res: Response) {
    res.json(await dashboardService.getActionRequired());
  },

  async getTotalValue(_req: Request, res: Response) {
    res.json({ totalValue: await dashboardService.getTotalValue() });
  },
};
