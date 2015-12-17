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
        description: 'Get conversation by its id',
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

module.exports.routes = routes;