'use strict';
const boom = require('boom');

const util = require('../lib/util');
const slack = require('ms-utilities').slack;

let handler = {};
const basicPin = {
    role: 'device'
};

handler.register = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('register', request.payload, basicPin);

    request.server.pact(senecaAct)
        .then(result => {

            return reply({message: 'device registered, locator-cookie was set'})
                .state('locator_device', result.sessionData).code(201);
        })
        .catch(err => {

            reply(boom.badRequest(err));

            slack.sendSlackError(process.env['SLACK_ERROR_CHANNEL'], 'Error registering device:');
            slack.sendSlackError(process.env['SLACK_ERROR_CHANNEL'], err);
        });

};

module.exports = handler;
