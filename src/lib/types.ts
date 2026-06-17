export type Category = "農業体験" | "料理教室" | "ものづくり" | "学習体験" | "自然体験" | "その他";

export type Provider = {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  category: Category;
  location: string;
  instagram?: string;
  yearsActive?: number;
  totalParticipants?: number;
  tags?: string[];
};

export type Experience = {
  id: string;
  providerId: string;
  provider: Provider;
  title: string;
  description: string;
  date: string; // ISO date string
  timeStart: string; // "10:00"
  timeEnd: string; // "12:00"
  location: string;
  priceMember: number;
  priceRegular: number;
  capacity: number;
  currentBookings: number;
  imageUrl: string;
  category: Category;
  tags: string[];
  isFeatured?: boolean;
};

export type Review = {
  id: string;
  experienceId: string;
  userId?: string;
  reviewerName: string;
  reviewerAvatar: string;
  childAge: string;
  rating: number;
  comment: string;
  date: string;
};

export type Booking = {
  experienceId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childrenCount: number;
  adultsCount: number;
  message?: string;
};
