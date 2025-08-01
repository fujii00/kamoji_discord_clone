import joi from "joi"

export const productPostSchema = joi.object({
    name: joi.string().min(3).max(20).required(),
    category: joi.number().integer().min(1).required(),
    price: joi.number().required(),
    description: joi.string().optional()
})