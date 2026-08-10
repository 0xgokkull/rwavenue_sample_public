import { prisma } from '../lib/prisma.js';
import {
  toValidationRequestDto,
  toValidatorDto,
  toValidatorReviewDto,
} from '../lib/mappers.js';
import type { AssetCategory, ValidationRequest, Validator } from '../types/asset.js';
import { generateId } from '../utils/id.js';
import type { Prisma } from '../generated/prisma/client.js';

interface ValidatorQuery {
  expertise?: string;
  searchTerm?: string;
  page?: string;
  limit?: string;
}

const buildValidatorWhere = (query: ValidatorQuery): Prisma.ValidatorWhereInput => {
  const where: Prisma.ValidatorWhereInput = {};

  if (query.expertise) {
    where.expertise = { has: query.expertise };
  }

  if (query.searchTerm) {
    where.OR = [
      { name: { contains: query.searchTerm, mode: 'insensitive' } },
      { jurisdiction: { contains: query.searchTerm, mode: 'insensitive' } },
    ];
  }

  return where;
};

export const validatorService = {
  async getValidators(query: ValidatorQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const where = buildValidatorWhere(query);

    const [validators, total] = await Promise.all([
      prisma.validator.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { reputation: 'desc' },
      }),
      prisma.validator.count({ where }),
    ]);

    return {
      data: validators.map(toValidatorDto),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getValidatorById(id: string) {
    const validator = await prisma.validator.findUnique({ where: { id } });
    return validator ? toValidatorDto(validator) : null;
  },

  async getExpertiseCategories() {
    const validators = await prisma.validator.findMany({
      select: { expertise: true },
    });

    return Array.from(new Set(validators.flatMap((validator) => validator.expertise)));
  },

  async getValidatorHistory(validatorId: string) {
    const requests = await prisma.validationRequest.findMany({
      where: { validatorId },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(toValidationRequestDto);
  },

  async getValidatorReviews(validatorId: string) {
    const reviews = await prisma.validatorReview.findMany({
      where: { validatorId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(toValidatorReviewDto);
  },

  async submitValidatorReview(
    validatorId: string,
    review: { rating: number; comment: string; userId?: string },
  ) {
    const userId = review.userId ?? 'user123';

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: 'Reviewer' },
    });

    const record = await prisma.validatorReview.create({
      data: {
        validatorId,
        userId,
        rating: review.rating,
        comment: review.comment,
      },
    });

    return toValidatorReviewDto(record);
  },

  async applyAsValidator(application: {
    name: string;
    expertise: AssetCategory[];
    credentials: string[];
    experience: string;
    documents: string[];
  }): Promise<Validator> {
    const validator = await prisma.validator.create({
      data: {
        id: generateId(),
        name: application.name,
        expertise: application.expertise,
        jurisdiction: 'Pending Review',
        validationCount: 0,
        reputation: 0,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        verificationFeeAmount: 500,
        availability: false,
        responseTime: 'Pending approval',
      },
    });

    return toValidatorDto(validator);
  },

  async createValidationRequest(payload: {
    assetId: string;
    validatorId: string;
    requestType: ValidationRequest['requestType'];
    description: string;
    attachments?: string[];
  }) {
    const request = await prisma.validationRequest.create({
      data: {
        assetId: payload.assetId,
        validatorId: payload.validatorId,
        requestType: payload.requestType,
        description: payload.description,
        attachments: payload.attachments ?? [],
      },
    });

    return toValidationRequestDto(request);
  },

  async getValidationRequest(id: string) {
    const request = await prisma.validationRequest.findUnique({ where: { id } });
    return request ? toValidationRequestDto(request) : null;
  },

  async updateValidationRequest(
    id: string,
    status: 'approved' | 'rejected',
    details?: { comments?: string; validationCertificate?: string },
  ) {
    const request = await prisma.validationRequest.update({
      where: { id },
      data: {
        status,
        comments: details?.comments,
        validationCertificate: details?.validationCertificate,
      },
    }).catch(() => null);

    if (!request) return null;

    if (status === 'approved') {
      await prisma.asset.update({
        where: { id: request.assetId },
        data: {
          status: 'validated',
          isVerified: true,
          validatedAt: new Date(),
        },
      }).catch(() => undefined);
    }

    return toValidationRequestDto(request);
  },
};
