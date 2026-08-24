export type Role = 'USER' | 'ADMIN';

export type Condition = 'BRAND_NEW' | 'LIKE_NEW' | 'LIGHTLY_USED' | 'FAIR';

export type ListingStatus = 'ACTIVE' | 'SOLD';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type VerificationState = 'UNVERIFIED' | 'IN_PROGRESS' | 'VERIFIED' | 'DECLINED';

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phoneNumber?: string | null;
  telegramHandle?: string | null;
  fanNumber?: string | null;
  nationalIdUrl?: string | null;
  verificationState?: VerificationState;
  verifiedStatus: boolean;
  rating: number;
  createdAt: Date;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
};

export type Listing = {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  city: string;
  neighborhood: string;
  status: ListingStatus;
  photos: string[];
  createdAt: Date;
};

export type Transaction = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  paymentGatewayRef?: string | null;
  status: TransactionStatus;
  createdAt: Date;
};

export type Review = {
  id: string;
  transactionId: string;
  reviewerId: string;
  sellerId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
};
