import { Request, Response } from 'express';
import { assetService } from '../services/asset.service.js';
import type { AssetListQuery } from '../types/asset.js';
import { getParam } from '../utils/params.js';

export const assetController = {
  async getAssets(req: Request, res: Response) {
    const result = await assetService.getAssets(req.query as AssetListQuery);
    res.json(result);
  },

  async getFeaturedAssets(_req: Request, res: Response) {
    res.json(await assetService.getFeaturedAssets());
  },

  async searchAssets(req: Request, res: Response) {
    const query = String(req.query.q ?? '');
    res.json(await assetService.searchAssets(query));
  },

  async getAssetById(req: Request, res: Response) {
    const asset = await assetService.getAssetById(getParam(req.params.id));
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  },

  async getSimilarAssets(req: Request, res: Response) {
    res.json(await assetService.getSimilarAssets(getParam(req.params.id)));
  },

  async getAssetHistory(req: Request, res: Response) {
    res.json(await assetService.getAssetHistory(getParam(req.params.id)));
  },

  async createAsset(req: Request, res: Response) {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json(asset);
  },

  async updateAsset(req: Request, res: Response) {
    const asset = await assetService.updateAsset(getParam(req.params.id), req.body);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  },

  async deleteAsset(req: Request, res: Response) {
    const deleted = await assetService.deleteAsset(getParam(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(204).send();
  },

  async placeBid(req: Request, res: Response) {
    const bid = await assetService.placeBid(getParam(req.params.id), Number(req.body.amount));
    if (!bid) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(201).json(bid);
  },

  async purchaseAsset(req: Request, res: Response) {
    const transaction = await assetService.purchaseAsset(
      getParam(req.params.id),
      req.body.paymentMethod,
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(201).json(transaction);
  },

  async verifyAsset(req: Request, res: Response) {
    const result = await assetService.verifyAsset(getParam(req.params.id), req.body.validatorId);
    if (!result) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(result);
  },

  async getCategories(_req: Request, res: Response) {
    res.json(await assetService.getCategories());
  },

  async getUserAssets(req: Request, res: Response) {
    res.json(await assetService.getUserAssets(getParam(req.params.userId)));
  },
};
