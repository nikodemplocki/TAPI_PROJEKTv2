import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} from 'graphql';
import { loadShopsFromCSV, saveShopsToCSV, loadCostumesFromCSV, saveCostumesToCSV, loadOffersFromCSV, saveOffersToCSV } from './csvUtils.js';

import { CurrencyScalar } from './scalars.js';


const ShopType = new GraphQLObjectType({
  name: 'Shop',
  fields: () => ({
    SHOP_ID: { type: GraphQLNonNull(GraphQLInt) },
    SHOP_NAME: { type: GraphQLNonNull(GraphQLString) },
    CITY: { type: GraphQLNonNull(GraphQLString) },
    ADDRESS: { type: GraphQLNonNull(GraphQLString) },
    PHONE: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const CostumeType = new GraphQLObjectType({
  name: 'Costume',
  fields: () => ({
    COSTUME_ID: { type: GraphQLNonNull(GraphQLString) },
    COSTUME_NAME: { type: GraphQLNonNull(GraphQLString) },
    TYPE: { type: GraphQLString },
    SIZE: { type: GraphQLString },
    AVAILABLE: { type: GraphQLInt },
    SHOP_ID: { type: GraphQLInt },
  }),
});

const OfferType = new GraphQLObjectType({
  name: 'Offer',
  fields: () => ({
    OFFER_ID: { type: GraphQLNonNull(GraphQLString) },
    SHOP_ID: { type: GraphQLInt },
    DISCOUNT: { type: GraphQLString },
    TITLE: { type: GraphQLNonNull(GraphQLString) },
    DESCRIPTION: { type: GraphQLString },
  }),
});

const FilterInputType = new GraphQLInputObjectType({
  name: 'FilterInput',
  fields: {
    field: { type: GraphQLNonNull(GraphQLString) },
    operator: { type: GraphQLNonNull(GraphQLString) },
    value: { type: GraphQLNonNull(GraphQLString) },
  },
});

const ShopInputType = new GraphQLInputObjectType({
  name: 'ShopInput',
  fields: {
    SHOP_NAME: { type: GraphQLNonNull(GraphQLString) },
    CITY: { type: GraphQLNonNull(GraphQLString) },
    ADDRESS: { type: GraphQLNonNull(GraphQLString) },
    PHONE: { type: GraphQLNonNull(GraphQLString) },
  },
});

const CostumeInputType = new GraphQLInputObjectType({
  name: 'CostumeInput',
  fields: {
    COSTUME_NAME: { type: GraphQLNonNull(GraphQLString) },
    TYPE: { type: GraphQLString },
    SIZE: { type: GraphQLString },
    AVAILABLE: { type: GraphQLInt },
    SHOP_ID: { type: GraphQLInt },
  },
});

const OfferInputType = new GraphQLInputObjectType({
  name: 'OfferInput',
  fields: {
    SHOP_ID: { type: GraphQLNonNull(GraphQLInt) },
    DISCOUNT: { type: GraphQLString },
    TITLE: { type: GraphQLNonNull(GraphQLString) },
    DESCRIPTION: { type: GraphQLString },
  },
});

const filterShops = (shops, filter) => {
  return shops.filter(shop => {
    if (filter.operator === 'equals' && shop[filter.field] === filter.value) {
      return true;
    }
    if (filter.operator === 'contains' && shop[filter.field].includes(filter.value)) {
      return true;
    }
    return false;
  });
};

const sortShops = (shops, field, direction) => {
  return shops.sort((a, b) => {
    if (direction === 'ASC') {
      return a[field] > b[field] ? 1 : -1;
    } else {
      return a[field] < b[field] ? 1 : -1;
    }
  });
};

const paginate = (items, page, limit) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return items.slice(start, end);
};

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    shops: {
      type: GraphQLList(ShopType),
      args: {
        filter: { type: FilterInputType },
        sortField: { type: GraphQLString },
        sortDirection: { type: GraphQLString },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      resolve: async (_, { filter, sortField = 'SHOP_NAME', sortDirection = 'ASC', page = 1, limit = 10 }) => {
        let shops = await loadShopsFromCSV();
        if (filter) {
          shops = filterShops(shops, filter);
        }
        shops = sortShops(shops, sortField, sortDirection);
        shops = paginate(shops, page, limit);
        return shops;
      },
    },
    shop: {
      type: ShopType,
      args: { SHOP_ID: { type: GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { SHOP_ID }) => {
        const shops = await loadShopsFromCSV();
        return shops.find((shop) => shop.SHOP_ID === SHOP_ID);
      },
    },
    costumes: {
      type: GraphQLList(CostumeType),
      args: {
        filter: { type: FilterInputType },
        sortField: { type: GraphQLString },
        sortDirection: { type: GraphQLString },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      resolve: async (_, { filter, sortField = 'COSTUME_NAME', sortDirection = 'ASC', page = 1, limit = 10 }) => {
        let costumes = await loadCostumesFromCSV();
        if (filter) {
          costumes = filterShops(costumes, filter);
        }
        costumes = sortShops(costumes, sortField, sortDirection);
        costumes = paginate(costumes, page, limit);
        return costumes;
      },
    },
    costume: {
      type: CostumeType,
      args: { COSTUME_ID: { type: GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { COSTUME_ID }) => {
        const costumes = await loadCostumesFromCSV();
        return costumes.find((costume) => costume.COSTUME_ID === COSTUME_ID);
      },
    },
    offers: {
      type: GraphQLList(OfferType),
      args: {
        filter: { type: FilterInputType },
        sortField: { type: GraphQLString },
        sortDirection: { type: GraphQLString },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
      },
      resolve: async (_, { filter, sortField = 'TITLE', sortDirection = 'ASC', page = 1, limit = 10 }) => {
        let offers = await loadOffersFromCSV();
        if (filter) {
          offers = filterShops(offers, filter);
        }
        offers = sortShops(offers, sortField, sortDirection);
        offers = paginate(offers, page, limit);
        return offers;
      },
    },
    offer: {
      type: OfferType,
      args: { OFFER_ID: { type: GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { OFFER_ID }) => {
        const offers = await loadOffersFromCSV();
        return offers.find((offer) => offer.OFFER_ID === OFFER_ID);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addShop: {
      type: ShopType,
      args: { input: { type: GraphQLNonNull(ShopInputType) } },
      resolve: async (_, { input }) => {
        const shops = await loadShopsFromCSV();
        const newShop = { SHOP_ID: shops.length + 1, ...input };
        shops.push(newShop);
        await saveShopsToCSV(shops);
        return newShop;
      },
    },
    updateShop: {
      type: ShopType,
      args: {
        SHOP_ID: { type: GraphQLNonNull(GraphQLInt) },
        input: { type: GraphQLNonNull(ShopInputType) },
      },
      resolve: async (_, { SHOP_ID, input }) => {
        const shops = await loadShopsFromCSV();
        const shopIndex = shops.findIndex((shop) => shop.SHOP_ID === SHOP_ID);

        if (shopIndex === -1) throw new Error('Shop not found');

        shops[shopIndex] = { ...shops[shopIndex], ...input };
        await saveShopsToCSV(shops);
        return shops[shopIndex];
      },
    },
    deleteShop: {
      type: GraphQLString,
      args: { SHOP_ID: { type: GraphQLNonNull(GraphQLInt) } },
      resolve: async (_, { SHOP_ID }) => {
        const shops = await loadShopsFromCSV();
        const shopIndex = shops.findIndex((shop) => shop.SHOP_ID === SHOP_ID);

        if (shopIndex === -1) throw new Error('Shop not found');

        shops.splice(shopIndex, 1);
        await saveShopsToCSV(shops);
        return `Shop with ID ${SHOP_ID} deleted successfully.`;
      },
    },
    addCostume: {
      type: CostumeType,
      args: { input: { type: GraphQLNonNull(CostumeInputType) } },
      resolve: async (_, { input }) => {
        const costumes = await loadCostumesFromCSV();
        const newCostume = { COSTUME_ID: Date.now().toString(), ...input };
        costumes.push(newCostume);
        await saveCostumesToCSV(costumes);
        return newCostume;
      },
    },
    updateCostume: {
      type: CostumeType,
      args: {
        COSTUME_ID: { type: GraphQLNonNull(GraphQLString) },
        input: { type: GraphQLNonNull(CostumeInputType) },
      },
      resolve: async (_, { COSTUME_ID, input }) => {
        const costumes = await loadCostumesFromCSV();
        const costumeIndex = costumes.findIndex((costume) => costume.COSTUME_ID === COSTUME_ID);

        if (costumeIndex === -1) throw new Error('Costume not found');

        costumes[costumeIndex] = { ...costumes[costumeIndex], ...input };
        await saveCostumesToCSV(costumes);
        return costumes[costumeIndex];
      },
    },
    deleteCostume: {
      type: GraphQLString,
      args: { COSTUME_ID: { type: GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { COSTUME_ID }) => {
        const costumes = await loadCostumesFromCSV();
        const costumeIndex = costumes.findIndex((costume) => costume.COSTUME_ID === COSTUME_ID);

        if (costumeIndex === -1) throw new Error('Costume not found');

        costumes.splice(costumeIndex, 1);
        await saveCostumesToCSV(costumes);
        return `Costume with ID ${COSTUME_ID} deleted successfully.`;
      },
    },
    addOffer: {
      type: OfferType,
      args: { input: { type: GraphQLNonNull(OfferInputType) } },
      resolve: async (_, { input }) => {
        const offers = await loadOffersFromCSV();
        const newOffer = { OFFER_ID: Date.now().toString(), ...input };
        offers.push(newOffer);
        await saveOffersToCSV(offers);
        return newOffer;
      },
    },
    updateOffer: {
      type: OfferType,
      args: {
        OFFER_ID: { type: GraphQLNonNull(GraphQLString) },
        input: { type: GraphQLNonNull(OfferInputType) },
      },
      resolve: async (_, { OFFER_ID, input }) => {
        const offers = await loadOffersFromCSV();
        const offerIndex = offers.findIndex((offer) => offer.OFFER_ID === OFFER_ID);

        if (offerIndex === -1) throw new Error('Offer not found');

        offers[offerIndex] = { ...offers[offerIndex], ...input };
        await saveOffersToCSV(offers);
        return offers[offerIndex];
      },
    },
    deleteOffer: {
      type: GraphQLString,
      args: { OFFER_ID: { type: GraphQLNonNull(GraphQLString) } },
      resolve: async (_, { OFFER_ID }) => {
        const offers = await loadOffersFromCSV();
        const offerIndex = offers.findIndex((offer) => offer.OFFER_ID === OFFER_ID);

        if (offerIndex === -1) throw new Error('Offer not found');

        offers.splice(offerIndex, 1);
        await saveOffersToCSV(offers);
        return `Offer with ID ${OFFER_ID} deleted successfully.`;
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutation,
});
