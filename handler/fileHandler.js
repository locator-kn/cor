'use strict';
const hoek = require('hoek');
const boom = require('boom');


let handler = {};
const basicPin = {
    role: 'file'
};

handler.getFile = (request, reply) => {

    // decorate basic pin with cmd
    let requestPattern = {cmd: 'get'};

    // add data to request pattern
    requestPattern.data = request.params;

    // merge request patter with basic pin
    requestPattern = hoek.merge(requestPattern, basicPin);

    request.server.pact(requestPattern)
        .then(reply)
        .catch(err => {
            request.log(['file', 'error'], err);
            reply(boom.badRequest());
        });
};


module.exports = handler;
