import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { loadShopsFromCSV, loadCostumesFromCSV, loadOffersFromCSV } from '../graphql/csvUtils.js';
import { getShops, getShop, getCostumes, getCostume, getOffers, getOffer } from '../resolvers/shopResolvers.js';

const PROTO_PATH = './proto/costumeShop.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const costumeShopProto = grpc.loadPackageDefinition(packageDefinition).costumeShop;

const server = new grpc.Server();

server.addService(costumeShopProto.CostumeShopService.service, {
  GetShops: getShops,
  GetShop: getShop,
  GetCostumes: getCostumes,
  GetCostume: getCostume,
  GetOffers: getOffers,
  GetOffer: getOffer,
});

const PORT = '127.0.0.1:50051';
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`gRPC server running on port ${PORT}`);
  server.start();
});
