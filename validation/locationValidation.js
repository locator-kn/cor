'use strict';
const Joi = require('joi');
let validations = {};

validations.nearbyQuery = Joi.object().keys({
    long: Joi.number().required().default(9.169753789901733),
    lat: Joi.number().required().default(47.66868204997508),
    maxDistance: Joi.number().default(2),
    limit: Joi.number().default(20)
});
validations.nearbyQueryOptional = Joi.object().keys({
    long: Joi.number().default(9.169753789901733),
    lat: Joi.number().default(47.66868204997508),
    maxDistance: Joi.number().default(2),
    limit: Joi.number().default(20)
});

validations.postSchoenhier = Joi.object().keys({
    long: Joi.number().required().default(9.169753789901733),
    lat: Joi.number().required().default(47.66868204997508)
});

validations.locationId = Joi.object().keys({
    locationId: Joi.string().required()
});

validations.locationByName = Joi.object().keys({
    locationName: Joi.string()
});

validations.coordinates = Joi.object().keys({
    long: Joi.number().default(9.169753789901733),
    lat: Joi.number().default(47.66868204997508)
});

validations.userIDLocations = Joi.object().keys({
    userId: Joi.string().required()
});


validations.textImpression = Joi.object().keys({
    data: Joi.string().min(3).required()
});


validations.deleteLocation = Joi.object().keys({
    locationId: Joi.string().required()
});
validations.videoImpressionId = Joi.object().keys({
    videoId: Joi.string().required()
});


validations.imageImpressionId = Joi.object().keys({
    imageId: Joi.string().required()

});


module.exports = validations;