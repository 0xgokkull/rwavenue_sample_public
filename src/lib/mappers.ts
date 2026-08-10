import type {
  Asset,
  Bid,
  PaymentMethodRecord,
  Transaction,
  ValidationRequest,
  Validator,
  ValidatorReview,
} from '../types/asset.js';
import type {
  Asset as PrismaAsset,
  Bid as PrismaBid,
  PaymentMethodRecord as PrismaPaymentMethod,
  Transaction as PrismaTransaction,
  User,
  ValidationRequest as PrismaValidationRequest,
  Validator as PrismaValidator,
  ValidatorReview as PrismaValidatorReview,
} from '../generated/prisma/client.js';

type AssetWithOwner = PrismaAsset & { owner: User };

export const toIso = (date: Date | null | undefined) =>
  date ? date.toISOString() : undefined;

export const toAssetDto = (asset: AssetWithOwner): Asset => ({
  id: asset.id,
  title: asset.title,
  description: asset.description,
  category: asset.category as Asset['category'],
  status: asset.status,
  imageUrl: asset.imageUrl,
  images: asset.images.length > 0 ? asset.images : undefined,
  price: {
    amount: asset.priceAmount,
    currency: asset.priceCurrency,
  },
  tokenization: {
    type: asset.tokenizationType,
    totalTokens: asset.totalTokens,
    availableTokens: asset.availableTokens,
    pricePerToken: asset.pricePerToken,
  },
  listingType: asset.listingType,
  isVerified: asset.isVerified,
  owner: {
    id: asset.owner.id,
    name: asset.owner.name,
    rating: asset.owner.rating ?? undefined,
  },
  createdAt: asset.createdAt.toISOString(),
  updatedAt: asset.updatedAt.toISOString(),
  validatedAt: toIso(asset.validatedAt),
  views: asset.views,
  likes: asset.likes,
  value: asset.value,
  tokenId: asset.tokenId,
  auctionEndTime: toIso(asset.auctionEndTime),
});

export const toValidatorDto = (validator: PrismaValidator): Validator => ({
  id: validator.id,
  name: validator.name,
  expertise: validator.expertise as Validator['expertise'],
  jurisdiction: validator.jurisdiction,
  validationCount: validator.validationCount,
  reputation: validator.reputation,
  avatar: validator.avatar,
  verificationFee: {
    amount: validator.verificationFeeAmount,
    currency: validator.verificationFeeCurrency,
  },
  availability: validator.availability,
  responseTime: validator.responseTime,
});

export const toTransactionDto = (
  transaction: PrismaTransaction & { buyer: User; seller: User },
): Transaction => ({
  id: transaction.id,
  type: transaction.type,
  status: transaction.status,
  asset: {
    id: transaction.assetId,
    title: transaction.assetTitle,
    imageUrl: transaction.assetImageUrl,
  },
  amount: {
    value: transaction.amount,
    currency: transaction.currency,
  },
  buyer: {
    id: transaction.buyer.id,
    name: transaction.buyer.name,
  },
  seller: {
    id: transaction.seller.id,
    name: transaction.seller.name,
  },
  paymentMethod: transaction.paymentMethod,
  timestamp: transaction.timestamp.toISOString(),
  hash: transaction.hash ?? undefined,
});

export const toBidDto = (bid: PrismaBid & { bidder: User }): Bid => ({
  id: bid.id,
  assetId: bid.assetId,
  bidder: {
    id: bid.bidder.id,
    name: bid.bidder.name,
    rating: bid.bidder.rating ?? undefined,
  },
  amount: {
    value: bid.amount,
    currency: bid.currency,
  },
  status: bid.status,
  createdAt: bid.createdAt.toISOString(),
});

export const toValidationRequestDto = (request: PrismaValidationRequest): ValidationRequest => ({
  id: request.id,
  assetId: request.assetId,
  validatorId: request.validatorId,
  requestType: request.requestType,
  description: request.description,
  attachments: request.attachments.length > 0 ? request.attachments : undefined,
  status: request.status,
  comments: request.comments ?? undefined,
  validationCertificate: request.validationCertificate ?? undefined,
  createdAt: request.createdAt.toISOString(),
  updatedAt: request.updatedAt.toISOString(),
});

export const toValidatorReviewDto = (review: PrismaValidatorReview): ValidatorReview => ({
  id: review.id,
  validatorId: review.validatorId,
  userId: review.userId,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt.toISOString(),
});

export const toPaymentMethodDto = (method: PrismaPaymentMethod): PaymentMethodRecord => ({
  id: method.id,
  userId: method.userId,
  type: method.type,
  details: method.details as Record<string, unknown>,
  createdAt: method.createdAt.toISOString(),
});

export const assetInclude = { owner: true } as const;

export const transactionInclude = { buyer: true, seller: true } as const;

export const bidInclude = { bidder: true } as const;
