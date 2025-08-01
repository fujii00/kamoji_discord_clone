import Joi from 'joi';

const serverSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    icon: Joi.string().uri().allow(null, ''),
    category: Joi.string().max(50).allow(null, ''),
    bio: Joi.string().max(2000).allow(null, ''),
    interest: Joi.string().max(100).allow(null, ''),
    is_verify: Joi.boolean().default(false),
    icon_banner: Joi.string().uri().allow(null, ''),
    members: Joi.number().integer().min(0).default(0),
    status_member: Joi.string().valid('public', 'private', 'restricted').default('public'),
    link: Joi.string().uri().allow(null, ''),
    user_id: Joi.number().integer().required()
});

const serverUpdateSchema = serverSchema.keys({
    title: Joi.string().min(3).max(100),
    user_id: Joi.number().integer() // Rendre optionnel pour les mises à jour
}).min(1); // Au moins un champ doit être fourni pour les mises à jour

export {
    serverSchema,
    serverUpdateSchema
};