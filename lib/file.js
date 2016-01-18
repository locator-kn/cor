'use strict';
const routes = [];
const handler = require('../handler/fileHandler');
const validation = require('../validation/fileValidation');
const slack = require('ms-utilities').slack;


/** DEPRECATED: use specific route like /locations/impression/image/imageID/filename.jpg **/
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
        pre: [(request, reply)=> {
            slack.sendSlackError(process.env['SLACK_ERROR_CHANNEL'], 'WARNING: Deprecated route ' +
                'GET /file/{fileId}/{name}.{ext} was called');

            reply.continue();
        }],
        description: 'Get Image',
        notes: 'Retrieve an image from server',
        auth: false,
        validate: {
            params: validation.getFile
        },
        tags: ['api']
    }
});


module.exports.routes = routes;
