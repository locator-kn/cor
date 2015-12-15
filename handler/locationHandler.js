'use strict';
const hoek = require('hoek');
const boom = require('boom');


let handler = {};
const basicPin = {
    role: 'location'
};

handler.getLocationById = (request, reply) => {
    // decorate basic pin with cmd
    let requestPattern = {cmd: 'locationById'};

    // add data to request pattern
    requestPattern.data = request.query;

    // merge request patter with basic pin
    hoek.merge(requestPattern, basicPin);

    request.server.pact(requestPattern)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

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
            reply(boom.badRequest(error));
        });

};


handler.postSchoenhier = (request, reply) => {
    // decorate basic pin with cmd
    let requestPattern = {cmd: 'addschoenhier'};


    // add data to request pattern
    requestPattern.data = request.payload;

    // merge request patter with basic pin
    requestPattern = hoek.merge(requestPattern, basicPin);

    request.server.pact(requestPattern)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};


handler.getSchoenhierNearby = (request, reply) => {
    let requestPattern = {
        cmd: 'nearbyschoenhier'
    };

    requestPattern.data = request.query;
    hoek.merge(requestPattern, basicPin);

    request.server.pact(requestPattern)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });
};


module.exports = handler;