import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = './proto/costumeShop.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const costumeShopProto = grpc.loadPackageDefinition(packageDefinition).costumeShop;

const client = new costumeShopProto.CostumeShopService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Testy
client.GetShops({}, (error, response) => {
  if (error) {
    console.error('Error fetching shops:', error);
  } else {
    console.log('Shops:', response.shops);
  }
});

client.GetShop({ SHOP_ID: 1 }, (error, response) => {
  if (error) {
    console.error('Error fetching shop:', error);
  } else {
    console.log('Shop:', response);
  }
});

client.GetCostumes({}, (error, response) => {
  if (error) {
    console.error('Error fetching costumes:', error);
  } else {
    console.log('Costumes:', response.costumes);
  }
});

client.GetOffers({}, (error, response) => {
  if (error) {
    console.error('Error fetching offers:', error);
  } else {
    console.log('Offers:', response.offers);
  }
});
