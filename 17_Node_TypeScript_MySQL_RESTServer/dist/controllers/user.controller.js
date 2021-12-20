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
exports.totalDeleteUser = exports.partialDeleteUser = exports.putUser = exports.postUser = exports.getUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from = 0, limit = 10 } = req.query;
    const [totalUsers, users] = yield Promise.all([
        user_1.default.count({
            where: { 'status': 1 }
        }),
        user_1.default.findAll({
            offset: Number(from),
            limit: Number(limit),
            where: { 'status': 1 },
        })
    ]);
    res.json({ total: totalUsers, from, limit, users });
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_1.default.findByPk(id);
    if (!user) {
        return res.status(400).json({ msg: `No existe un usuario con el id ${id}` });
    }
    if (!user.status) {
        return res.status(400).json({ msg: `No existe un usuario con el id ${id} - status` });
    }
    res.json({ user });
});
exports.getUser = getUser;
const postUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    try {
        if (!name || !email)
            return res.status(400).json({
                msg: 'Envie todos los datos'
            });
        if (name.trim().length === 0 || email.trim().length === 0) {
            return res.status(400).json({
                msg: 'Por favor complete todos los campos'
            });
        }
        const emailExists = yield user_1.default.findOne({
            where: { email }
        });
        if (emailExists)
            return res.status(400).json({
                msg: 'Este email ya está registrado'
            });
        const user = yield user_1.default.create({
            name,
            email
        });
        res.json({ user });
    }
    catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ msg: 'Hable con el administrador' });
    }
});
exports.postUser = postUser;
const putUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        const user = yield user_1.default.findByPk(id);
        if (!user)
            return res.status(400).json({
                msg: `No existe un usuario con el id ${id}`
            });
        if (!user.status)
            return res.status(400).json({
                msg: `No existe un usuario con el id ${id} - status`
            });
        const emailExists = yield user_1.default.findOne({
            where: { email }
        });
        if (emailExists)
            return res.status(400).json({
                msg: 'Este email ya está registrado'
            });
        yield user.update({
            name,
            email
        });
        return res.json({ user });
    }
    catch (error) {
        console.log('Error', error);
        return res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
});
exports.putUser = putUser;
const partialDeleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield user_1.default.findByPk(id);
        if (!user)
            return res.status(400).json({
                msg: `No existe un usuario con el id ${id}`
            });
        yield user.update({
            status: false
        });
        res.json({
            user
        });
    }
    catch (error) {
        console.log('Error', error);
        return res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
});
exports.partialDeleteUser = partialDeleteUser;
const totalDeleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield user_1.default.findByPk(id);
        if (!user)
            return res.status(400).json({
                msg: `No existe un usuario con el id ${id}`
            });
        yield user.destroy();
        res.json({
            msg: 'Usuario eliminado totalmente de la base de datos',
        });
    }
    catch (error) {
        console.log('Error', error);
        return res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
});
exports.totalDeleteUser = totalDeleteUser;
//# sourceMappingURL=user.controller.js.map