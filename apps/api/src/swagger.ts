import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IPL 2022 Data Platform API',
      version: '1.0.0',
      description: 'A production-ready REST API exposing IPL 2022 cricket data including matches, teams, players, batting stats, bowling stats, and standings.',
      contact: { name: 'IPL API Support', email: 'support@ipl-api.dev' },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development server' },
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoint' },
      { name: 'Teams', description: 'IPL team data and stats' },
      { name: 'Matches', description: 'Match data and results' },
      { name: 'Players', description: 'Player profiles and stats' },
      { name: 'Stats', description: 'Batting and bowling leaderboards' },
      { name: 'Standings', description: 'Points table and standings' },
    ],
    components: {
      schemas: {
        Team: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            shortName: { type: 'string' },
            logoUrl: { type: 'string' },
            abbr: { type: 'string' },
            country: { type: 'string' },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            matchNumber: { type: 'string' },
            status: { type: 'string' },
            result: { type: 'string' },
            dateStart: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            statusCode: { type: 'integer' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
