import cron from 'node-cron';
import { OfferService } from '../../application/services/OfferService';
import { OfferRepository } from '../repositories/OfferRepository';

export class OfferCronJob {
  private cronJob: cron.ScheduledTask;
  private offerService: OfferService;

  constructor() {
    const offerRepository = new OfferRepository();
    this.offerService = new OfferService(offerRepository);
    console.log('Setting up cron job to run every minute with pattern: */1 * * * *');
    this.cronJob = cron.schedule('*/1 * * * *', this.syncOffers.bind(this));
  }

  async start(): Promise<void> {
    try {
      // Fetch data immediately on start
      console.log('Running initial offer sync on startup...');
      await this.syncOffers();
      // Then start the cron job
      this.cronJob.start();
      console.log('Offer sync cron job started successfully');
    } catch (error) {
      console.error('Error starting offer sync:', error);
      throw error;
    }
  }

  stop(): void {
    this.cronJob.stop();
    console.log('Offer sync cron job stopped');
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
} 