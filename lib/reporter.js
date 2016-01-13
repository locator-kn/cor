'use strict';
const routes = [];
const handler = require('../handler/reporterHandler');
const validation = require('../validation/reporterValidation');


routes.push({
    method: 'GET',
    path: '/recommendations/locations/{userId}',
    handler: handler.getRecByUserId,
    config: {
        description: 'Get recommendations by user',
        notes: 'Returns location recommendation for user.',
        tags: ['api', 'recommendations', 'locations'],
        validate: {
            params: validation.userId
        }
    }
});
//routes.push({
//    method: 'POST',
//    path: '/recommendations/events',
//    handler: handler.postConversation,
//    config: {
//        description: 'Create new conversation with one or more people',
//        notes: 'Returns a conversation object.',
//        tags: ['api', 'messenger', 'conversation'],
//        validate: {
//            payload: validation.postConversation
//        },
//        // TODO remove when user is rdy
//        auth: {
//            mode: 'optional',
//            strategy: 'session'
//        }
//    }
//});

module.exports.routes = routes;