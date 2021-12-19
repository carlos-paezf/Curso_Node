require('dotenv').config()
require('colors')

const http = require('http')
const express = require('express')
const cors = require('cors')
const { socketController } = require('../sockets/controller')


class Server {
    constructor() {
        this.app = express()
        this.PORT = process.env.PORT
        this.server = http.createServer(this.app)
        this.io = require('socket.io')(this.server)
        this.paths = {}
        this.middlewares()
        this.routes()
        this.sockets()
    }

    middlewares = () => {
        this.app.use(cors())
        this.app.use(express.static('public'))
    }

    routes = () => { }

    sockets = () => {
        this.io.on('connection', socketController)
    }

    listen = () => {
        this.server.listen(this.PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${this.PORT}/`.green)
        })
    }
}


module.exports = Server