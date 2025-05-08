import { Router } from 'express';
import { OfferController } from '../controllers/OfferController';

const router = Router();
const offerController = new OfferController();

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Get all offers
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: List of all offers
 *       500:
 *         description: Server error
 */
router.get('/', offerController.getAllOffers.bind(offerController));

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer details
 *       404:
 *         description: Offer not found
 *       500:
 *         description: Server error
 */
router.get('/:id', offerController.getOfferById.bind(offerController));

/**
 * @swagger
 * /api/offers/merchant/{merchant}:
 *   get:
 *     summary: Get offers by merchant
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: merchant
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of offers for the merchant
 *       500:
 *         description: Server error
 */
router.get('/merchant/:merchant', offerController.getOffersByMerchant.bind(offerController));

/**
 * @swagger
 * /api/offers/active:
 *   get:
 *     summary: Get active offers
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: List of active offers
 *       500:
 *         description: Server error
 */
router.get('/active', offerController.getActiveOffers.bind(offerController));

/**
 * @swagger
 * /api/offers/type/{type}:
 *   get:
 *     summary: Lấy danh sách offers theo loại (Deals Hot hoặc Mã Giảm Giá)
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Deals Hot, Mã Giảm Giá]
 *     responses:
 *       200:
 *         description: Danh sách offers theo loại
 *       500:
 *         description: Lỗi server
 */
router.get('/type/:type', offerController.getOffersByType.bind(offerController));

export default router; 