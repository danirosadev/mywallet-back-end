import db from '../config/database.js'
import { postSchema } from "../model/postSchema.js"

export async function postEntry (req, res) {
    const { value, description } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.status(422).send("Informe o token.")

    const validation = postSchema.validate({value, description})
    if (validation.error){
        const err = validation.error.details.map((e) => {
            return e.message
        })
        return res.status(422).send(err)
    }

    try {
        const checkSession = await db.collection("sessoes").findOne({ token })
        if (!checkSession) return res.status(401).send("Você não tem autorização para cadastrar valores aqui.")
        await db.collection("entradas").insertOne({ value, description })
        res.status(201).send("Entrada registrada com sucesso")
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export async function getEntry (req, res) {
    try {
        const entrys =  await db.collection("entradas").find({}).toArray()
        res.send(entrys)
    } catch (error) {
        res.status(500).send(error.message)
    }
}