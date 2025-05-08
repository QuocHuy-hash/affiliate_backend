import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Affiliate API Documentation',
      version: '1.0.0',
      description: 'API documentation for Affiliate system',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Offer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            content: { type: 'string' },
            image: { type: 'string' },
            aff_link: { type: 'string' },
            link: { type: 'string' },
            domain: { type: 'string' },
            merchant: { type: 'string' },
            start_time: { type: 'string' },
            end_time: { type: 'string' },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category_name: { type: 'string' },
                  category_name_show: { type: 'string' },
                  category_no: { type: 'string' },
                },
              },
            },
            coupons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  coupon_code: { type: 'string' },
                  coupon_desc: { type: 'string' },
                },
              },
            },
            banners: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/interfaces/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 