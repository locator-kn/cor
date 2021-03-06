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
        auth: {
            mode: 'try',
            strategy: 'session'
        },
        handler: handler.register,
        validate: {
            payload: validation.register
        }
    }
});


module.exports.routes = routes;
