'use strict';
const Joi = require('joi');

let validations = {};

let mongoIdField = Joi.string().required();

validations.conversationId = Joi.object().keys({
    conversationId: mongoIdField
});

validations.messageType = Joi.object().keys({
    messageType: Joi.string().allow('text', 'location').required()
});

validations.message = Joi.object().keys({
    conversation_id: mongoIdField,
    location_id: mongoIdField,
    message: Joi.string()
}).xor('message', 'location_id');

validations.dataPaged = Joi.object().keys({
    page: Joi.number().default(0),
    elements: Joi.number().default(20)
}).and('page', 'elements');

module.exports = validations;