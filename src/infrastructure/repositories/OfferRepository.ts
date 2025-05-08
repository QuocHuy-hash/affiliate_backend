import { Repository } from 'typeorm';
import { Offer } from '../../domain/entities/Offer';
import { IOfferRepository } from '../../domain/repositories/IOfferRepository';
import { AppDataSource } from '../config/database';

export class OfferRepository implements IOfferRepository {
  private repository: Repository<Offer>;

  constructor() {
    this.repository = AppDataSource.getRepository(Offer);
  }

  async saveOffers(offers: Offer[]): Promise<void> {
    await this.repository.save(offers);
  }

  async getOffers(): Promise<Offer[]> {
    return this.repository.find();
  }

  async updateOffers(offers: Offer[]): Promise<void> {
    await this.repository.save(offers);
  }

  async findAll(): Promise<Offer[]> {
    return this.getOffers();
  }

  async findById(id: string): Promise<Offer | null> {
    const offers = await this.getOffers();
    return offers.find(offer => offer.id === id) || null;
  }

  async findByMerchant(merchant: string): Promise<Offer[]> {
    const offers = await this.getOffers();
    return offers.filter(offer => offer.merchant === merchant);
  }

  async findActive(): Promise<Offer[]> {
    const offers = await this.getOffers();
    const now = new Date();
    return offers.filter(offer => new Date(offer.end_time) > now);
  }

  async save(offer: Offer): Promise<Offer> {
    const offers = await this.getOffers();
    offers.push(offer);
    await this.saveOffers(offers);
    return offer;
  }

  async update(id: string, offerData: Partial<Offer>): Promise<Offer | null> {
    const offers = await this.getOffers();
    const index = offers.findIndex(offer => offer.id === id);
    if (index === -1) return null;
    
    offers[index] = { ...offers[index], ...offerData };
    await this.saveOffers(offers);
    return offers[index];
  }

  async delete(id: string): Promise<void> {
    const offers = await this.getOffers();
    const filteredOffers = offers.filter(offer => offer.id !== id);
    await this.saveOffers(filteredOffers);
  }
} 