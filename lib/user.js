'use strict';
const routes = [];
const handler = require('../handler/userHandler');
const validation = require('../validation/userValidation');
const fileValidation = require('../validation/fileValidation');


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
        tags: ['api', 'user', 'logout'],
        auth: 'session'
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
    path: '/users/register/image',
    handler: {
        proxy: {
            uri: 'http://localhost:3453/users/register/image',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.userRegisterImageUploadRespone
        }
    },
    config: {
        description: 'register user with image',
        tags: ['api', 'user', 'register', 'image']
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
        }
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
    path: '/my/users/forgetPassword',
    handler: handler.forgetPassword,
    config: {
        description: 'Resets password and notify user',
        tags: ['api', 'user', 'password'],
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
    path: '/users/{userId}',
    handler: handler.getUserById,
    config: {
        description: 'get user by id',
        tags: ['api', 'user'],
        validate: {
            params: validation.userId,
            query: validation.count
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

routes.push({
    method: 'PUT',
    path: '/my/users/changePwd',
    handler: handler.changePwd,
    config: {
        description: 'change password',
        tags: ['api', 'user', 'password'],
        auth: 'session',
        validate: {
            payload: validation.updatePwd
        }
    }
});

/** Images **/

routes.push({
    method: 'POST',
    path: '/users/image',
    handler: {
        proxy: {
            uri: 'http://localhost:3453/stream/image',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.userImageUploadRespone
        }
    },
    config: {
        description: 'Upload an user image',
        notes: 'request will be proxied',
        tags: ['api', 'image', 'user', 'new']
    }
});


routes.push({
    method: 'GET',
    path: '/users/image/{fileId}/{name}.{ext}',
    handler: {
        proxy: {
            mapUri: (request, callback) => {
                callback(null, 'http://localhost:3453/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
            }
        }
    },
    config: {
        description: 'Get Image',
        notes: 'Retrieve an image from a user',
        auth: false,
        validate: {
            params: fileValidation.getFile
        },
        tags: ['api']
    }
});


module.exports.routes = routes;
