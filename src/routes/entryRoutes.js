import { Router } from "express"
import {postEntry, getEntry } from "../controller/entryController.js"

const entryRouter = Router()

entryRouter.post("/entry", postEntry)
entryRouter.get("/entry", getEntry)

export default entryRouter