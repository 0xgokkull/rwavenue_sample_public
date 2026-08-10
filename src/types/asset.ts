export type AssetCategory =
  | 'real-estate'
  | 'art'
  | 'watches'
  | 'jewelry'
  | 'collectibles'
  | 'vehicles'
  | 'other';

export type AssetStatus = 'pending' | 'validated' | 'rejected' | 'action_required';
export type ListingType = 'fixed' | 'auction' | 'swap';
export type TokenizationType = 'fractional' | 'whole';
export type PaymentMethod = 'crypto' | 'fiat';

export interface Asset {
  id: string;
  title: string;
  description: string;
  category: AssetCategory;
  status: AssetStatus;
  imageUrl: string;
  images?: string[];
  price: {
    amount: number;
    currency: string;
  };
  tokenization: {
    type: TokenizationType;
    totalTokens: number;
    availableTokens: number;
    pricePerToken: number;
  };
  listingType: ListingType;
  isVerified: boolean;
  owner: {
    id: string;
    name: string;
    rating?: number;
  };
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
  views: number;
  likes: number;
  value: number;
  tokenId: string;
  auctionEndTime?: string;
}

export interface Validator {
  id: string;
  name: string;
  expertise: AssetCategory[];
  jurisdiction: string;
  validationCount: number;
  reputation: number;
  avatar: string;
  verificationFee: {
    amount: number;
    currency: string;
  };
  availability: boolean;
  responseTime: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'bid' | 'tokenize';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  asset: {
    id: string;
    title: string;
    imageUrl: string;
  };
  amount: {
    value: number;
    currency: string;
  };
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  paymentMethod: PaymentMethod;
  timestamp: string;
  hash?: string;
}

export interface Bid {
  id: string;
  assetId: string;
  bidder: {
    id: string;
    name: string;
    rating?: number;
  };
  amount: {
    value: number;
    currency: string;
  };
  status: 'active' | 'won' | 'lost' | 'cancelled';
  createdAt: string;
}

export interface ValidationRequest {
  id: string;
  assetId: string;
  validatorId: string;
  requestType: 'authenticity' | 'condition' | 'value';
  description: string;
  attachments?: string[];
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  validationCertificate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatorReview {
  id: string;
  validatorId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaymentMethodRecord {
  id: string;
  userId: string;
  type: 'crypto' | 'card';
  details: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  pendingValidations: number;
  actionRequired: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  assets: Asset[];
}

export interface AssetListQuery {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  verifiedOnly?: string;
  searchQuery?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}
