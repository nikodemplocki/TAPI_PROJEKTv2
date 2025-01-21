import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema.js';
import shopRoutes from './routes/shops/shops.js';
import costumeRoutes from './routes/shops/costumes.js';
import offerRoutes from './routes/shops/offers.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Costume Shop API',
        version: '1.0.0',
        description: 'This is a simple REST API for managing shops, costumes, and offers.',
        contact: {
            name: 'API Support',
            email: 'support@example.com',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/shops/shops.js', './src/routes/shops/costumes.js', './src/routes/shops/offers.js'], 
};


const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true // playground
}));

app.use('/api/', shopRoutes);
app.use('/api/', costumeRoutes);
app.use('/api/', offerRoutes);

app.get('/', (req, res) => res.send('Welcome to Costume Shop API!'));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
