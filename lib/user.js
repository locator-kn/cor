'use strict';
const routes = [];
const handler = require('../handler/userHandler');
const validation = require('../validation/userValidation');


routes.push({
    method: 'POST',
    path: '/login',
    handler: handler.login,
    config: {
        description: 'log out, kill session',
        tags: ['api', 'user', 'logout']
        //validate: {
        //    params: validation.postUser
        //}
    }
});


routes.push({
    method: 'GET',
    path: '/logout',
    handler: handler.logout,
    config: {
        description: 'perform login',
        tags: ['api', 'user', 'login', 'auth']
        //validate: {
        //    params: validation.postUser
        //}
    }
});

routes.push({
    method: 'POST',
    path: '/register',
    handler: handler.register,
    config: {
        description: 'register user',
        tags: ['api', 'user', 'register']
    }
});


module.exports.routes = routes;