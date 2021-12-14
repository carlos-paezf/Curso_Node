const { response } = require("express")


const validateAdminRole = (req, res = response, next) => {
    if (!req.userAuth) return res.status(500).json({ msg: "Validando rol sin verificar el token" })
    
    const { role, name } = req.userAuth

    if (role !== 'ADMIN_ROLE') return res.status(401).json({ msg: `El usuario ${name} no es adminstrador` })

    next()
}


const hasRole = (...roles) => {
    return (req, res = response, next) => {
        if (!req.userAuth) return res.status(500).json({ msg: "Validando rol sin verificar el token" })
        if (!roles.includes(req.userAuth.role)) return res.status(401).json({ msg: `El servicio requiere uno de esto roles: ${roles}` })
        next()
    }
}


module.exports = {
    validateAdminRole,
    hasRole
}