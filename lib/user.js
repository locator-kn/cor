'use strict';
const routes = [];
const handler = require('../handler/userHandler');
const validation = require('../validation/userValidation');


routes.push({
    method: 'POST',
    path: '/login',
    handler: handler.login,
    config: {
        //validate: {
        //    params: validation.postUser
        //}
    }
});


routes.push({
    method: 'GET',
    path: '/logout',
    handler: handler.getHallo,
    config: {
        //validate: {
        //    params: validation.postUser
        //}
    }
});


module.exports.routes = routes;