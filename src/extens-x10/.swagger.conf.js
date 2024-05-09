module.exports = {
    definition: {
        openapi: '3.0.0',  // Specify the OpenAPI version
        info: {
            title: 'Your API Title',  // Title of your API
            version: '1.0.0',  // Version of the API
            description: 'A brief description of your API',  // Description of the API
        },
        servers: [
            {
                url: 'http://localhost:3000',  // URL of the server where the API is hosted
                description: 'Development server',  // Description of the server
            },
        ],
    },
    apis: ['./src/**/*.js', './src/**/*.cjs', './src/**/*.mjs', './src/**/*.ts', './src/**/*.cts', './src/**/*.mts'],  // Path to the source files where JSDoc comments are defined
};
