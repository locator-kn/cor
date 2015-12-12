'use strict';
const routes = [];
const handler = require('../handler/locationHandler');
const validation = require('../validation/locationValidation');


routes.push({
    method: 'GET',
    path: '/locations/nearby',
    handler: handler.getLocationsNearby,
    config: {
        validate: {
            query: validation.getLocationsNearby
        }
    }
});


module.exports.routes = routes;