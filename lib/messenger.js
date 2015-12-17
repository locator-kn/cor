'use strict';
const routes = [];
const handler = require('../handler/messengerHandler');
const validation = require('../validation/messengerValidation');


routes.push({
    method: 'GET',
    path: '/conversations/{conversationId}',
    handler: handler.getConversationById,
    config: {
        description: 'Get conversation by its id',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: validation.conversationId
        }
    }
});


routes.push({
    method: 'GET',
    path: '/my/conversations',
    handler: handler.getMyConversations,
    config: {
        description: 'Get a list of my (currently logged in user) conversations',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation']
    }
});


routes.push({
    method: 'GET',
    path: '/messages/{conversationId}',
    handler: handler.getMessagesByConversationId,
    config: {
        description: 'Get messages by conversationId',
        notes: 'Returns n messages, n depends on query param "elements".',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: validation.conversationId,
            query: validation.dataPaged
        }
    }
});

routes.push({
    method: 'POST',
    path: '/messages/{messageType}',
    handler: handler.postMessage,
    config: {
        description: 'Send new message',
        notes: 'returns _id of created message, currently supported message types are text and location',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: validation.messageType,
            payload: validation.message
        }
    }
});

module.exports.routes = routes;