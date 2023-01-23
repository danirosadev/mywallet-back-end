import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import entryRoutes from "./routes/entryRoutes.js"
import outputRoutes from "./routes/outputRoutes.js"

const app = express()

app.use(express.json())
app.use(cors())

app.use([authRoutes, entryRoutes, outputRoutes])

const PORT = 5000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
}) 