import express, { Application } from 'express'
import colors from 'colors'
import cors from 'cors'

import userRouter from '../routes/users.routes'
import db from '../db/connection'


class Server {
    private app: Application
    private PORT: string
    private paths = {
        users: '/api/users'
    }

    constructor() {
        this.app = express()
        this.PORT = process.env.PORT || '8080'
        this.dbConnection()
        this.middlewares()
        this.routes()
    }

    dbConnection = async () => {
        try {
            await db.authenticate()
            console.log(colors.blue.italic('Base de datos conectada'))
        } catch (error) {
            console.log(colors.red.bold('Error en la DB: '))
            throw new Error(error)
        }
    }

    middlewares = () => {
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.static('public'))
    }

    routes = () => {
        this.app.use(this.paths.users, userRouter)
    }

    listen = () => {
        this.app.listen(this.PORT, () => {
            console.log(colors.green(`Servidor corriendo en: http://localhost:${this.PORT}`))
        })
    }
}


export default Server