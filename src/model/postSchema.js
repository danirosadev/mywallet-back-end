import Joi from "joi"

export const postSchema = Joi.object({
    value: Joi.string().required(),
    description: Joi.string().required()
})