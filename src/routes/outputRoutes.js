import { Router } from "express"
import {postOutput, getOutput } from "../controller/outputController.js"

const outputRouter = Router()

outputRouter.post("/output", postOutput)
outputRouter.get("/output", getOutput)

export default outputRouter