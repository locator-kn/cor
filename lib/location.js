'use strict';
const routes = [];
const handler = require('../handler/locationHandler');
const validation = require('../validation/locationValidation');
const fileValidation = require('../validation/fileValidation');

const slack = require('ms-utilities').slack;

routes.push({
    method: 'POST',
    path: '/locations',
    handler: handler.postNewLocation,
    config: {
        description: 'adds a new location',
        notes: 'success note',
        tags: ['api', 'location', 'new'],
        validate: {
            payload: validation.newLocation
        }
    }
});

routes.push({
    method: 'GET',
    path: '/locations/{locationId}',
    handler: handler.getLocationById,
    config: {
        description: 'Get location by its id',
        notes: 'Returns a object.',
        tags: ['api', 'locations'],
        validate: {
            params: validation.locationId
        }
    }
});

routes.push({
    method: 'GET',
    path: '/locations/users/{userId}',
    handler: handler.getAllLocationsByUserId,
    config: {
        description: 'get all locations by the userId',
        notes: 'Returns an array.',
        tags: ['api', 'locations'],
        validate: {
            params: validation.userIDLocations
        }
    }
});


routes.push({
    method: 'GET',
    path: '/locations/search/{locationName}',
    handler: handler.getLocationByName,
    config: {
        description: 'Get location by its name',
        notes: 'Returns an object.',
        tags: ['api', 'locations'],
        validate: {
            params: validation.locationName
        }
    }
});


routes.push({
    method: 'GET',
    path: '/locations/nearby',
    handler: handler.getLocationsNearby,
    config: {
        description: 'Find nearby locations',
        notes: 'Returns a object with a results array. Each element has a distance property and the location itself.',
        tags: ['api', 'locations'],
        validate: {
            query: validation.nearbyQuery
        }
    }
});


routes.push({
    method: 'DELETE',
    path: '/locations/delete/{locationId}',
    handler: handler.deleteLocation,
    config: {
        description: 'delete a location by its id',
        notes: 'success note.',
        tags: ['api', 'locations'],
        validate: {
            params: validation.deleteLocation
        }
    }
});

//TODO: Update Locations
routes.push({
    method: 'POST',
    path: '/schoenhiers',
    handler: handler.postSchoenhier,
    config: {
        description: 'mark a place as schoenhier',
        notes: 'Returns a object with the database object.',
        tags: ['api', 'schoenhier'],
        validate: {
            payload: validation.postSchoenhier
        }
    }
});


routes.push({
    method: 'GET',
    path: '/schoenhiers/nearby',
    handler: handler.getSchoenhierNearby,
    config: {
        description: 'mark a place as schoenhier',
        notes: 'Returns a object with the database object.',
        tags: ['api', 'schoenhier'],
        validate: {
            query: validation.nearbyQuery
        }
    }
});


routes.push({
    method: 'GET',
    path: '/locations/{locationId}/stream',
    handler: (request, reply) => {

        slack.sendSlackError(process.env['SLACK_ERROR_CHANNEL'], 'ERROR: deprecated route /locations/{locationId}/stream ' +
            'was called. Use /locations/{locationId}/impressions');

        reply.redirect('/locations/' + request.params.locationId + '/impressions');
    },
    config: {
        description: 'DEPRECATED',
        notes: 'Deprecated, use /locations/{locationId}/impressions',
        tags: ['api', 'location', 'stream', 'DEPRECATED'],
        validate: {
            params: validation.locationId
        }
    }
});

routes.push({
    method: 'GET',
    path: '/locations/{locationId}/impressions',
    handler: handler.getLocationsStream,
    config: {
        description: 'get a locations activity, eg. uploaded images/clips/voices/text',
        notes: 'Returns an array with different kind of objects sorted by date',
        tags: ['api', 'location', 'stream'],
        validate: {
            params: validation.locationId
        }
    }
});


routes.push({
    method: 'GET',
    path: '/my/locations/favored',
    handler: handler.getMyFavoriteLocations,
    config: {
        description: 'Get favored locations by currently logged in user',
        notes: 'piffpaff',
        tags: ['api', 'location', 'fav']
    }
});

