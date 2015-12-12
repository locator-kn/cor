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
            query: validation.getLocationsNearby
        }
    }
});


module.exports.routes = routes;