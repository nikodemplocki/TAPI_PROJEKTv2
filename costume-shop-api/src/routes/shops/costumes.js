import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../../../dane/costumes.csv');

/**
 * @swagger
 * components:
 *   schemas:
 *     Costume:
 *       type: object
 *       required:
 *         - COSTUME_ID
 *         - COSTUME_NAME
 *         - TYPE
 *         - SIZE
 *         - AVAILABLE
 *         - SHOP_ID
 *       properties:
 *         COSTUME_ID:
 *           type: string
 *           description: The ID of the costume
 *         COSTUME_NAME:
 *           type: string
 *           description: The name of the costume
 *         TYPE:
 *           type: string
 *           description: The type of the costume
 *         SIZE:
 *           type: string
 *           description: The size of the costume
 *         AVAILABLE:
 *           type: integer
 *           description: The number of available costumes
 *         SHOP_ID:
 *           type: integer
 *           description: The ID of the shop where the costume is available
 */

/**
 * Load costumes from CSV
 */
const loadCostumesFromCSV = () => {
    return new Promise((resolve, reject) => {
        const costumes = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => costumes.push(row))
            .on('end', () => resolve(costumes))
            .on('error', (error) => reject(error));
    });
};

/**
 * Save costumes to CSV
 */
const saveCostumesToCSV = (costumes) => {
    const headers = "COSTUME_ID,COSTUME_NAME,TYPE,SIZE,AVAILABLE,SHOP_ID\n";
    const data = costumes.map(c => `${c.COSTUME_ID},${c.COSTUME_NAME},${c.TYPE},${c.SIZE},${c.AVAILABLE},${c.SHOP_ID}`).join("\n");
    return fs.promises.writeFile(filePath, headers + data, 'utf-8');
};

/**
 * @swagger
 * /api/costumes:
 *   get:
 *     summary: Get all costumes
 *     responses:
 *       200:
 *         description: A list of all costumes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 costumes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Costume'
 */
