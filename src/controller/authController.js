import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import db from '../config/database.js'
import { userSchema } from "../model/userSchema.js"


export async function signUp (req, res) {
    const { name, email, password, confirmPassword } = req.body
    
    const { error } = userSchema.validate({ name, email, password, confirmPassword}, {abortEarly: false})
    if (error) {
        const errorMessage = error.details.map(err => err.message)
        return res.status(422).send(errorMessage)
    }

    const hashedPassword = bcrypt.hashSync(password, 10)

    try {
        await db.collection("usuarios").insertOne({ name, email, password: hashedPassword })
        res.status(201).send("Usuário cadastrado com sucesso!")
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export async function signIn (req, res) {
    const { email, password } = req.body

    try {
        const checkUser = await db.collection("usuarios").findOne({ email })
        const correctPassword = bcrypt.compareSync(password, checkUser.password)
        if (checkUser && correctPassword){
            const token = uuid()
            await db.collection("sessoes").insertOne({
                userId: userSchema.$_validate,
                token
            })
            res.send(token)
        } else {
            return res.status(400).send("Usuário ou senha não encontrados.")
        }
    } catch (error) {
        return res.status(500).send(error.message)
    }
}