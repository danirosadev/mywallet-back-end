import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'
import db from '../config/database.js'
import { postSchema } from "../model/postSchema.js"

export async function postOutput (req, res) {
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
        await db.collection("saidas").insertOne({ value, description })
        res.status(201).send("Saída registrada com sucesso")
    } catch (error) {
        res.status(500).send(error.message)
    }
}

export async function getOutput (req, res) {
    try {
        const outputs =  await db.collection("saidas").find({}).toArray()
        res.send(outputs)
    } catch (error) {
        res.status(500).send(error.message)
    }
}