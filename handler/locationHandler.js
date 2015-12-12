'use strict';
const hoek = require('hoek');
const boom = require('boom');


let handler = {};
const basicPin = {
    role: 'location'
};

handler.getLocationsNearby = (request, reply) => {
    // decorate basic pin with cmd
    let requestPattern = {cmd: 'nearby'};


    // add data to request pattern
    requestPattern.data = request.query;

    // merge request patter with basic pin
    requestPattern = hoek.merge(requestPattern, basicPin);

    request.server.pact(requestPattern)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest('du depp'));
        });

};


handler.getHallo = (request, reply) => {
    let requestPattern = {
        cmd: 'else'
    };

    hoek.merge(requestPattern, basicPin);


    console.info('requesting', requestPattern);
    request.server.pact('role:mailer,cmd:else')
        .then(reply)
        .catch(error => {
            console.log(error);
            reply(boom.badRequest('du depp'));
        });
};


module.exports = handler;