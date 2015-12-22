'use strict';
const routes = [];
const handler = require('../handler/fileHandler');
const validation = require('../validation/fileValidation');


routes.push({
    method: 'GET',
    path: '/file/{fileId}/{name}.{ext}',
    handler: {
        proxy: {
            host: 'localhost',
            port: 3453
        }
    },
    config: {
        auth: false,
        validate: {
            params: validation.getFile
        },
        tags: ['api']
    }
});


module.exports.routes = routes;
