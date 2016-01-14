'use strict';
const Joi = require('joi');
let validations = {};

validations.nearbyQuery = Joi.object().keys({
    long: Joi.number().required().default(9.169753789901733),
    lat: Joi.number().required().default(47.66868204997508),
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

validations.locationName = Joi.object().keys({
    locationName: Joi.string().required()
});

validations.userIDLocations = Joi.object().keys({
    userId: Joi.string().required()
});

validations.newLocation = Joi.object().keys({
    title: Joi.string().min(3).max(50).required(),
    long: Joi.number().required(),
    lat: Joi.number().required(),
    description: Joi.string().max(140).default(" "),
 //   categories: Joi.array().items(Joi.string()).max(3).default(""),
    userId: Joi.string().required()
});

validations.textImpression = Joi.object().keys({
    data: Joi.string().min(3).required()
});


module.exports = validations;