import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/rwavenue?schema=public',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users = [
  { id: 'user123', name: 'John Doe', rating: 4.5 },
  { id: 'user456', name: 'Robert Wilson', rating: 4.6 },
  { id: 'user789', name: 'Emma Thompson', rating: 4.8 },
  { id: 'user234', name: 'Isabella Chen', rating: 4.9 },
  { id: 'user567', name: 'Victoria Adams', rating: 4.7 },
  { id: 'seller456', name: 'Jane Smith', rating: 4.4 },
  { id: 'system', name: 'RWAvenue', rating: null },
];

const assets = [
  {
    id: 're1',
    title: 'Luxury Downtown Penthouse',
    description:
      'Stunning 3-bedroom penthouse with panoramic city views, private elevator, and rooftop terrace',
    category: 'real-estate',
    status: 'validated' as const,
    value: 3500000,
    imageUrl: '/assets/real-estate/penthouse-1.jpg.svg',
    createdAt: new Date('2024-01-05'),
    validatedAt: new Date('2024-01-12'),
    ownerId: 'user789',
    tokenizationType: 'fractional' as const,
    totalTokens: 1000,
    availableTokens: 850,
    pricePerToken: 3500,
    updatedAt: new Date('2024-01-05'),
    views: 450,
    likes: 120,
    priceAmount: 3500000,
    isVerified: true,
    listingType: 'fixed' as const,
    tokenId: '10001',
  },
  {
    id: 're2',
    title: 'Historic Vineyard Estate',
    description:
      'Magnificent 50-acre wine estate with main villa, guest house, and productive vineyard',
    category: 'real-estate',
    status: 'pending' as const,
    value: 8500000,
    imageUrl: '/assets/real-estate/vineyard-1.jpg.svg',
    createdAt: new Date('2024-02-10'),
    ownerId: 'user456',
    tokenizationType: 'fractional' as const,
    totalTokens: 2000,
    availableTokens: 2000,
    pricePerToken: 4250,
    updatedAt: new Date('2024-02-10'),
    views: 280,
    likes: 95,
    priceAmount: 8500000,
    isVerified: false,
    listingType: 'auction' as const,
    auctionEndTime: new Date('2024-04-10'),
    tokenId: '10002',
  },
  {
    id: 'j1',
    title: 'Art Deco Diamond Ring',
    description:
      'Exquisite 1920s platinum ring featuring a 3.5ct center diamond with sapphire accents',
    category: 'jewelry',
    status: 'validated' as const,
    value: 85000,
    imageUrl: '/assets/jewelry/diamond-ring-1.jpg',
    createdAt: new Date('2024-01-18'),
    validatedAt: new Date('2024-01-25'),
    ownerId: 'user234',
    tokenizationType: 'whole' as const,
    totalTokens: 1,
    availableTokens: 1,
    pricePerToken: 85000,
    updatedAt: new Date('2024-01-18'),
    views: 320,
    likes: 78,
    priceAmount: 85000,
    isVerified: true,
    listingType: 'fixed' as const,
    tokenId: '10003',
  },
  {
    id: 'j2',
    title: 'Emerald and Pearl Tiara',
    description:
      'Royal collection piece featuring natural Colombian emeralds and South Sea pearls',
    category: 'jewelry',
    status: 'action_required' as const,
    value: 125000,
    imageUrl: '/assets/jewelry/tiara-1.jpg',
    createdAt: new Date('2024-02-15'),
    ownerId: 'user567',
    tokenizationType: 'fractional' as const,
    totalTokens: 100,
    availableTokens: 100,
    pricePerToken: 1250,
    updatedAt: new Date('2024-02-15'),
    views: 180,
    likes: 45,
    priceAmount: 125000,
    isVerified: false,
    listingType: 'auction' as const,
    auctionEndTime: new Date('2024-03-15'),
    tokenId: '10004',
  },
  {
    id: '1',
    title: 'Vintage Rolex Daytona',
    description: 'Rare 1960s Rolex Daytona in excellent condition',
    category: 'watches',
    status: 'validated' as const,
    value: 180000,
    imageUrl: '/assets/watches/rolex-daytona.jpg',
    createdAt: new Date('2024-01-15'),
    validatedAt: new Date('2024-01-20'),
    ownerId: 'user123',
    tokenizationType: 'whole' as const,
    totalTokens: 1,
    availableTokens: 1,
    pricePerToken: 180000,
    updatedAt: new Date('2024-01-15'),
    views: 250,
    likes: 45,
    priceAmount: 180000,
    isVerified: true,
    listingType: 'fixed' as const,
    tokenId: '10005',
  },
  {
    id: '2',
    title: 'Contemporary Abstract Painting',
    description: 'Original artwork by emerging artist Sarah Chen',
    category: 'art',
    status: 'pending' as const,
    value: 15000,
    imageUrl: '/assets/art/abstract-1.jpg',
    createdAt: new Date('2024-02-01'),
    ownerId: 'user123',
    tokenizationType: 'fractional' as const,
    totalTokens: 100,
    availableTokens: 100,
    pricePerToken: 150,
    updatedAt: new Date('2024-02-01'),
    views: 75,
    likes: 20,
    priceAmount: 15000,
    isVerified: false,
    listingType: 'auction' as const,
    auctionEndTime: new Date('2024-03-01'),
    tokenId: '10006',
  },
  {
    id: '3',
    title: 'Sapphire and Diamond Necklace',
    description: 'Vintage 18k gold necklace with natural sapphires',
    category: 'jewelry',
    status: 'action_required' as const,
    value: 45000,
    imageUrl: '/assets/jewelry/sapphire-necklace.jpg',
    createdAt: new Date('2024-01-25'),
    ownerId: 'user123',
    tokenizationType: 'whole' as const,
    totalTokens: 1,
    availableTokens: 1,
    pricePerToken: 45000,
    updatedAt: new Date('2024-01-25'),
    views: 120,
    likes: 35,
    priceAmount: 45000,
    isVerified: false,
    listingType: 'fixed' as const,
    tokenId: '10007',
  },
  {
    id: '4',
    title: 'Luxury Beachfront Villa',
    description: 'Modern 5-bedroom villa with private beach access',
    category: 'real-estate',
    status: 'validated' as const,
    value: 2500000,
    imageUrl: '/assets/real-estate/villa-1.jpg.svg',
    createdAt: new Date('2024-01-10'),
    validatedAt: new Date('2024-01-18'),
    ownerId: 'user123',
    tokenizationType: 'fractional' as const,
    totalTokens: 1000,
    availableTokens: 1000,
    pricePerToken: 2500,
    updatedAt: new Date('2024-01-10'),
    views: 300,
    likes: 85,
    priceAmount: 2500000,
    isVerified: true,
    listingType: 'fixed' as const,
    tokenId: '10008',
  },
  {
    id: '5',
    title: 'Rare Baseball Card Collection',
    description: 'Complete set of 1952 Topps cards',
    category: 'collectibles',
    status: 'action_required' as const,
    value: 75000,
    imageUrl: '/assets/collectibles/baseball-cards.png',
    createdAt: new Date('2024-02-05'),
    ownerId: 'user123',
    tokenizationType: 'whole' as const,
    totalTokens: 1,
    availableTokens: 1,
    pricePerToken: 75000,
    updatedAt: new Date('2024-02-05'),
    views: 90,
    likes: 25,
    priceAmount: 75000,
    isVerified: false,
    listingType: 'fixed' as const,
    tokenId: '10009',
  },
];

