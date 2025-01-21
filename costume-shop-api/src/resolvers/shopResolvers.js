import { loadShopsFromCSV, loadCostumesFromCSV, loadOffersFromCSV } from '../graphql/csvUtils.js';

const filterItems = (items, filter) => {
  return items.filter(item => {
    if (filter.operator === 'equals' && item[filter.field] === filter.value) {
      return true;
    }
    if (filter.operator === 'contains' && item[filter.field].includes(filter.value)) {
      return true;
    }
    return false;
  });
};

const sortItems = (items, sortField = 'SHOP_NAME', sortDirection = 'ASC') => {
  return items.sort((a, b) => {
    if (sortDirection === 'ASC') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });
};

const paginateItems = (items, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return items.slice(start, end);
};

export const getShops = async (call, callback) => {
  try {
    const { filter, sortField, sortDirection, page, limit } = call.request;
    let shops = await loadShopsFromCSV();

    if (filter) {
      shops = filterItems(shops, filter);
    }

    shops = sortItems(shops, sortField, sortDirection);
    shops = paginateItems(shops, page, limit);

    callback(null, { shops });
  } catch (error) {
    callback(error);
  }
};

export const getShop = async (call, callback) => {
  try {
    const shops = await loadShopsFromCSV();
    const shop = shops.find(shop => shop.SHOP_ID === call.request.SHOP_ID);

    if (!shop) {
      callback(new Error('Shop not found'));
    } else {
      callback(null, shop);
    }
  } catch (error) {
    callback(error);
  }
};

export const getCostumes = async (call, callback) => {
  try {
    const { filter, sortField, sortDirection, page, limit } = call.request;
    let costumes = await loadCostumesFromCSV();

    if (filter) {
      costumes = filterItems(costumes, filter);
    }

    costumes = sortItems(costumes, sortField, sortDirection);
    costumes = paginateItems(costumes, page, limit);

    callback(null, { costumes });
  } catch (error) {
    callback(error);
  }
};

export const getCostume = async (call, callback) => {
  try {
    const costumes = await loadCostumesFromCSV();
    const costume = costumes.find(costume => costume.COSTUME_ID === call.request.COSTUME_ID);

    if (!costume) {
      callback(new Error('Costume not found'));
    } else {
      callback(null, costume);
    }
  } catch (error) {
    callback(error);
  }
};

export const getOffers = async (call, callback) => {
  try {
    const { filter, sortField, sortDirection, page, limit } = call.request;
    let offers = await loadOffersFromCSV();

    if (filter) {
      offers = filterItems(offers, filter);
    }

    offers = sortItems(offers, sortField, sortDirection);
    offers = paginateItems(offers, page, limit);

    callback(null, { offers });
  } catch (error) {
    callback(error);
  }
};

export const getOffer = async (call, callback) => {
  try {
    const offers = await loadOffersFromCSV();
    const offer = offers.find(offer => offer.OFFER_ID === call.request.OFFER_ID);

    if (!offer) {
      callback(new Error('Offer not found'));
    } else {
      callback(null, offer);
    }
  } catch (error) {
    callback(error);
  }
};
