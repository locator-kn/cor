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

handler.postMessage = (request, reply) => {

    return reply(boom.notImplemented('todo'));
};


module.exports = handler;