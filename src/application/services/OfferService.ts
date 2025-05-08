import { Offer } from '../../domain/entities/Offer';
import { IOfferRepository } from '../../domain/repositories/IOfferRepository';
import { xacDinhLoaiDeal } from '../../infrastructure/utils/dealTypeUtils';

export class OfferService {
  constructor(private offerRepository: IOfferRepository) {}

  async fetchOffersFromAccessTrade(): Promise<Offer[]> {
    try {
      const response = await fetch('https://api.accesstrade.vn/v1/offers_informations', {
        headers: {
          'Authorization': 'Token 2vP_sOALZaB6LxrwO5B0EklfC0dwMohF',
          'Content-Type': 'application/json'
        }
      });
      // Kiểm tra xem phản hồi có thành công không
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { data: Offer[] };
      return data.data;
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  }

  private hasOfferChanged(existingOffer: Offer, newOffer: Offer): boolean {
    // Kiểm tra thay đổi của coupon_code
    const existingCouponCodes = existingOffer.coupons.map(c => c.coupon_code).sort();
    const newCouponCodes = newOffer.coupons.map(c => c.coupon_code).sort();
    const couponCodesChanged = JSON.stringify(existingCouponCodes) !== JSON.stringify(newCouponCodes);

    // Kiểm tra thay đổi của merchant
    const merchantChanged = existingOffer.merchant !== newOffer.merchant;

    // Kiểm tra thay đổi của end_time
    const endTimeChanged = existingOffer.end_time !== newOffer.end_time;

    return couponCodesChanged || merchantChanged || endTimeChanged;
  }

  async syncOffers(): Promise<void> {
    try {
      const newOffers = await this.fetchOffersFromAccessTrade();
      const existingOffers = await this.offerRepository.getOffers();

      const offersToAdd: Offer[] = [];
      const offersToUpdate: Offer[] = [];

      for (const newOffer of newOffers) {
        // Thêm loại deal cho offer mới
        newOffer.loai_deal = xacDinhLoaiDeal(newOffer);
        
        const existingOffer = existingOffers.find(o => o.id === newOffer.id);
        
        if (!existingOffer) {
          offersToAdd.push(newOffer);
        } else if (this.hasOfferChanged(existingOffer, newOffer)) {
          offersToUpdate.push(newOffer);
        }
      }

      if (offersToAdd.length > 0) {
        await this.offerRepository.saveOffers(offersToAdd);
        console.log(`Đã thêm ${offersToAdd.length} offers mới`);
      }

      if (offersToUpdate.length > 0) {
        await this.offerRepository.updateOffers(offersToUpdate);
        console.log(`Đã cập nhật ${offersToUpdate.length} offers`);
      }
    } catch (error) {
      console.error('Lỗi khi đồng bộ offers:', error);
      throw error;
    }
  }

  async getOffers(): Promise<Offer[]> {
    return this.offerRepository.findAll();
  }

  async getOfferById(id: string): Promise<Offer | null> {
    return this.offerRepository.findById(id);
  }

  async getOffersByMerchant(merchant: string): Promise<Offer[]> {
    return this.offerRepository.findByMerchant(merchant);
  }

  async getActiveOffers(): Promise<Offer[]> {
    return this.offerRepository.findActive();
  }

  // Thêm phương thức mới để lấy offers theo loại
  async getOffersByType(loaiDeal: string): Promise<Offer[]> {
    const offers = await this.offerRepository.getOffers();
    return offers.filter(offer => offer.loai_deal === loaiDeal);
  }
} 