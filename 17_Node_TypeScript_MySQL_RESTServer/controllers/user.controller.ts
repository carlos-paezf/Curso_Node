import { Request, Response } from 'express'
import User from '../models/user'


export const getUsers = async (req: Request, res: Response) => {
    const { from = 0, limit = 10 } = req.query

    const [totalUsers, users] = await Promise.all([
        User.count({
            where: { 'status': 1 }
        }),
        User.findAll({
            offset: Number(from),
            limit: Number(limit),
            where: { 'status': 1 },
        })
    ])

    res.json({ total: totalUsers, from, limit, users })
}


export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await User.findByPk(id)

    if (!user) {
        return res.status(400).json({ msg: `No existe un usuario con el id ${id}` })
    }

    if (!user.status) {
        return res.status(400).json({ msg: `No existe un usuario con el id ${id} - status` })
    }

    res.json({ user })
}


export const postUser = async (req: Request, res: Response) => {
    const { name, email } = req.body

    try {
        if (!name || !email) return res.status(400).json({
            msg: 'Envie todos los datos'
        })

        if (name.trim().length === 0 || email.trim().length === 0) {
            return res.status(400).json({
                msg: 'Por favor complete todos los campos'
            })
        }

        const emailExists = await User.findOne({
            where: { email }
        })

        if (emailExists) return res.status(400).json({
            msg: 'Este email ya está registrado'
        })

        const user = await User.create({
            name,
            email
        })
        res.json({ user })
    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ msg: 'Hable con el administrador' })
    }
}


export const putUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, email } = req.body

    try {
        const user = await User.findByPk(id)

        if (!user) return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`
        })

        if (!user.status) return res.status(400).json({
            msg: `No existe un usuario con el id ${id} - status`
        })

        const emailExists = await User.findOne({
            where: { email }
        })

        if (emailExists) return res.status(400).json({
            msg: 'Este email ya está registrado'
        })

        await user.update({
            name,
            email
        })

        return res.json({ user })
    } catch (error) {
        console.log('Error', error)
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
}


export const partialDeleteUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const user = await User.findByPk(id)

        if (!user) return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`
        })

        await user.update({
            status: false
        })

        res.json({
            user
        })
    } catch (error) {
        console.log('Error', error)
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
}


export const totalDeleteUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const user = await User.findByPk(id)

        if (!user) return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`
        })

        await user.destroy()
        res.json({
            msg: 'Usuario eliminado totalmente de la base de datos',
        })
    } catch (error) {
        console.log('Error', error)
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
}