'use strict';
const routes = [];
const handler = require('../handler/locationHandler');
const validation = require('../validation/locationValidation');

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


//routes.push({
//    method: 'GET',
//    path: '/locations/search/{locationName}',
//    handler: handler.getLocationByName,
//    config: {
//        description: 'Get location by its name',
//        notes: 'Returns an object.',
//        tags: ['api', 'locations'],
//        validate: {
//            params: validation.locationName
//        }
//    }
//});

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

//TODO: Delete Location

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
    method: 'POST',
    path: '/locations/{locationId}/stream/text',
    handler: handler.postTextImpression,
    config: {
        description: 'add new text-impression to a location',
        notes: 'TODO',
        tags: ['api', 'location', 'stream', 'impression', 'text'],
        validate: {
            params: validation.locationId,
            payload: validation.textImpression
        },
        auth: 'session'
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
            params: validation.locationId
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




routes.push({
    method: 'POST',
    path: '/locations/{locationId}/stream/image',
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
    path: '/locations/{locationId}/stream/video',
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


module.exports.routes = routes;