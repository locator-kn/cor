'use strict';
const boom = require('boom');
const Wreck = require('wreck');

const util = require('../lib/util');
const helper = require('../lib/responseHelper');
const google = require('../lib/googleutil');

const log = require('ms-utilities').logger;


let handler = {};
const basicPin = {
    role: 'location'
};

let genericFileResponseHandler = (err, res, request, reply, type) => {

    if (err) {
        log.fatal(err, 'Got error after image upload for location');
        return reply(boom.badRequest());
    }

    // read response
    Wreck.read(res, {json: true}, (err, response) => {
        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from ms-fileserve');
            return reply(boom.badRequest());
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }


        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'addimpression';
        pattern.type = type;

        let message = {
            location_id: request.params.locationId,
            user_id: util.getUserId(request.auth),
            file: {
                id: response._id,
                name: response.filename
            }
        };


        let senecaAct = util.setupSenecaPattern(pattern, message, basicPin);

        request.server.pact(senecaAct)
            .then(helper.unwrap)
            .then(res => {

                reply(res);

                if (res.isBoom) {
                    // remove the uploaded image again by making an internal DELETE request
                    Wreck.delete('http://localhost:3453/file/' + response._id, (err) => {
                        if (err) {
                            log.error(err, 'Error Deleting file type ' + type, {id: response._id});
                        }
                    });
                }
            })
            .catch(error => reply(boom.badImplementation(error)));
    });
};

handler.getLocationById = (request, reply) => {

    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'locationById';

    let senecaAct = util.setupSenecaPattern(pattern, request.params, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => reply(boom.badImplementation(error)));
};

handler.getLocationsNearby = (request, reply) => {

    let pattern = util.clone(request.basicSenecaPattern);
    pattern.cmd = 'nearby';

    let senecaAct = util.setupSenecaPattern(pattern, request.query, basicPin);

    request.server.pact(senecaAct)
        .then(resp => reply(helper.unwrap(resp)))
        .catch(error => reply(boom.badImplementation(error)));
};

handler.createLocationAfterImageUpload = (err, res, request, reply) => {

    if (err) {
        log.fatal(err, 'Got error after image upload for location');
        return reply(boom.badRequest());
    }

    // read response
    Wreck.read(res, {json: true}, (err, response) => {

        if (err) {
            log.fatal(err, 'ERROR: Unable to read response from ms-fileserve');
            return reply(boom.badRequest());
        }

        if (response.statusCode >= 400) {
            return reply(boom.create(response.statusCode, response.message, response.error));
        }

        let pattern = util.clone(request.basicSenecaPattern);
        pattern.cmd = 'addnewlocation';

        let location = {
            user_id: request.basicSenecaPattern.requesting_user_id,
            title: response.location.title,
            categories: response.location.categories,
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
                title: '',
                place_id: ''
            }
        };

        let locationId;
        let userId;

        google.findNameOfPosition(response.location.long, response.location.lat)
            .then(cParam => {
                location.city.title = cParam.title;
                location.city.place_id = cParam.place_id;
                return location;
            })
            .catch(error => {
                log.warn(error);
                return location;
            })
            .then(location => {
                let senecaAct = util.setupSenecaPattern(pattern, location, basicPin);

                return request.server.pact(senecaAct);
            })
            .then(res => {

                // reply to client
                reply(helper.unwrap(res));
                locationId = res._id;
                userId = res.user_id;
            })
            .catch(error => reply(boom.badImplementation(error)))
            .then(() => {

                // send push notifications
                let pushPattern = util.clone(request.basicSenecaPattern);
                pushPattern.cmd = 'notify';
                pushPattern.entity = 'newLocation';

                let pushAct = util.setupSenecaPattern(pushPattern,
                    {
                        location_id: locationId,
                        user_id: userId,
                        user_name: request.auth.credentials.name
                    },
                    {role: 'notifications'});

                return request.server.pact(pushAct);
            })
            .catch(err => log.warn({error: err}, 'Error sending push'));
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

let genericUnFavorLocation = (request, reply) => {
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

handler.postFavorLocation = (request, reply) => {
    request.basicSenecaPattern.cmd = 'favor';
    genericUnFavorLocation(request, reply);
};

handler.postUnfavorLocation = (request, reply) => {
    request.basicSenecaPattern.cmd = 'unfavor';
    genericUnFavorLocation(request, reply);
};

handler.getLocationByName = (request, reply) => {

    let senecaAct;
    let name = request.query.locationName;
    let long = request.query.long;
    let lat = request.query.lat;

    if (name) {
        senecaAct = util.setupSenecaPattern('locationbyname', {locationName: request.query.locationName}, basicPin);
    }
    else {
        senecaAct = util.setupSenecaPattern('nearby', request.query, basicPin);
    }

    let gFinds = google.locationSearch(name, lat, long);

    let dbPromise = request.server.pact(senecaAct);

    Promise.all([dbPromise, gFinds])
        .then(value => {

            let dbLocations = value[0];
            let googleLocations = value[1];

            let result = {
                google: googleLocations,
                locator: dbLocations.data.results
            };
            reply(result);
        })
        .catch(error => {
            reply(boom.badRequest(error));
        });
};

handler.postUpdateLocation = (request, reply) => {
    return reply(boom.notImplemented('todo'));
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
