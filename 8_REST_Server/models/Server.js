require('dotenv').config()

const express = require('express')
const cors = require('cors')


class Server {
    constructor() {
        this.app = express()
        this.PORT = process.env.PORT
        this.usersPath = '/api/users'
        this.middlewares()
        this.routes()
    }

    middlewares() {
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.static('public'))
    }

    routes() {
        this.app.use(this.usersPath, require('../routes/user.routes'))
    }

    listen() {
        this.app.listen(this.PORT, () => {
            console.log(`Aplicación corriendo en http://localhost:${this.PORT}`);
        })
    }
}


module.exports = Server