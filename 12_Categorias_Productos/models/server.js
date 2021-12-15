require('dotenv').config()

const express = require('express')
const cors = require('cors')
const ConfigDB = require('../database/config.db')

const db = new ConfigDB()


class Server {
    constructor() {
        this.app = express()
        this.PORT = process.env.PORT
        this.paths = {
            auth: '/api/auth',
            users: '/api/users',
            categories: '/api/categories',
            products: '/api/products',
            search: '/api/search',
        }
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
        this.app.use(this.paths.auth, require('../routes/auth.routes'))
        this.app.use(this.paths.users, require('../routes/user.routes'))
        this.app.use(this.paths.categories, require('../routes/categories.routes'))
        this.app.use(this.paths.products, require('../routes/products.routes'))
        this.app.use(this.paths.search, require('../routes/search.routes'))
    }

    listen() {
        this.app.listen(this.PORT, () => {
            console.log(`Aplicación corriendo en http://localhost:${this.PORT}`);
        })
    }
}


module.exports = Server