routes.push({
    method: 'GET',
    path: '/locations/users/{userId}/favored',
    handler: handler.getFavoriteLocationsByUserId,
    config: {
        description: 'Get favored locations by user id',
        notes: 'piffpaff',
        tags: ['api', 'location', 'fav'],
        validate: {
            params: validation.userIDLocations
        }
    }
});

routes.push({
    method: 'POST',
    path: '/locations/{locationId}/favor',
    handler: handler.postToggleFavorLocation,
    config: {
        description: 'Toggle: (Un-)Favor a location by the currently logged in user',
        notes: 'returns object with new fav-count, added and removed info (bool)',
        tags: ['api', 'location', 'favor', 'favorites'],
        validate: {
            params: validation.locationId
        },
        auth: 'session'
    }
});


/** FILES POST **/

routes.push({
    method: 'POST',
    path: '/locations/{locationId}/impressions/text',
    handler: handler.postTextImpression,
    config: {
        description: 'add new text-impression to a location',
        notes: 'TODO',
        tags: ['api', 'location', 'impression', 'text'],
        validate: {
            params: validation.locationId,
            payload: validation.textImpression
        },
        auth: 'session'
    }
});

routes.push({
    method: 'POST',
    path: '/locations/{locationId}/impressions/image',
    handler: {
        proxy: {
            uri: 'http://localhost:3453/stream/image',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.imageUploadRespone
        }
    },
    config: {
        description: 'Add Image',
        notes: 'Uploads an image to a location. Request is proxied to port 3453',
        tags: ['api', 'location', 'new', 'image'],
        auth: 'session'
    }
});

routes.push({
    method: 'POST',
    path: '/locations/{locationId}/impressions/video',
    handler: {
        proxy: {
            uri: 'http://localhost:3453/stream/video',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.videoUploadRespone
        }
    },
    config: {
        description: 'Add video',
        notes: 'Uploads a video to a location. Request is proxied to port 3453',
        tags: ['api', 'location', 'new', 'video'],
        auth: 'session'
    }
});

routes.push({
    method: 'POST',
    path: '/locations/{locationId}/impressions/audio',
    handler: {
        proxy: {
            uri: 'http://localhost:3453/stream/audio',
            passThrough: true,
            acceptEncoding: false,
            onResponse: handler.audioUploadRespone
        }
    },
    config: {
        description: 'Add audio',
        notes: 'Uploads an audio to a location. Request is proxied to port 3453',
        tags: ['api', 'location', 'new', 'audio'],
        auth: 'session'
    }
});


/** FILES GET **/

routes.push({
    method: 'GET',
    path: '/locations/impression/image/{fileId}/{name}.{ext}',
    handler: {
        proxy: {
            mapUri: (request, callback) => {
                callback(null, 'http://localhost:3453/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
            }
        }
    },
    config: {
        description: 'Get Image',
        notes: 'Retrieve an image from a location',
        auth: false,
        validate: {
            params: fileValidation.getImageFile
        },
        tags: ['api']
    }
});

routes.push({
    method: 'GET',
    path: '/locations/impression/audio/{fileId}/{name}.{ext}',
    handler: {
        proxy: {
            mapUri: (request, callback) => {
                callback(null, 'http://localhost:3453/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
            }
        }
    },
    config: {
        description: 'Get audio',
        notes: 'Retrieve an audio from a location',
        auth: false,
        validate: {
            params: fileValidation.getAudioFile
        },
        tags: ['api']
    }
});

routes.push({
    method: 'GET',
    path: '/locations/impression/video/{fileId}/{name}.{ext}',
    handler: {
        proxy: {
            mapUri: (request, callback) => {
                callback(null, 'http://localhost:3453/file/' + request.params.fileId + '/' + request.params.name + '.' + request.params.ext);
            }
        }
    },
    config: {
        description: 'Get video',
        notes: 'Retrieve a video from a location',
        auth: false,
        validate: {
            params: fileValidation.getVideoFile
        },
        tags: ['api']
    }
});


module.exports.routes = routes;