import cron from 'node-cron';
import { OfferService } from '../../application/services/OfferService';
import { OfferRepository } from '../repositories/OfferRepository';

export class OfferCronJob {
  private cronJob: cron.ScheduledTask;
  private offerService: OfferService;

  constructor() {
    const offerRepository = new OfferRepository();
    this.offerService = new OfferService(offerRepository);
    this.cronJob = cron.schedule('*/1 * * * *', this.syncOffers.bind(this));
  }

  async start(): Promise<void> {
    try {
      // Fetch data immediately on start
      await this.syncOffers();
      // Then start the cron job
      this.cronJob.start();
      console.log('Offer sync cron job started');
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
      await this.offerService.syncOffers();
    } catch (error) {
      console.error('Error syncing offers:', error);
    }
  }
} 