import Joi from 'joi';

const channelSchema = Joi.object({
    name: Joi.string().max(45).required(),
    subject: Joi.string().max(25).allow(null, ''),
    statut: Joi.string().valid('active', 'inactive', 'archived', 'restricted')
               .default('active'),
    is_voice: Joi.boolean().default(false),
    is_text: Joi.boolean().default(true),
    position: Joi.number().integer().min(0).default(0),// Pour l'association avec le serveur
});

const channelUpdateSchema = channelSchema.keys({
    name: Joi.string().max(45),
    server_id: Joi.number().integer() // Rendre optionnel pour les mises à jour
}).min(1); // Au moins un champ doit être fourni pour les mises à jour

// Schéma pour le changement de statut
const channelStatusSchema = Joi.object({
    statut: Joi.string().valid('active', 'inactive', 'archived', 'restricted').required()
});

// Schéma pour le changement de position
const channelPositionSchema = Joi.object({
    position: Joi.number().integer().min(0).required()
});

// Schéma pour le type de channel
const channelTypeSchema = Joi.object({
    is_voice: Joi.boolean().required(),
    is_text: Joi.boolean().required()
}).or('is_voice', 'is_text'); // Au moins un des deux doit être fourni

export {
    channelSchema,
    channelUpdateSchema,
    channelStatusSchema,
    channelPositionSchema,
    channelTypeSchema
};