import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../../../dane/shops.csv');

/**
 * @swagger
 * components:
 *   schemas:
 *     Shop:
 *       type: object
 *       required:
 *         - SHOP_ID
 *         - SHOP_NAME
 *         - CITY
 *         - ADDRESS
 *         - PHONE
 *       properties:
 *         SHOP_ID:
 *           type: integer
 *           description: The ID of the shop
 *         SHOP_NAME:
 *           type: string
 *           description: The name of the shop
 *         CITY:
 *           type: string
 *           description: The city where the shop is located
 *         ADDRESS:
 *           type: string
 *           description: The address of the shop
 *         PHONE:
 *           type: string
 *           description: The phone number of the shop
 */

/**
 * Load shops from CSV
 */
const loadShopsFromCSV = () => {
    return new Promise((resolve, reject) => {
        const shops = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => shops.push(row))
            .on('end', () => resolve(shops))
            .on('error', (error) => reject(error));
    });
};

/**
 * Save shops to CSV
 */
const saveShopsToCSV = (shops) => {
    const headers = "SHOP_ID,SHOP_NAME,CITY,ADDRESS,PHONE\n";
    const data = shops.map(shop => `${shop.SHOP_ID},${shop.SHOP_NAME},${shop.CITY},${shop.ADDRESS},${shop.PHONE}`).join("\n");
    return fs.promises.writeFile(filePath, headers + data, 'utf-8');
};

/**
 * @swagger
 * /api/shops:
 *   get:
 *     summary: Get all shops
 *     responses:
 *       200:
 *         description: A list of all shops
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shops:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shop'
 */
router.get('/shops', async (req, res) => {
    try {
        const shops = await loadShopsFromCSV();
        res.status(200).json({
            shops,
            _links: {
                self: { href: 'http://localhost:3000/api/shops', method: 'GET' },
                addShop: { href: 'http://localhost:3000/api/shops', method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading shops.');
    }
});

/**
 * @swagger
 * /api/shops/{id}:
 *   get:
 *     summary: Get a single shop by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the shop
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A shop
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shop'
 *       404:
 *         description: Shop not found
 */
router.get('/shops/:id', async (req, res) => {
    try {
        const shops = await loadShopsFromCSV();
        const shop = shops.find(s => s.SHOP_ID === req.params.id);

        if (!shop) {
            return res.status(404).json({ error: "Shop not found" });
        }

        res.status(200).json({
            shop,
            _links: {
                self: { href: `http://localhost:3000/api/shops/${req.params.id}`, method: 'GET' },
                updateShop: { href: `http://localhost:3000/api/shops/${req.params.id}`, method: 'PUT' },
                deleteShop: { href: `http://localhost:3000/api/shops/${req.params.id}`, method: 'DELETE' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading shop.');
    }
});

/**
 * @swagger
 * /api/shops:
 *   post:
 *     summary: Add a new shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shop'
 *     responses:
 *       201:
 *         description: Shop added successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/shops', async (req, res) => {
    try {
        const { SHOP_ID, SHOP_NAME, CITY, ADDRESS, PHONE } = req.body;

        if (!SHOP_ID || !SHOP_NAME || !CITY || !ADDRESS || !PHONE) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const shops = await loadShopsFromCSV();
        const shopExists = shops.some(s => s.SHOP_ID === SHOP_ID);

        if (shopExists) {
            return res.status(400).json({ error: "Shop with this ID already exists" });
        }

        shops.push({ SHOP_ID, SHOP_NAME, CITY, ADDRESS, PHONE });
        await saveShopsToCSV(shops);

        res.status(201).json({
            message: "Shop added successfully",
            _links: {
                self: { href: `http://localhost:3000/api/shops/${SHOP_ID}`, method: 'GET' },
                allShops: { href: 'http://localhost:3000/api/shops', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error adding shop.');
    }
});

/**
 * @swagger
 * /api/shops/{id}:
 *   put:
 *     summary: Update a shop by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the shop
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shop'
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *       404:
 *         description: Shop not found
 */
router.put('/shops/:id', async (req, res) => {
    try {
        const { SHOP_NAME, CITY, ADDRESS, PHONE } = req.body;

        if (!SHOP_NAME || !CITY || !ADDRESS || !PHONE) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const shops = await loadShopsFromCSV();
        const shopIndex = shops.findIndex(s => s.SHOP_ID === req.params.id);

        if (shopIndex === -1) {
            return res.status(404).json({ error: "Shop not found" });
        }

        shops[shopIndex] = { SHOP_ID: req.params.id, SHOP_NAME, CITY, ADDRESS, PHONE };
        await saveShopsToCSV(shops);

        res.status(200).json({
            message: "Shop updated successfully",
            _links: {
                self: { href: `http://localhost:3000/api/shops/${req.params.id}`, method: 'GET' },
                allShops: { href: 'http://localhost:3000/api/shops', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error updating shop.');
    }
});

/**
 * @swagger
 * /api/shops/{id}:
 *   patch:
 *     summary: Partial update of a shop by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the shop
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SHOP_NAME:
 *                 type: string
 *                 description: The name of the shop
 *               CITY:
 *                 type: string
 *                 description: The city where the shop is located
 *               ADDRESS:
 *                 type: string
 *                 description: The address of the shop
 *               PHONE:
 *                 type: string
 *                 description: The phone number of the shop
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *       404:
 *         description: Shop not found
 */
router.patch('/shops/:id', async (req, res) => {
    try {
        const updates = req.body;

        const shops = await loadShopsFromCSV();
        const shopIndex = shops.findIndex(s => s.SHOP_ID === req.params.id);

        if (shopIndex === -1) {
            return res.status(404).json({ error: "Shop not found" });
        }

        shops[shopIndex] = { ...shops[shopIndex], ...updates };
        await saveShopsToCSV(shops);

        res.status(200).json({
            message: "Shop updated successfully",
            _links: {
                self: { href: `http://localhost:3000/api/shops/${req.params.id}`, method: 'GET' },
                allShops: { href: 'http://localhost:3000/api/shops', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error updating shop.');
    }
});

/**
 * @swagger
 * /api/shops/{id}:
 *   delete:
 *     summary: Delete a shop by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the shop
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shop deleted successfully
 *       404:
 *         description: Shop not found
 */
router.delete('/shops/:id', async (req, res) => {
    try {
        const shops = await loadShopsFromCSV();
        const shopIndex = shops.findIndex(s => s.SHOP_ID === req.params.id);

        if (shopIndex === -1) {
            return res.status(404).json({ error: "Shop not found" });
        }

        shops.splice(shopIndex, 1);
        await saveShopsToCSV(shops);

        res.status(200).json({
            message: "Shop deleted successfully",
            _links: {
                allShops: { href: 'http://localhost:3000/api/shops', method: 'GET' },
                addShop: { href: 'http://localhost:3000/api/shops', method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error deleting shop.');
    }
});

export default router;
