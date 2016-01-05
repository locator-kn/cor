'use strict';
const Joi = require('joi');

let validations = {};

let mongoIdField = Joi.string().optional();
let mongoIdFieldRequired = mongoIdField.required();

validations.conversationId = Joi.object().keys({
    conversationId: mongoIdFieldRequired
});

validations.messageType = Joi.object().keys({
    messageType: Joi.string().allow('text', 'location').required()
});

validations.message = Joi.object().keys({
    conversation_id: mongoIdFieldRequired,
    location_id: mongoIdField,
    message: Joi.string()
}).xor('message', 'location_id');

validations.dataPaged = Joi.object().keys({
    page: Joi.number().default(0),
    elements: Joi.number().default(20)
}).and('page', 'elements');


let participant = Joi.object().keys({
    user_id: Joi.string().required()
});

validations.postConversation = Joi.object().keys({
    participants: Joi.array().items(participant).min(1)
});


validations.ackPayload = Joi.object().keys({
    last_read: Joi.number().min(1)
});

module.exports = validations;