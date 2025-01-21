import { GraphQLScalarType, Kind } from 'graphql';

const CurrencyScalar = new GraphQLScalarType({
  name: 'Currency',
  description: 'A custom scalar for currency values',
  serialize(value) {
    return value.toFixed(2);
  },
  parseValue(value) {
    return parseFloat(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return parseFloat(ast.value); 
    }
    return null;
  },
});

export { CurrencyScalar };
