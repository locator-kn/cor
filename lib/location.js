'use strict';
const routes = [];
const handler = require('../handler/locationHandler');
const validation = require('../validation/locationValidation');


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


module.exports.routes = routes;