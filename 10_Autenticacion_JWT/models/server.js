require('dotenv').config()

const express = require('express')
const cors = require('cors')
const ConfigDB = require('../database/config.db')

const db = new ConfigDB()


class Server {
    constructor() {
        this.app = express()
        this.PORT = process.env.PORT
        this.usersPath = '/api/users'
        this.authPath = '/api/auth'
        this.connectDB()
        this.middlewares()
        this.routes()
    }

    async connectDB() {
        await db.dbConnection()
    }

    middlewares() {
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.static('public'))
    }

    routes() {
        this.app.use(this.authPath, require('../routes/auth.routes'))
        this.app.use(this.usersPath, require('../routes/user.routes'))
    }

    listen() {
        this.app.listen(this.PORT, () => {
            console.log(`Aplicación corriendo en http://localhost:${this.PORT}`);
        })
    }
}


module.exports = Server