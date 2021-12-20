import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()


const DATABASE = process.env.DATABASE || ''
const USER_DB = process.env.USER_DB || ''
const PASSWORD_DB = process.env.PASSWORD_DB || ''
const HOST = process.env.HOST_DB || ''


const db = new Sequelize(DATABASE, USER_DB, PASSWORD_DB, {
    host: HOST,
    dialect: 'mysql',
    // logging: false
})


export default db