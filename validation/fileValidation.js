'use strict';
const Joi = require('joi');
let validations = {};

validations.getFile = Joi.object().keys({
    fileId: Joi.string().required(),
    name: Joi.string().required(),
    ext: Joi.string().required()
});



validations.getAudioFile = Joi.object().keys({
    fileId: Joi.string().required(),
    name: Joi.string().required(),
    ext: Joi.string().required()
});



validations.getImageFile = Joi.object().keys({
    fileId: Joi.string().required(),
    name: Joi.string().required(),
    ext: Joi.string().required()
});



validations.getVideoFile = Joi.object().keys({
    fileId: Joi.string().required(),
    name: Joi.string().required(),
    ext: Joi.string().required()
});

module.exports = validations;