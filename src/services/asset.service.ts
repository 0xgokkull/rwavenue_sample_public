import { prisma } from '../lib/prisma.js';
import {
  assetInclude,
  bidInclude,
  toAssetDto,
  toBidDto,
  toTransactionDto,
  transactionInclude,
} from '../lib/mappers.js';
import type { Asset, AssetListQuery, PaymentMethod } from '../types/asset.js';
import { generateId } from '../utils/id.js';
import type { Prisma } from '../generated/prisma/client.js';

const buildAssetWhere = (query: AssetListQuery): Prisma.AssetWhereInput => {
  const where: Prisma.AssetWhereInput = {};

  if (query.category) {
    where.category = query.category;
  }

  if (query.searchQuery) {
    where.OR = [
      { title: { contains: query.searchQuery, mode: 'insensitive' } },
      { description: { contains: query.searchQuery, mode: 'insensitive' } },
    ];
  }

  if (query.verifiedOnly === 'true') {
    where.isVerified = true;
  }

  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.priceAmount = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  return where;
};

const buildAssetOrderBy = (sortBy?: string): Prisma.AssetOrderByWithRelationInput => {
  switch (sortBy) {
    case 'price-high':
      return { priceAmount: 'desc' };
    case 'price-low':
      return { priceAmount: 'asc' };
    case 'name':
      return { title: 'asc' };
    case 'recent':
    default:
      return { createdAt: 'desc' };
  }
};

const ensureUser = async (id: string, name: string, rating?: number) => {
  return prisma.user.upsert({
    where: { id },
    update: { name, rating },
    create: { id, name, rating },
  });
};

export const assetService = {
  async getAssets(query: AssetListQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const where = buildAssetWhere(query);

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: assetInclude,
        orderBy: buildAssetOrderBy(query.sortBy),
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      data: assets.map(toAssetDto),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getFeaturedAssets() {
    const assets = await prisma.asset.findMany({
      where: { isVerified: true },
      include: assetInclude,
      orderBy: { views: 'desc' },
      take: 6,
    });

    return assets.map(toAssetDto);
  },

  async searchAssets(query: string) {
    const assets = await prisma.asset.findMany({
      where: buildAssetWhere({ searchQuery: query }),
      include: assetInclude,
      orderBy: { createdAt: 'desc' },
    });

    return assets.map(toAssetDto);
  },

  async getAssetById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: assetInclude,
    });

    return asset ? toAssetDto(asset) : null;
  },

  async getSimilarAssets(id: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) return [];

    const similar = await prisma.asset.findMany({
      where: {
        id: { not: id },
        category: asset.category,
      },
      include: assetInclude,
      take: 4,
    });

    return similar.map(toAssetDto);
  },

  async getUserAssets(userId: string) {
    const assets = await prisma.asset.findMany({
      where: { ownerId: userId },
      include: assetInclude,
      orderBy: { createdAt: 'desc' },
    });

    return assets.map(toAssetDto);
  },

  async getCategories() {
    const categories = await prisma.asset.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map((item) => item.category);
  },

  async createAsset(payload: Partial<Asset>) {
    const owner = payload.owner ?? { id: 'anonymous', name: 'Anonymous' };
    await ensureUser(owner.id, owner.name, owner.rating);

    const asset = await prisma.asset.create({
      data: {
        id: generateId(),
        title: payload.title ?? 'Untitled Asset',
        description: payload.description ?? '',
        category: payload.category ?? 'other',
        status: payload.status ?? 'pending',
        imageUrl: payload.imageUrl ?? '',
        images: payload.images ?? [],
        priceAmount: payload.price?.amount ?? 0,
        priceCurrency: payload.price?.currency ?? 'USDT',
        tokenizationType: payload.tokenization?.type ?? 'whole',
        totalTokens: payload.tokenization?.totalTokens ?? 1,
        availableTokens: payload.tokenization?.availableTokens ?? 1,
        pricePerToken: payload.tokenization?.pricePerToken ?? payload.price?.amount ?? 0,
        listingType: payload.listingType ?? 'fixed',
        isVerified: payload.isVerified ?? false,
        ownerId: owner.id,
        views: payload.views ?? 0,
        likes: payload.likes ?? 0,
        value: payload.value ?? payload.price?.amount ?? 0,
        tokenId: payload.tokenId ?? generateId().slice(0, 8),
        auctionEndTime: payload.auctionEndTime ? new Date(payload.auctionEndTime) : undefined,
      },
      include: assetInclude,
    });

    return toAssetDto(asset);
  },

  async updateAsset(id: string, updates: Partial<Asset>) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) return null;

    if (updates.owner) {
      await ensureUser(updates.owner.id, updates.owner.name, updates.owner.rating);
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        category: updates.category,
        status: updates.status,
        imageUrl: updates.imageUrl,
        images: updates.images,
        priceAmount: updates.price?.amount,
        priceCurrency: updates.price?.currency,
        tokenizationType: updates.tokenization?.type,
        totalTokens: updates.tokenization?.totalTokens,
        availableTokens: updates.tokenization?.availableTokens,
        pricePerToken: updates.tokenization?.pricePerToken,
        listingType: updates.listingType,
        isVerified: updates.isVerified,
        ownerId: updates.owner?.id,
        views: updates.views,
        likes: updates.likes,
        value: updates.value,
        tokenId: updates.tokenId,
        validatedAt: updates.validatedAt ? new Date(updates.validatedAt) : undefined,
        auctionEndTime: updates.auctionEndTime ? new Date(updates.auctionEndTime) : undefined,
      },
      include: assetInclude,
    });

    return toAssetDto(asset);
  },

  async deleteAsset(id: string) {
    try {
      await prisma.asset.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async placeBid(
    assetId: string,
    amount: number,
    bidder: { id: string; name: string; rating?: number } = { id: 'user123', name: 'John Doe' },
  ) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return null;

    await ensureUser(bidder.id, bidder.name, bidder.rating);

    const bid = await prisma.bid.create({
      data: {
        assetId,
        bidderId: bidder.id,
        amount,
        currency: asset.priceCurrency,
      },
      include: bidInclude,
    });

    return toBidDto(bid);
  },

  async purchaseAsset(assetId: string, paymentMethod: PaymentMethod, buyerId = 'user123') {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: assetInclude,
    });
    if (!asset) return null;

    await ensureUser(buyerId, 'John Doe');

    const transaction = await prisma.transaction.create({
      data: {
        type: 'buy',
        status: 'completed',
        assetId: asset.id,
        assetTitle: asset.title,
        assetImageUrl: asset.imageUrl,
        amount: asset.priceAmount,
        currency: asset.priceCurrency,
        buyerId,
        sellerId: asset.ownerId,
        paymentMethod,
        hash: `0x${generateId().replace(/-/g, '').slice(0, 16)}`,
      },
      include: transactionInclude,
    });

    return toTransactionDto(transaction);
  },

  async getAssetHistory(assetId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { assetId },
      include: transactionInclude,
      orderBy: { timestamp: 'desc' },
    });

    return transactions.map(toTransactionDto);
  },

  async verifyAsset(assetId: string, validatorId: string) {
    const validator = await prisma.validator.findUnique({ where: { id: validatorId } });

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        isVerified: true,
        status: 'validated',
        validatedAt: new Date(),
      },
      include: assetInclude,
    }).catch(() => null);

    if (!asset) return null;

    return {
      asset: toAssetDto(asset),
      verifiedBy: validator?.name ?? 'System Validator',
    };
  },
};
