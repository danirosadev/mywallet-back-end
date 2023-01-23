import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import Joi from "joi"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import { v4 as uuid } from 'uuid';

dotenv.config()
const token = uuid();

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

try {
    await mongoClient.connect()
    console.log('MongoDB Connected!')
    db = mongoClient.db()
} catch (err) {
    console.log(err.message)
}

const app = express()

app.use(express.json())
app.use(cors())

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required()
})

const postSchema = Joi.object({
    value: Joi.string().required(),
    description: Joi.string().required()
})

app.post("/sign-up", async (req, res) => {
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
})

app.post("/sign-in", async (req, res) => {
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
})

app.post("/entry", async (req, res) => {
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
})

app.get("/entry", async (req, res) => {
    try {
        const entrys =  await db.collection("entradas").find({}).toArray()
        res.send(entrys)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

app.post("/output", async (req, res) => {
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
})

app.get("/output", async (req, res) => {
    try {
        const outputs =  await db.collection("saidas").find({}).toArray()
        res.send(outputs)
    } catch (error) {
        res.status(500).send(error.message)
    }
})


const PORT = 5000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
}) 