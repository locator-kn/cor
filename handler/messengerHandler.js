'use strict';
const boom = require('boom');

const util = require('../lib/util');


let handler = {};
const basicPin = {
    role: 'messenger'
};

handler.getConversationById = (request, reply) => {

    return reply(boom.notImplemented('still todo'));
};


module.exports = handler;