'use strict';
const boom = require('boom');
const Wreck = require('wreck');
const slack = require('ms-utilities').slack;


const util = require('../lib/util');
const helper = require('../lib/responseHelper');

const log = require('ms-utilities').logger;


//const google = require('../lib/googleutil')

let handler = {};
const basicPin = {
    role: 'location'
};

let genericFileResponseHandler = (err, res, request, reply, type) => {

    if (err) {
        return reply(boom.badRequest(err));
    }

    // read response
    Wreck.read(res, {json: true}, (err, response) => {
        if (err) {
            return reply(boom.badRequest(err));
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }

        let userId = util.getUserId(request.auth);
        let senecaAct = util.setupSenecaPattern({cmd: 'addimpression', type: type}, {
            location_id: request.params.locationId,
            user_id: userId,
            message: response // response from db after file upload
        }, basicPin);

        request.server.pact(senecaAct)
            .then(reply)
            .catch(error => {
                if (error.message.includes('Invalid id')) {

                    // remove the uploaded image again by making an internal DELETE request
                    Wreck.delete('http://localhost:3453/file/' + response._id, (err) => {
                        if (err) {
                            slack.sendSlackError(process.env['SLACK_ERROR_CHANNEL'],
                                'Error Deleting file type ' + type + '. Because of: ' + err);
                        }
                    });
                    return reply(boom.notFound('location_id'));
                }
                reply(boom.badImplementation(error));
            });
    });
};

handler.getLocationById = (request, reply) => {

    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'locationById';

    let senecaAct = util.setupSenecaPattern(pattern, request.params, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => {
            log.fatal('Error getting location by id', {err: error});
            reply(boom.badRequest('sorry'));
        });

};

handler.getLocationsNearby = (request, reply) => {

    request.basicSenecaPattern.cmd = 'nearby';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};

handler.createLocationAfterImageUpload = (err, res, request, reply) => {

    if (err) {
        return reply(boom.badRequest(err));
    }

    // read response
    Wreck.read(res, {json: true}, (err, response) => {

        if (err) {
            return reply(boom.badRequest(err));
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }

        //    let cityParams = google.findNameOfPosition(response); //TODO: city params come from google place search
        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'addnewlocation';

        let location = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            title: response.location.title,
            categories: response.location.categories || [], // TODO
            favorites: [],
            public: true,
            geotag: {
                type: 'Point',
                coordinates: [response.location.long, response.location.lat]
            },
            images: {
                xlarge: '/api/v2/locations/impression/image/' + response.images.xlarge + '/' + response.images.name,
                large: '/api/v2/locations/impression/image/' + response.images.large + '/' + response.images.name,
                normal: '/api/v2/locations/impression/image/' + response.images.normal + '/' + response.images.name,
                small: '/api/v2/locations/impression/image/' + response.images.small + '/' + response.images.name
            },
            city: {
                title: /*cityParams.title*/ 'here goes the city name',
                place_id: /*cityParams.placeId*/ 'hIJWx8MOBv2mkcR0JnfpbdrHwQ'
            }
        };

        let senecaAct = util.setupSenecaPattern(pattern, location, basicPin);

        request.server.pact(senecaAct)
            .then(reply)
            .catch(error => {
                reply(boom.badRequest(error));
            });

    });

};


handler.deleteLocation = (request, reply) => {
    request.basicSenecaPattern.cmd = 'deletelocation';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};

handler.getAllLocationsByUserId = (request, reply) => {
    request.basicSenecaPattern.cmd = 'getlocbyuserid';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, request.params, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });
};


handler.postSchoenhier = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('addschoenhier', request.payload, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};


handler.getSchoenhierNearby = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('nearbyschoenhier', request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });
};


handler.getLocationsStream = (request, reply) => {

    let userId = util.getUserId(request.auth);
    let senecaAct = util.setupSenecaPattern('getlocationstream', {
        location_id: request.params.locationId,
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            if (error.message.includes('Invalid id.') || error.message.includes('invalid location_id')) {
                return reply(boom.notFound('location_id'));
            }
            reply(boom.badImplementation(error));
        });

};

handler.postTextImpression = (request, reply) => {

    let userId = request.basicSenecaPattern.requesting_user_id;

    request.basicSenecaPattern.cmd = 'addimpression';
    request.basicSenecaPattern.type = 'text';


    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        location_id: request.params.locationId,
        user_id: userId,
        message: request.payload.data
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            if (error.message.includes('Invalid id.')) {
                return reply(boom.notFound('location_id'));
            }
            reply(boom.badImplementation(error));
        });

};


handler.getFavoriteLocationsByUserId = (request, reply, optionalUserId) => {
    let userId = optionalUserId || request.params.userId;

    let senecaAct = util.setupSenecaPattern('getfavoritelocationbyuserid', {
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });

};


handler.getMyFavoriteLocations = (request, reply) => {

    handler.getFavoriteLocationsByUserId(request, reply, request.basicSenecaPattern.requesting_user_id);
};

handler.postToggleFavorLocation = (request, reply) => {
    request.basicSenecaPattern.cmd = 'toggleFavor';
    let userId = request.basicSenecaPattern.requesting_user_id;

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        location_id: request.params.locationId,
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
};

handler.getLocationByName = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('locationbyname', request.params, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });
};

handler.postUpdateLocation = (request, reply) => {
    return reply(boom.notImplemented ('todo'));
};

handler.imageUploadRespone = (err, res, request, reply) => {

    genericFileResponseHandler(err, res, request, reply, 'image');
};


handler.videoUploadRespone = (err, res, request, reply) => {

    genericFileResponseHandler(err, res, request, reply, 'video');
};

handler.audioUploadRespone = (err, res, request, reply) => {

    genericFileResponseHandler(err, res, request, reply, 'audio');
};


module.exports = handler;