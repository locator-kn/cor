'use strict';
const routes = [];
const handler = require('../handler/deviceHandler');
const validation = require('../validation/deviceValidation');


routes.push({
    method: 'POST',
    path: '/device/register',
    config: {
        description: 'register device',
        notes: 'Once called, when the user opens the app the first time',
        tags: ['api', 'user', 'register', 'device'],
        auth: false,
        handler: handler.register,
        validate: {
            payload: validation.register
        }
    }
});

routes.push({
    method: ['POST', 'PUT'],
    path: '/device/pushInfo',
    config: {
        description: 'Send push token',
        notes: 'Send (and update) the push token for the device',
        tags: ['api', 'user', 'push token', 'device'],
        handler: handler.pushInfo,
        validate: {
            payload: validation.pushInfo
        }
    }
});


module.exports.routes = routes;
