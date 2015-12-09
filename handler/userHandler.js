'use strict';
const hoek = require('hoek');
const boom = require('boom');


let handler = {};
const basicPin = {
    role: 'user'
};

handler.postUser = (request, reply) => {
    // decorate basic pin with cmd
    let requestPattern = {cmd: 'login'};

    // add data to request pattern
    requestPattern.data = request.payload;

    // merge request patter with basic pin
    requestPattern = hoek.merge(requestPattern, basicPin);

    request.server.pact(requestPattern)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest('du depp'));
        });

};


handler.getHallo = (request, reply) => {
    reply('hallo');
};


module.exports = handler;