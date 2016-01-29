'use strict';
const boom = require('boom');

const util = require('../lib/util');
const slack = require('ms-utilities').slack;

let handler = {};
const basicPin = {
    role: 'user'
};

handler.register = (request, reply) => {

    // setup pattern
    let pattern = util.clone(request.basicSenecaPattern);

    pattern.cmd = 'register';
    pattern.entity = 'device';

    let senecaAct = util.setupSenecaPattern(pattern, request.payload, basicPin);

    // call microservice with pattern
    request.server.pact(senecaAct)
        .then(result => {

            return reply({message: 'device registered, locator-cookie was set'})
                .state('locator', {device_id: result.deviceId}).code(201);
        })
        .catch(err => {

            reply(boom.badRequest(err));

            slack.sendSlackError(process.env['SLACK_ERROR_CHANNEL'], 'Error registering device:');
            slack.sendSlackError(process.env['SLACK_ERROR_CHANNEL'], err);
        });

};

module.exports = handler;
