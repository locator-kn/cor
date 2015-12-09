'use strict';
const routes = [];
const handler = require('../handler/userHandler');
const validation = require('../validation/userValidation');


routes.push({
    method: 'POST',
    path: '/1',
    handler: handler.postUser,
    config: {
        validate: {
            params: validation.postUser
        }
    }
});


routes.push({
    method: 'GET',
    path: '/hallo',
    handler: handler.getHallo,
    config: {
        //validate: {
        //    params: validation.postUser
        //}
    }
});


module.exports.routes = routes;