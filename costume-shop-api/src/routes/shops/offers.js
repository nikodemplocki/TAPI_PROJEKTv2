import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../../../dane/offers.csv');

/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       required:
 *         - OFFER_ID
 *         - SHOP_ID
 *         - DISCOUNT
 *         - TITLE
 *         - DESCRIPTION
 *       properties:
 *         OFFER_ID:
 *           type: string
 *           description: The ID of the offer
 *         SHOP_ID:
 *           type: integer
 *           description: The ID of the shop offering the discount
 *         DISCOUNT:
 *           type: string
 *           description: The discount percentage
 *         TITLE:
 *           type: string
 *           description: The title of the offer
 *         DESCRIPTION:
 *           type: string
 *           description: The description of the offer
 */

/**
 * Load offers from CSV
 */
const loadOffersFromCSV = () => {
    return new Promise((resolve, reject) => {
        const offers = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => offers.push(row))
            .on('end', () => resolve(offers))
            .on('error', (error) => reject(error));
    });
};

/**
 * Save offers to CSV
 */
const saveOffersToCSV = (offers) => {
    const headers = "OFFER_ID,SHOP_ID,DISCOUNT,TITLE,DESCRIPTION\n";
    const data = offers.map(o => `${o.OFFER_ID},${o.SHOP_ID},${o.DISCOUNT},${o.TITLE},${o.DESCRIPTION}`).join("\n");
    return fs.promises.writeFile(filePath, headers + data, 'utf-8');
};

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Get all offers
 *     responses:
 *       200:
 *         description: A list of all offers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Offer'
 */
router.get('/offers', async (req, res) => {
    try {
        const offers = await loadOffersFromCSV();
        res.status(200).json({
            offers,
            _links: {
                self: { href: 'http://localhost:3000/api/offers', method: 'GET' },
                addOffer: { href: 'http://localhost:3000/api/offers', method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading offers.');
    }
});

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Get a single offer by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the offer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       404:
 *         description: Offer not found
 */
router.get('/offers/:id', async (req, res) => {
    try {
        const offers = await loadOffersFromCSV();
        const offer = offers.find(o => o.OFFER_ID === req.params.id);

        if (!offer) {
            return res.status(404).json({ error: "Offer not found" });
        }

        res.status(200).json({
            offer,
            _links: {
                self: { href: `http://localhost:3000/api/offers/${req.params.id}`, method: 'GET' },
                updateOffer: { href: `http://localhost:3000/api/offers/${req.params.id}`, method: 'PUT' },
                deleteOffer: { href: `http://localhost:3000/api/offers/${req.params.id}`, method: 'DELETE' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading offer.');
    }
});

/**
 * @swagger
 * /api/shops/{shopId}/offers:
 *   get:
 *     summary: Get offers for a specific shop
 *     parameters:
 *       - name: shopId
 *         in: path
 *         required: true
 *         description: The ID of the shop
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of offers for the shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Offer'
 *       404:
 *         description: No offers found for this shop
 */
router.get('/shops/:shopId/offers', async (req, res) => {
    const { shopId } = req.params;
    try {
        const offers = await loadOffersFromCSV();
        const filteredOffers = offers.filter(o => o.SHOP_ID === shopId);

        if (filteredOffers.length === 0) {
            return res.status(404).json({ error: "No offers found for this shop" });
        }

        res.status(200).json({
            offers: filteredOffers,
            _links: {
                self: { href: `http://localhost:3000/api/shops/${shopId}/offers`, method: 'GET' },
                addOffer: { href: `http://localhost:3000/api/shops/${shopId}/offers`, method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading offers.');
    }
});

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Add a new offer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Offer'
 *     responses:
 *       201:
 *         description: Offer added successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/offers', async (req, res) => {
    try {
        const { OFFER_ID, SHOP_ID, DISCOUNT, TITLE, DESCRIPTION } = req.body;

        if (!OFFER_ID || !SHOP_ID || !DISCOUNT || !TITLE || !DESCRIPTION) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const offers = await loadOffersFromCSV();
        const offerExists = offers.some(o => o.OFFER_ID === OFFER_ID);

        if (offerExists) {
            return res.status(400).json({ error: "Offer with this ID already exists" });
        }

        offers.push({ OFFER_ID, SHOP_ID, DISCOUNT, TITLE, DESCRIPTION });
        await saveOffersToCSV(offers);

        res.status(201).json({
            message: "Offer added successfully",
            _links: {
                self: { href: `http://localhost:3000/api/offers/${OFFER_ID}`, method: 'GET' },
                allOffers: { href: 'http://localhost:3000/api/offers', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error adding offer.');
    }
});

/**
 * @swagger
 * /api/offers/{id}:
 *   put:
 *     summary: Update an existing offer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the offer
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Offer'
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       404:
 *         description: Offer not found
 */
router.put('/offers/:id', async (req, res) => {
    try {
        const { SHOP_ID, DISCOUNT, TITLE, DESCRIPTION } = req.body;

        if (!SHOP_ID || !DISCOUNT || !TITLE || !DESCRIPTION) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const offers = await loadOffersFromCSV();
        const offerIndex = offers.findIndex(o => o.OFFER_ID === req.params.id);

        if (offerIndex === -1) {
            return res.status(404).json({ error: "Offer not found" });
        }

        offers[offerIndex] = { OFFER_ID: req.params.id, SHOP_ID, DISCOUNT, TITLE, DESCRIPTION };
        await saveOffersToCSV(offers);

        res.status(200).json({
            message: "Offer updated successfully",
            _links: {
                self: { href: `http://localhost:3000/api/offers/${req.params.id}`, method: 'GET' },
                allOffers: { href: 'http://localhost:3000/api/offers', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error updating offer.');
    }
});

/**
 * @swagger
 * /api/offers/{id}:
 *   patch:
 *     summary: Partially update an offer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the offer
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Offer'
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       404:
 *         description: Offer not found
 */
router.patch('/offers/:id', async (req, res) => {
    try {
        const updates = req.body;

        const offers = await loadOffersFromCSV();
        const offerIndex = offers.findIndex(o => o.OFFER_ID === req.params.id);

        if (offerIndex === -1) {
            return res.status(404).json({ error: "Offer not found" });
        }

        offers[offerIndex] = { ...offers[offerIndex], ...updates };
        await saveOffersToCSV(offers);

        res.status(200).json({
            message: "Offer updated successfully",
            _links: {
                self: { href: `http://localhost:3000/api/offers/${req.params.id}`, method: 'GET' },
                allOffers: { href: 'http://localhost:3000/api/offers', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error updating offer.');
    }
});

/**
 * @swagger
 * /api/offers/{id}:
 *   delete:
 *     summary: Delete an offer by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the offer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 *       404:
 *         description: Offer not found
 */
router.delete('/offers/:id', async (req, res) => {
    try {
        const offers = await loadOffersFromCSV();
        const offerIndex = offers.findIndex(o => o.OFFER_ID === req.params.id);

        if (offerIndex === -1) {
            return res.status(404).json({ error: "Offer not found" });
        }

        offers.splice(offerIndex, 1);
        await saveOffersToCSV(offers);

        res.status(200).json({
            message: "Offer deleted successfully",
            _links: {
                allOffers: { href: 'http://localhost:3000/api/offers', method: 'GET' },
                addOffer: { href: 'http://localhost:3000/api/offers', method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error deleting offer.');
    }
});

export default router;
