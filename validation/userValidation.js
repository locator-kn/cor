'use strict';
const Joi = require('joi');
let validations = {};

validations.postUser = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
});

module.exports = validations;