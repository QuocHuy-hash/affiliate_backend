import cron from 'node-cron';
import { OfferService } from '../../application/services/OfferService';
import { OfferRepository } from '../repositories/OfferRepository';

export class OfferCronJob {
  private syncCronJob: cron.ScheduledTask;
  private cleanupCronJob: cron.ScheduledTask;
  private offerService: OfferService;

  constructor() {
    const offerRepository = new OfferRepository();
    this.offerService = new OfferService(offerRepository);
    
    console.log('Setting up sync cron job to run every 30 minutes with pattern: */30 * * * *');
    this.syncCronJob = cron.schedule('*/30 * * * *', this.syncOffers.bind(this));
    
    console.log('Setting up cleanup cron job to run daily at midnight with pattern: 0 0 * * *');
    this.cleanupCronJob = cron.schedule('0 0 * * *', this.removeExpiredCoupons.bind(this));
  }

  async start(): Promise<void> {
    try {
      // Fetch data immediately on start
      console.log('Running initial offer sync on startup...');
      await this.syncOffers();
      // Then start the cron jobs
      this.syncCronJob.start();
      this.cleanupCronJob.start();
      console.log('Offer sync and cleanup cron jobs started successfully');
    } catch (error) {
      console.error('Error starting cron jobs:', error);
      throw error;
    }
  }

  stop(): void {
    this.syncCronJob.stop();
    this.cleanupCronJob.stop();
    console.log('All cron jobs stopped');
  }

  private async syncOffers(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Starting offer sync operation...`);
      await this.offerService.syncOffers();
      console.log(`[${new Date().toISOString()}] Completed offer sync operation`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error syncing offers:`, error);
    }
  }

  private async removeExpiredCoupons(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Starting expired coupon cleanup...`);
      await this.offerService.removeExpiredOffers();
      console.log(`[${new Date().toISOString()}] Completed expired coupon cleanup`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error removing expired coupons:`, error);
    }
  }
} 