const validators = [
  {
    id: '1',
    name: 'John Anderson',
    expertise: ['watches', 'jewelry'],
    jurisdiction: 'United States',
    validationCount: 156,
    reputation: 4.8,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    verificationFeeAmount: 500,
    availability: true,
    responseTime: '24-48 hours',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    expertise: ['art', 'collectibles'],
    jurisdiction: 'Singapore',
    validationCount: 243,
    reputation: 4.9,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    verificationFeeAmount: 750,
    availability: true,
    responseTime: '24 hours',
  },
  {
    id: '3',
    name: 'Michael Roberts',
    expertise: ['real-estate'],
    jurisdiction: 'United Kingdom',
    validationCount: 89,
    reputation: 4.7,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    verificationFeeAmount: 1200,
    availability: true,
    responseTime: '48-72 hours',
  },
  {
    id: '4',
    name: 'Emily Thompson',
    expertise: ['jewelry', 'art'],
    jurisdiction: 'Canada',
    validationCount: 167,
    reputation: 4.9,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    verificationFeeAmount: 600,
    availability: false,
    responseTime: '24-48 hours',
  },
];

async function main() {
  await prisma.paymentMethodRecord.deleteMany();
  await prisma.validatorReview.deleteMany();
  await prisma.validationRequest.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.validator.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: users });

  for (const asset of assets) {
    await prisma.asset.create({ data: asset });
  }

  await prisma.validator.createMany({ data: validators });

  await prisma.transaction.createMany({
    data: [
      {
        id: 't1',
        type: 'buy',
        status: 'completed',
        assetId: '1',
        assetTitle: 'Vintage Rolex Daytona',
        assetImageUrl: '/assets/watches/rolex-daytona.jpg',
        amount: 180000,
        buyerId: 'user123',
        sellerId: 'seller456',
        paymentMethod: 'crypto',
        timestamp: new Date('2024-01-15'),
        hash: '0xabc123',
      },
      {
        id: 't2',
        type: 'tokenize',
        status: 'pending',
        assetId: '2',
        assetTitle: 'Contemporary Abstract Painting',
        assetImageUrl: '/assets/art/abstract-1.jpg',
        amount: 15000,
        buyerId: 'user123',
        sellerId: 'system',
        paymentMethod: 'fiat',
        timestamp: new Date('2024-02-01'),
      },
    ],
  });

  await prisma.paymentMethodRecord.create({
    data: {
      id: 'pm1',
      userId: 'user123',
      type: 'crypto',
      details: { walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
      createdAt: new Date('2024-01-01'),
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
