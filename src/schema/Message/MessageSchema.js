// import Joi from 'joi';

// const messageSchema = Joi.object({
//     content: Joi.string().min(1).max(5000).required(), // TEXT equivalent with reasonable limits
//     is_pinned: Joi.boolean().default(false),
//     sender: Joi.number().integer().required(), // User ID
//     channel: Joi.number().integer().allow(null), // Channel ID (optional)
//     server: Joi.number().integer().allow(null), // Server ID (optional)
//     receiver: Joi.number().integer().allow(null), // User ID for DMs (optional)
//     reply: Joi.number().integer().allow(null) // Message ID for replies (optional)
// }).or('channel', 'server', 'receiver'); // Must have at least one destination

// const messageUpdateSchema = Joi.object({
//     content: Joi.string().min(1).max(5000),
//     is_pinned: Joi.boolean()
// }).min(1); // At least one field required for update

// const messagePinSchema = Joi.object({
//     is_pinned: Joi.boolean().required()
// });

// const messageReplySchema = Joi.object({
//     content: Joi.string().min(1).max(5000).required(),
//     reply: Joi.number().integer().required() // Parent message ID
// });

// const messageDestinationSchema = Joi.object({
//     channel: Joi.number().integer().when('server', { 
//         is: Joi.exist(), 
//         then: Joi.required(), 
//         otherwise: Joi.optional() 
//     }),
//     server: Joi.number().integer().when('channel', { 
//         is: Joi.exist(), 
//         then: Joi.required(), 
//         otherwise: Joi.optional() 
//     }),
//     receiver: Joi.number().integer()
// }).xor('channel', 'receiver'); // Either channel or receiver, not both

// export {
//     messageSchema,
//     messageUpdateSchema,
//     messagePinSchema,
//     messageReplySchema,
//     messageDestinationSchema
// };