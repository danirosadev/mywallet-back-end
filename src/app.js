import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import Joi from "joi"
import dotenv from "dotenv"
dotenv.config()

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

app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body

    try {
        await db.collection("usuarios").insertOne({ name, email, password })
        res.status(201).send("Usuário cadastrado com sucesso!")
    } catch (error) {
        res.status(500).send(error.message)
    }
})

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body

    try {
        const checkUser = await db.collection("usuarios").findOne({ email })
        if (!checkUser) return res.status(400).send("Usuário ou senha incorretos.")
        if (password !== checkUser.password) return res.status(400).send("Usuário ou senha incorretos.")

        return res.status(200).send("Você logou com sucesso")
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// app.post("/new-entry", async (req, res) => {
    
// })

// app.get("/entry", async (req, res) => {
    
// })

// app.post("/output", async (req, res) => {
    
// })

// app.post("/output", async (req, res) => {
    
// })


const PORT = 5000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
}) 