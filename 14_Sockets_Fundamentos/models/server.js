require('dotenv').config()
require('colors')

const http = require('http')
const express = require('express')
const cors = require('cors')


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
        this.io.on('connection', socket => {
            console.log(`Client conectado:`.blue, socket.id)

            socket.on('disconnect', () => {
                console.log(`Cliente desconectado:`.cyan, socket.id)
            })

            socket.on('send-message', (payload) => {
                console.log(`Mensaje recibido en el servidor:`.italic)
                console.log(payload)
            })
        })
    }

    listen = () => {
        this.server.listen(this.PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${this.PORT}/`.green)
        })
    }
}


module.exports = Server