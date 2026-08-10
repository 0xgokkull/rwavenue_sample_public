import { prisma } from '../lib/prisma.js';
import {
  toPaymentMethodDto,
  toTransactionDto,
  transactionInclude,
} from '../lib/mappers.js';
import type { PaymentMethod } from '../types/asset.js';
import { assetService } from './asset.service.js';
import { generateId } from '../utils/id.js';
import type { Prisma } from '../generated/prisma/client.js';

interface TransactionHistoryQuery {
  userId?: string;
  assetId?: string;
  type?: 'purchase' | 'bid' | 'all';
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

const buildTransactionWhere = (query: TransactionHistoryQuery): Prisma.TransactionWhereInput => {
  const where: Prisma.TransactionWhereInput = {};

  if (query.userId) {
    where.OR = [{ buyerId: query.userId }, { sellerId: query.userId }];
  }

  if (query.assetId) {
    where.assetId = query.assetId;
  }

  if (query.type && query.type !== 'all') {
    const typeMap = { purchase: 'buy', bid: 'bid' } as const;
    where.type = typeMap[query.type];
  }

  if (query.startDate || query.endDate) {
    where.timestamp = {
      ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
      ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
    };
  }

  return where;
};

export const transactionService = {
  async processPurchase(payload: {
    assetId: string;
    buyerId: string;
    paymentMethod: PaymentMethod;
    amount: number;
  }) {
    const asset = await prisma.asset.findUnique({
      where: { id: payload.assetId },
      include: { owner: true },
    });
    if (!asset) return null;

    await prisma.user.upsert({
      where: { id: payload.buyerId },
      update: {},
      create: { id: payload.buyerId, name: 'Buyer' },
    });

    const transaction = await prisma.transaction.create({
      data: {
        type: 'buy',
        status: 'completed',
        assetId: asset.id,
        assetTitle: asset.title,
        assetImageUrl: asset.imageUrl,
        amount: payload.amount,
        currency: asset.priceCurrency,
        buyerId: payload.buyerId,
        sellerId: asset.ownerId,
        paymentMethod: payload.paymentMethod,
        hash: `0x${generateId().replace(/-/g, '').slice(0, 16)}`,
      },
      include: transactionInclude,
    });

    return toTransactionDto(transaction);
  },

  async processBid(payload: {
    assetId: string;
    bidderId: string;
    bidAmount: number;
  }) {
    const bid = await assetService.placeBid(payload.assetId, payload.bidAmount, {
      id: payload.bidderId,
      name: 'Bidder',
    });

    if (!bid) return null;

    const asset = await assetService.getAssetById(payload.assetId);

    const transaction = await prisma.transaction.create({
      data: {
        type: 'bid',
        status: 'pending',
        assetId: payload.assetId,
        assetTitle: asset?.title ?? 'Asset',
        assetImageUrl: asset?.imageUrl ?? '',
        amount: payload.bidAmount,
        currency: asset?.price.currency ?? 'USDT',
        buyerId: payload.bidderId,
        sellerId: 'system',
        paymentMethod: 'crypto',
      },
      include: transactionInclude,
    });

    return { bid, transaction: toTransactionDto(transaction) };
  },

  async getTransactionHistory(query: TransactionHistoryQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const where = buildTransactionWhere(query);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map(toTransactionDto),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: transactionInclude,
    });

    return transaction ? toTransactionDto(transaction) : null;
  },

  async processRefund(transactionId: string, reason: string, amount: number) {
    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) return null;

    return {
      transactionId,
      reason,
      amount,
      status: 'completed',
      refundedAt: new Date().toISOString(),
    };
  },

  async getPaymentMethods(userId: string) {
    const methods = await prisma.paymentMethodRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return methods.map(toPaymentMethodDto);
  },

  async addPaymentMethod(
    userId: string,
    paymentMethod: { type: 'crypto' | 'card'; details: Record<string, unknown> },
  ) {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: 'User' },
    });

    const record = await prisma.paymentMethodRecord.create({
      data: {
        userId,
        type: paymentMethod.type,
        details: paymentMethod.details as Prisma.InputJsonValue,
      },
    });

    return toPaymentMethodDto(record);
  },

  async removePaymentMethod(userId: string, paymentMethodId: string) {
    const method = await prisma.paymentMethodRecord.findFirst({
      where: { id: paymentMethodId, userId },
    });

    if (!method) return false;

    await prisma.paymentMethodRecord.delete({ where: { id: paymentMethodId } });
    return true;
  },

  async getTransactionStats(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    const completed = transactions.filter((transaction) => transaction.status === 'completed');

    return {
      totalTransactions: transactions.length,
      completedTransactions: completed.length,
      totalVolume: completed.reduce((sum, transaction) => sum + transaction.amount, 0),
      pendingTransactions: transactions.filter((transaction) => transaction.status === 'pending')
        .length,
    };
  },
};
