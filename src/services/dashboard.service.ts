import { prisma } from '../lib/prisma.js';
import { assetInclude, toAssetDto } from '../lib/mappers.js';
import type { DashboardResponse } from '../types/asset.js';
import type { Prisma } from '../generated/prisma/client.js';

export const dashboardService = {
  async getDashboardData(searchQuery?: string, filterType?: string): Promise<DashboardResponse> {
    const where: Prisma.AssetWhereInput = {};

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (filterType && filterType !== 'all') {
      where.category = filterType;
    }

    const [assets, totalAssets, aggregates, pendingValidations, actionRequired] =
      await Promise.all([
        prisma.asset.findMany({
          where,
          include: assetInclude,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.asset.count(),
        prisma.asset.aggregate({ _sum: { value: true } }),
        prisma.asset.count({ where: { status: 'pending' } }),
        prisma.asset.count({ where: { status: 'action_required' } }),
      ]);

    return {
      stats: {
        totalAssets,
        totalValue: aggregates._sum.value ?? 0,
        pendingValidations,
        actionRequired,
      },
      assets: assets.map(toAssetDto),
    };
  },

  async getPendingValidations() {
    const assets = await prisma.asset.findMany({
      where: { status: 'pending' },
      include: assetInclude,
      orderBy: { createdAt: 'desc' },
    });

    return assets.map(toAssetDto);
  },

  async getActionRequired() {
    const assets = await prisma.asset.findMany({
      where: { status: 'action_required' },
      include: assetInclude,
      orderBy: { updatedAt: 'desc' },
    });

    return assets.map(toAssetDto);
  },

  async getTotalValue() {
    const result = await prisma.asset.aggregate({ _sum: { value: true } });
    return result._sum.value ?? 0;
  },
};
