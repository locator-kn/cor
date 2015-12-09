'use strict';

let handler = {};

handler.postUser = (request, reply) => {
    reply('hallo');
};


handler.getHallo = (request, reply) => {
    reply('hallo');
};


module.exports = handler;