import { Offer } from '../entities/Offer';

export interface IOfferRepository {
  saveOffers(offers: Offer[]): Promise<void>;
  getOffers(): Promise<Offer[]>;
  updateOffers(offers: Offer[]): Promise<void>;
  findAll(): Promise<Offer[]>;
  findById(id: string): Promise<Offer | null>;
  findByMerchant(merchant: string): Promise<Offer[]>;
  findActive(): Promise<Offer[]>;
  save(offer: Offer): Promise<Offer>;
  update(id: string, offer: Partial<Offer>): Promise<Offer | null>;
  delete(id: string): Promise<void>;
} 