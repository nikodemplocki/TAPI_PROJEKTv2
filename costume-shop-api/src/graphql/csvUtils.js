import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';

export const loadShopsFromCSV = () => {
  return new Promise((resolve, reject) => {
    const shops = [];
    fs.createReadStream('./dane/shops.csv')
      .pipe(csv())
      .on('data', (row) => {
        shops.push({
          SHOP_ID: parseInt(row.SHOP_ID, 10), 
          SHOP_NAME: row.SHOP_NAME,
          CITY: row.CITY,
          ADDRESS: row.ADDRESS,
          PHONE: row.PHONE,
        });
      })
      .on('end', () => resolve(shops))
      .on('error', (error) => reject(error));
  });
};

export const saveShopsToCSV = (shops) => {
  const headers = ['SHOP_ID', 'SHOP_NAME', 'CITY', 'ADDRESS', 'PHONE'];
  const csvData = stringify(shops, { header: true, columns: headers });
  return fs.promises.writeFile('./dane/shops.csv', csvData, 'utf8');
};

export const loadCostumesFromCSV = () => {
  return new Promise((resolve, reject) => {
    const costumes = [];
    fs.createReadStream('./dane/costumes.csv')
      .pipe(csv())
      .on('data', (row) => {
        costumes.push({
          COSTUME_ID: row.COSTUME_ID,
          COSTUME_NAME: row.COSTUME_NAME,
          TYPE: row.TYPE,
          SIZE: row.SIZE,
          AVAILABLE: parseInt(row.AVAILABLE, 10),
          SHOP_ID: parseInt(row.SHOP_ID, 10),
        });
      })
      .on('end', () => resolve(costumes))
      .on('error', (error) => reject(error));
  });
};

export const saveCostumesToCSV = (costumes) => {
  const headers = ['COSTUME_ID', 'COSTUME_NAME', 'TYPE', 'SIZE', 'AVAILABLE', 'SHOP_ID'];
  const csvData = stringify(costumes, { header: true, columns: headers });
  return fs.promises.writeFile('./dane/costumes.csv', csvData, 'utf8');
};

export const loadOffersFromCSV = () => {
  return new Promise((resolve, reject) => {
    const offers = [];
    fs.createReadStream('./dane/offers.csv')
      .pipe(csv())
      .on('data', (row) => {
        offers.push({
          OFFER_ID: row.OFFER_ID,
          SHOP_ID: parseInt(row.SHOP_ID, 10),
          DISCOUNT: row.DISCOUNT,
          TITLE: row.TITLE,
          DESCRIPTION: row.DESCRIPTION,
        });
      })
      .on('end', () => resolve(offers))
      .on('error', (error) => reject(error));
  });
};

export const saveOffersToCSV = (offers) => {
  const headers = ['OFFER_ID', 'SHOP_ID', 'DISCOUNT', 'TITLE', 'DESCRIPTION'];
  const csvData = stringify(offers, { header: true, columns: headers });
  return fs.promises.writeFile('./dane/offers.csv', csvData, 'utf8');
};
