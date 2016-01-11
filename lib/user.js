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
    method: 'POST',
    path: '/users/{toFollow}/follow',
    handler: handler.follow,
    config: {
        description: 'follow another user',
        tags: ['api', 'user', 'follow'],
        validate: {
            params: validation.follow
        },
        auth: 'session'
    }
});

routes.push({
    method: 'GET',
    path: '/my/users/following',
    handler: handler.getMyFollowing,
    config: {
        description: 'get the users im following',
        tags: ['api', 'user', 'follow'],
        auth: 'session'
    }
});

routes.push({
    method: 'GET',
    path: '/users/{userId}/following',
    handler: handler.getFollowingByUserId,
    config: {
        description: 'get the users which {userId} follows',
        tags: ['api', 'user', 'follow'],
        validate: {
            params: validation.userId
        },
        auth: 'session'
    }
});


routes.push({
    method: 'GET',
    path: '/my/users/follower',
    handler: handler.getMyFollower,
    config: {
        description: 'get my follower',
        tags: ['api', 'user', 'follow'],
        auth: 'session'
    }
});
routes.push({
    method: 'GET',
    path: '/users/{userId}/follower',
    handler: handler.getFollowerByUser,
    config: {
        description: 'get the follower from user',
        tags: ['api', 'user', 'follow'],
        validate: {
            params: validation.userId
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