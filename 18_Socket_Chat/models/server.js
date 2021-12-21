require('colors')
require('dotenv').config()

const http = require('http')
const express = require('express')
const socketIO = require('socket.io')
const cors = require('cors')
const { socketsController } = require('../sockets/sockets.controller')


class Server {
    constructor() {
        this.app = express()
        this.PORT = process.env.PORT || 8888
        this.server = http.createServer(this.app)
        this.io = socketIO(this.server)
        this.middlewares()
        this.sockets()
    }

    middlewares() {
        this.app.use(cors())
        this.app.use(express.static('public'))
    }

    sockets(){
        this.io.on('connection', (socket) => socketsController(socket, this.io))
    }

    listen() {
        this.server.listen(this.PORT, (error) => {
            if (error) throw new Error(error)
            console.log('Aplicación corriendo en el puerto'.green, `${this.PORT}`.green.underline.italic)
            console.log(`Servido en local como http://localhost:${this.PORT}`.italic.cyan)
        })
    }
}


module.exports = Server