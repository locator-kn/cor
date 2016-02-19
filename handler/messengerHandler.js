'use strict';
const boom = require('boom');

const util = require('../lib/util');

const helper = require('../lib/responseHelper');

let handler = {};
const basicPin = {
    role: 'messenger'
};

handler.getConversationById = (request, reply) => {
    let conID = request.params.conversationId;

    request.basicSenecaPattern.cmd = 'getconversationbyid';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {conversation_id: conID}, basicPin);

    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'ValidationError') {
                return reply(boom.badRequest(error.details.message));
            }
            return reply(boom.badRequest(error.details.message));

        });
};

handler.getMyConversations = (request, reply) => {

    request.basicSenecaPattern.cmd = 'getconversationsbyuser';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {user_id: util.getUserId(request.auth)}, basicPin);

    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'ValidationError') {
                return reply(boom.badRequest(error.details.message));
            }
            return reply(boom.badRequest(error.details.message));

        });
};

handler.getMessagesByConversationId = (request, reply) => {
    let conversationId = request.params.conversationId;
    let query = request.query;


    request.basicSenecaPattern.cmd = 'getmessagesbyconversationid';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        conversation_id: conversationId,
        query: query
    }, basicPin);

    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'ValidationError') {
                return reply(boom.badRequest(error.details.message));
            }
            console.log(JSON.stringify(error));
            return reply(boom.badRequest(error.details.message));

        });
};


handler.postConversation = (request, reply) => {

    let conversationData = request.payload;

    conversationData.participants.push({
        user_id: util.getUserId(request.auth),
        last_read: Date.now()
    });

    request.basicSenecaPattern.cmd = 'newconversation';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, conversationData, basicPin);

    request.server.pact(senecaAct)
        .then(helper.unwrap)
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

    request.basicSenecaPattern.cmd = 'newmessage';
    request.basicSenecaPattern.message_type = request.params.messageType;

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, messageData, basicPin);

    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'ValidationError') {
                return reply(boom.badRequest(error.details.message));
            }
            console.log(JSON.stringify(error));
            return reply(boom.badRequest(error.details.message));

        });
};

handler.ackConversation = (request, reply) => {
    let time = request.payload.last_read;
    let conversationId = request.params.conversationId;
    let userId = util.getUserId(request.auth);

    request.basicSenecaPattern.cmd = 'ackConverstaion';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
            user_id: userId,
            conversation_id: conversationId,
            last_read: time
        }, basicPin);

    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'not found') {
                return reply(boom.notFound(error.details.message));
            }
            console.log(JSON.stringify(error));
            return reply(boom.badRequest(error.details.message));

        });
};


module.exports = handler;