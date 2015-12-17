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

module.exports.routes = routes;