'use strict';
const boom = require('boom');

const util = require('../lib/util');


let handler = {};
const basicPin = {
    role: 'messenger'
};

handler.getConversationById = (request, reply) => {

    return reply(boom.notImplemented('todo'));
};

handler.getMyConversations = (request, reply) => {

    return reply(boom.notImplemented('todo'));
};

handler.getMessagesByConversationId = (request, reply) => {

    return reply(boom.notImplemented('todo'));
};


handler.postConversation = (request, reply) => {

    let conversationData = request.payload;

    conversationData.participants.push({
        user_id: util.getUserId(request.auth),
        last_read: Date.now()
    });

    let senecaAct = util.setupSenecaPattern({
        cmd: 'newconversation'
    }, conversationData, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'ValidationError') {
                return reply(boom.badRequest(error.details.message));
            }
            console.log(JSON.stringify(error));
            return reply(boom.badRequest(error.details.message));

        });
};

handler.postMessage = (request, reply) => {

    let messageData = request.payload;
    messageData.timestamp = Date.now();
    messageData.from = util.getUserId(request.auth);

    let senecaAct = util.setupSenecaPattern({
        cmd: 'newmessage',
        message_type: request.params.messageType
    }, messageData, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'ValidationError') {
                return reply(boom.badRequest(error.details.message));
            }
            console.log(JSON.stringify(error));
            return reply(boom.badRequest(error.details.message));

        });
};


module.exports = handler;