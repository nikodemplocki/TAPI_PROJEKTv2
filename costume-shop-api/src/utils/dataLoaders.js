import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const loadCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', (error) => reject(error));
    });
};

export const loadShopsFromCSV = () => loadCSV(path.resolve('dane/shops.csv'));
export const loadCostumesFromCSV = () => loadCSV(path.resolve('dane/costumes.csv'));
export const loadOffersFromCSV = () => loadCSV(path.resolve('dane/offers.csv'));
