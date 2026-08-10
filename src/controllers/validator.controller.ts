import { Request, Response } from 'express';
import { validatorService } from '../services/validator.service.js';
import { getParam } from '../utils/params.js';

export const validatorController = {
  async getValidators(req: Request, res: Response) {
    const result = await validatorService.getValidators(req.query as Record<string, string>);
    res.json(result.data);
  },

  async getValidatorById(req: Request, res: Response) {
    const validator = await validatorService.getValidatorById(getParam(req.params.id));
    if (!validator) {
      return res.status(404).json({ message: 'Validator not found' });
    }
    res.json(validator);
  },

  async getExpertiseCategories(_req: Request, res: Response) {
    res.json(await validatorService.getExpertiseCategories());
  },

  async getValidatorHistory(req: Request, res: Response) {
    res.json(await validatorService.getValidatorHistory(getParam(req.params.id)));
  },

  async getValidatorReviews(req: Request, res: Response) {
    res.json(await validatorService.getValidatorReviews(getParam(req.params.id)));
  },

  async submitValidatorReview(req: Request, res: Response) {
    const review = await validatorService.submitValidatorReview(getParam(req.params.id), req.body);
    res.status(201).json(review);
  },

  async applyAsValidator(req: Request, res: Response) {
    const validator = await validatorService.applyAsValidator(req.body);
    res.status(201).json(validator);
  },

  async createValidationRequest(req: Request, res: Response) {
    const request = await validatorService.createValidationRequest(req.body);
    res.status(201).json(request);
  },

  async getValidationRequest(req: Request, res: Response) {
    const request = await validatorService.getValidationRequest(getParam(req.params.id));
    if (!request) {
      return res.status(404).json({ message: 'Validation request not found' });
    }
    res.json(request);
  },

  async updateValidationRequest(req: Request, res: Response) {
    const request = await validatorService.updateValidationRequest(
      getParam(req.params.id),
      req.body.status,
      req.body,
    );
    if (!request) {
      return res.status(404).json({ message: 'Validation request not found' });
    }
    res.json(request);
  },
};
