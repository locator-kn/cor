'use strict';
const routes = [];
const handler = require('../handler/messengerHandler');
const validation = require('../validation/messengerValidation');


routes.push({
    method: 'GET',
    path: '/conversations/{conversationId}',
    handler: handler.getConversationById,
    config: {
        auth: 'session',
        description: 'Get conversation by its id',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: validation.conversationId
        }
    }
});
routes.push({
    method: 'POST',
    path: '/conversations',
    handler: handler.postConversation,
    config: {
        auth: 'session',
        description: 'Create new conversation with one or more people',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            payload: validation.postConversation
        }
    }
});


routes.push({
    method: 'GET',
    path: '/my/conversations',
    handler: handler.getMyConversations,
    config: {
        auth: 'session',
        description: 'Get a list of my (currently logged in user) conversations',
        notes: 'Returns a conversation object.',
        tags: ['api', 'messenger', 'conversation'],
    }
});


routes.push({
    method: 'GET',
    path: '/messages/{conversationId}',
    handler: handler.getMessagesByConversationId,
    config: {
        auth: 'session',
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
        auth: 'session',
        description: 'Send new message',
        notes: 'returns _id of created message, currently supported message types are text and location',
        tags: ['api', 'messenger', 'conversation'],
        validate: {
            params: validation.messageType,
            payload: validation.message
        }
    }
});

routes.push({
    method: 'POST',
    path: '/conversations/{conversationId}/ack',
    handler: handler.ackConversation,
    config: {
        auth: 'session',
        description: 'Acknowledge a conversation by timestamp',
        notes: 'returns nothing if everything was ok',
        tags: ['api', 'messenger', 'conversation', 'ackack'],
        validate: {
            params: validation.conversationId,
            payload: validation.ackPayload
        }
    }
});

module.exports.routes = routes;