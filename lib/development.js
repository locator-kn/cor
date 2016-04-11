'use strict';
const routes = [];

routes.push({
    method: 'POST',
    path: '/dev/test',
    handler: (request, reply) => {
        reply({payload: request.payload, headers: request.headers});
    },
    config: {
        tags: ['api']
    }
});

routes.push({
    method: 'POST',
    path: '/dev/test/formData',
    handler: (request, reply) => {
        if (request.payload.file) {
            delete request.payload.file._data;
        }
        reply({payload: request.payload, headers: request.headers});
    },
    config: {
        tags: ['api'],
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 1048576 * 6 // 6MB
        }
    }
});

module.exports.routes = routes;
