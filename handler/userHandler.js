'use strict';
const hoek = require('hoek');
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

    request.server.pact(requestPattern, (err, data) => {

            reply(data);
        });

};


handler.getHallo = (request, reply) => {
    reply('hallo');
};


module.exports = handler;