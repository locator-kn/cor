'use strict';
const Joi = require('joi');
let validations = {};

validations.login = Joi.object().keys({
    mail: Joi.string().email().min(3).max(60).required()
        .description('Mail address'),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
});

validations.register = Joi.object().keys({
    mail: Joi.string().email().min(3).max(60).required()
        .description('Mail address'),
    password: Joi.string().regex(/[a-zA-Z0-9@#$%_&!"§\/\(\)=\?\^]{3,30}/).required()
        .description('User set password'),
    name: Joi.string().required().description('User name'),
    residence: Joi.string().required().description('User residence')
});

module.exports = validations;