router.get('/costumes', async (req, res) => {
    try {
        const costumes = await loadCostumesFromCSV();
        res.status(200).json({
            costumes,
            _links: {
                self: { href: 'http://localhost:3000/api/costumes', method: 'GET' },
                addCostume: { href: 'http://localhost:3000/api/costumes', method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading costumes.');
    }
});

/**
 * @swagger
 * /api/costumes/{id}:
 *   get:
 *     summary: Get a single costume by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the costume
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A costume
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Costume'
 *       404:
 *         description: Costume not found
 */
router.get('/costumes/:id', async (req, res) => {
    try {
        const costumes = await loadCostumesFromCSV();
        const costume = costumes.find(c => c.COSTUME_ID === req.params.id);

        if (!costume) {
            return res.status(404).json({ error: "Costume not found" });
        }

        res.status(200).json({
            costume,
            _links: {
                self: { href: `http://localhost:3000/api/costumes/${req.params.id}`, method: 'GET' },
                updateCostume: { href: `http://localhost:3000/api/costumes/${req.params.id}`, method: 'PUT' },
                deleteCostume: { href: `http://localhost:3000/api/costumes/${req.params.id}`, method: 'DELETE' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading costume.');
    }
});

/**
 * @swagger
 * /api/shops/{shopId}/offers/{offerId}/costumes:
 *   get:
 *     summary: Get costumes for a specific offer in a shop
 *     parameters:
 *       - name: shopId
 *         in: path
 *         required: true
 *         description: The ID of the shop
 *         schema:
 *           type: integer
 *       - name: offerId
 *         in: path
 *         required: true
 *         description: The ID of the offer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of costumes for the offer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 costumes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Costume'
 */
router.get('/shops/:shopId/offers/:offerId/costumes', async (req, res) => {
    const { shopId, offerId } = req.params;
    try {
        const costumes = await loadCostumesFromCSV();
        const filteredCostumes = costumes.filter(c => c.SHOP_ID == shopId && c.OFFER_ID == offerId);

        if (filteredCostumes.length === 0) {
            return res.status(404).json({ error: "No costumes found for this offer" });
        }

        res.status(200).json({
            costumes: filteredCostumes,
            _links: {
                self: { href: `http://localhost:3000/api/shops/${shopId}/offers/${offerId}/costumes`, method: 'GET' },
                addCostume: { href: `http://localhost:3000/api/shops/${shopId}/offers/${offerId}/costumes`, method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading costumes.');
    }
});

/**
 * @swagger
 * /api/shops/{shopId}/offers/{offerId}/costumes/{costumeId}:
 *   get:
 *     summary: Get a specific costume from a specific offer in a shop
 *     parameters:
 *       - name: shopId
 *         in: path
 *         required: true
 *         description: The ID of the shop
 *         schema:
 *           type: integer
 *       - name: offerId
 *         in: path
 *         required: true
 *         description: The ID of the offer
 *         schema:
 *           type: string
 *       - name: costumeId
 *         in: path
 *         required: true
 *         description: The ID of the costume
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A costume from the offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Costume'
 *       404:
 *         description: Costume not found
 */
router.get('/shops/:shopId/offers/:offerId/costumes/:costumeId', async (req, res) => {
    const { shopId, offerId, costumeId } = req.params;
    try {
        const costumes = await loadCostumesFromCSV();
        const costume = costumes.find(c => c.SHOP_ID == shopId && c.OFFER_ID == offerId && c.COSTUME_ID == costumeId);

        if (!costume) {
            return res.status(404).json({ error: "Costume not found" });
        }

        res.status(200).json({
            costume,
            _links: {
                self: { href: `http://localhost:3000/api/shops/${shopId}/offers/${offerId}/costumes/${costumeId}`, method: 'GET' },
                updateCostume: { href: `http://localhost:3000/api/shops/${shopId}/offers/${offerId}/costumes/${costumeId}`, method: 'PUT' },
                deleteCostume: { href: `http://localhost:3000/api/shops/${shopId}/offers/${offerId}/costumes/${costumeId}`, method: 'DELETE' }
            }
        });
    } catch (error) {
        res.status(500).send('Error loading costume.');
    }
});

/**
 * @swagger
 * /api/costumes:
 *   post:
 *     summary: Add a new costume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costume'
 *     responses:
 *       201:
 *         description: Costume added successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/costumes', async (req, res) => {
    try {
        const { COSTUME_ID, COSTUME_NAME, TYPE, SIZE, AVAILABLE, SHOP_ID } = req.body;

        if (!COSTUME_ID || !COSTUME_NAME || !TYPE || !SIZE || !AVAILABLE || !SHOP_ID) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const costumes = await loadCostumesFromCSV();
        const costumeExists = costumes.some(c => c.COSTUME_ID === COSTUME_ID);

        if (costumeExists) {
            return res.status(400).json({ error: "Costume with this ID already exists" });
        }

        costumes.push({ COSTUME_ID, COSTUME_NAME, TYPE, SIZE, AVAILABLE, SHOP_ID });
        await saveCostumesToCSV(costumes);

        res.status(201).json({
            message: "Costume added successfully",
            _links: {
                self: { href: `http://localhost:3000/api/costumes/${COSTUME_ID}`, method: 'GET' },
                allCostumes: { href: 'http://localhost:3000/api/costumes', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error adding costume.');
    }
});

/**
 * @swagger
 * /api/costumes/{id}:
 *   put:
 *     summary: Update a costume by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the costume
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costume'
 *     responses:
 *       200:
 *         description: Costume updated successfully
 *       404:
 *         description: Costume not found
 */
router.put('/costumes/:id', async (req, res) => {
    try {
        const { COSTUME_NAME, TYPE, SIZE, AVAILABLE, SHOP_ID } = req.body;

        if (!COSTUME_NAME || !TYPE || !SIZE || !AVAILABLE || !SHOP_ID) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const costumes = await loadCostumesFromCSV();
        const costumeIndex = costumes.findIndex(c => c.COSTUME_ID === req.params.id);

        if (costumeIndex === -1) {
            return res.status(404).json({ error: "Costume not found" });
        }

        costumes[costumeIndex] = { COSTUME_ID: req.params.id, COSTUME_NAME, TYPE, SIZE, AVAILABLE, SHOP_ID };
        await saveCostumesToCSV(costumes);

        res.status(200).json({
            message: "Costume updated successfully",
            _links: {
                self: { href: `http://localhost:3000/api/costumes/${req.params.id}`, method: 'GET' },
                allCostumes: { href: 'http://localhost:3000/api/costumes', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error updating costume.');
    }
});

/**
 * @swagger
 * /api/costumes/{id}:
 *   patch:
 *     summary: Partially update a costume by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the costume
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Costume'
 *     responses:
 *       200:
 *         description: Costume updated successfully
 *       404:
 *         description: Costume not found
 */
router.patch('/costumes/:id', async (req, res) => {
    try {
        const updates = req.body;

        const costumes = await loadCostumesFromCSV();
        const costumeIndex = costumes.findIndex(c => c.COSTUME_ID === req.params.id);

        if (costumeIndex === -1) {
            return res.status(404).json({ error: "Costume not found" });
        }

        costumes[costumeIndex] = { ...costumes[costumeIndex], ...updates };
        await saveCostumesToCSV(costumes);

        res.status(200).json({
            message: "Costume updated successfully",
            _links: {
                self: { href: `http://localhost:3000/api/costumes/${req.params.id}`, method: 'GET' },
                allCostumes: { href: 'http://localhost:3000/api/costumes', method: 'GET' }
            }
        });
    } catch (error) {
        res.status(500).send('Error updating costume.');
    }
});

/**
 * @swagger
 * /api/costumes/{id}:
 *   delete:
 *     summary: Delete a costume by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the costume
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Costume deleted successfully
 *       404:
 *         description: Costume not found
 */
router.delete('/costumes/:id', async (req, res) => {
    try {
        const costumes = await loadCostumesFromCSV();
        const costumeIndex = costumes.findIndex(c => c.COSTUME_ID === req.params.id);

        if (costumeIndex === -1) {
            return res.status(404).json({ error: "Costume not found" });
        }

        costumes.splice(costumeIndex, 1);
        await saveCostumesToCSV(costumes);

        res.status(200).json({
            message: "Costume deleted successfully",
            _links: {
                allCostumes: { href: 'http://localhost:3000/api/costumes', method: 'GET' },
                addCostume: { href: 'http://localhost:3000/api/costumes', method: 'POST' }
            }
        });
    } catch (error) {
        res.status(500).send('Error deleting costume.');
    }
});

export default router;
