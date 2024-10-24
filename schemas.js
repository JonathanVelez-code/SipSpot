const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.coffeeshopSchema = Joi.object({
    coffeeshop: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    products: Joi.array().items(
        Joi.object({
            name: Joi.string().required().escapeHTML(),
            imageUrl: Joi.string().uri().required().escapeHTML(),
            price: Joi.string().required().escapeHTML(),
            weight: Joi.string().optional().escapeHTML(),
            roast: Joi.string().optional().escapeHTML(),
        })
    ).required(),
    deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required()
});