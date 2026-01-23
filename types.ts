
// Enums for status management
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum PartnerStatus {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU'
}

export enum UserRole {
  CLIENT = 'CLIENT',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN'
}

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
}

export interface Partner {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  city: string;
  phone: string;
  status: PartnerStatus;
  joinDate: string;
  rating: number;
}

export interface Experience {
  id: string;
  partnerId: string;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  images: string[];
  maxGuests: number;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  included: string[];
  // Added views property to resolve TS error in dashboards
  views?: number;
}

export interface Review {
  id: string;
  experienceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  experienceId: string;
  clientId: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  hasReviewed?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  partnerId: string;
  clientId: string;
  lastMessage: string;
  lastMessageDate: string;
}
