import { Request, Response } from 'express';
import { OfferService } from '../../application/services/OfferService';
import { OfferRepository } from '../../infrastructure/repositories/OfferRepository';

export class OfferController {
  private offerService: OfferService;

  constructor() {
    const offerRepository = new OfferRepository();
    this.offerService = new OfferService(offerRepository);
  }

  async getAllOffers(req: Request, res: Response): Promise<void> {
    try {
      const offers = await this.offerService.getOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch offers' });
    }
  }

  async getOfferById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const offer = await this.offerService.getOfferById(id);
      if (!offer) {
        res.status(404).json({ message: 'Offer not found' });
        return;
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch offer' });
    }
  }

  async getOffersByMerchant(req: Request, res: Response): Promise<void> {
    try {
      const { merchant } = req.params;
      const offers = await this.offerService.getOffersByMerchant(merchant);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch offers' });
    }
  }

  async getActiveOffers(req: Request, res: Response): Promise<void> {
    try {
      const offers = await this.offerService.getActiveOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch active offers' });
    }
  }

  async getOffersByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      if (type !== 'Deals Hot' && type !== 'Mã Giảm Giá') {
        res.status(400).json({ message: 'Loại deal không hợp lệ' });
        return;
      }
      const offers = await this.offerService.getOffersByType(type);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: 'Không thể lấy danh sách offers theo loại' });
    }
  }
} 