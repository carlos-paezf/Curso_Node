"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const colors_1 = __importDefault(require("colors"));
const cors_1 = __importDefault(require("cors"));
const users_routes_1 = __importDefault(require("../routes/users.routes"));
const connection_1 = __importDefault(require("../db/connection"));
class Server {
    constructor() {
        this.paths = {
            users: '/api/users'
        };
        this.dbConnection = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield connection_1.default.authenticate();
                console.log(colors_1.default.blue.italic('Base de datos conectada'));
            }
            catch (error) {
                console.log(colors_1.default.red.bold('Error en la DB: '));
                throw new Error(error);
            }
        });
        this.middlewares = () => {
            this.app.use((0, cors_1.default)());
            this.app.use(express_1.default.json());
            this.app.use(express_1.default.static('public'));
        };
        this.routes = () => {
            this.app.use(this.paths.users, users_routes_1.default);
        };
        this.listen = () => {
            this.app.listen(this.PORT, () => {
                console.log(colors_1.default.green(`Servidor corriendo en: http://localhost:${this.PORT}`));
            });
        };
        this.app = (0, express_1.default)();
        this.PORT = process.env.PORT || '8080';
        this.dbConnection();
        this.middlewares();
        this.routes();
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map