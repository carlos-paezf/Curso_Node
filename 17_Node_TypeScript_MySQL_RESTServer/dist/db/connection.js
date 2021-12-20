"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
dotenv_1.default.config();
const DATABASE = process.env.DATABASE || '';
const USER_DB = process.env.USER_DB || '';
const PASSWORD_DB = process.env.PASSWORD_DB || '';
const HOST = process.env.HOST_DB || '';
const db = new sequelize_1.Sequelize(DATABASE, USER_DB, PASSWORD_DB, {
    host: HOST,
    dialect: 'mysql',
    // logging: false
});
exports.default = db;
//# sourceMappingURL=connection.js.map