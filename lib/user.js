'use strict';
const routes = [];
const handler = require('../handler/userHandler');
const validation = require('../validation/userValidation');


routes.push({
    method: 'POST',
    path: '/users/login',
    config: {
        description: 'perform login',
        tags: ['api', 'user', 'login'],
        auth: {
            mode: 'try',
            strategy: 'session'
        },
        handler: handler.login,
        validate: {
            payload: validation.login
        }
    }
});


routes.push({
    method: 'GET',
    path: '/users/logout',
    handler: handler.logout,
    config: {
        description: 'log out, kill session',
        tags: ['api', 'user', 'logout']
    }
});

routes.push({
    method: 'POST',
    path: '/users/register',
    handler: handler.register,
    config: {
        description: 'register user',
        tags: ['api', 'user', 'register'],
        validate: {
            payload: validation.register
        }
    }
});

routes.push({
    method: 'GET',
    path: '/users/protected',
    handler: handler.protected,
    config: {
        description: 'protected test',
        tags: ['api', 'test', 'protected'],
        auth: 'session'
    }
});


module.exports.routes = routes;