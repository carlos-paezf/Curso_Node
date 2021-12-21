const { createMessage } = require("../helpers/sockets-utils")
const Users = require("../models/users")


const users = new Users()


const socketsController = (socket, io) => {
    socket.on('enter-chat', ({ name, room }, callback) => {
        if (!name || name.trim().length === 0 || !room || room.trim().length === 0) {
            return callback({
                error: true,
                msg: 'Todos los datos son necesarios'
            })
        }

        socket.join(room)
        users.connectUser(socket.id, name, room)

        socket.broadcast.to(room).emit('show-alert', createMessage(
            'Administrador', `${name} se unió al chat`
        ))
        socket.broadcast.to(room).emit('users-online', users.getUsersByRoom(room))

        callback(users.getUsersByRoom(room))
    })


    socket.on('send-message', (data, callback) => {
        let { name, room } = users.getUserByID(socket.id)
        let message = createMessage(name, data)
        socket.broadcast.to(room).emit('send-message', message)

        callback(message)
    })


    socket.on('private-message', ({ to, message }) => {
        let { name } = users.getUserByID(socket.id)
        socket.broadcast.to(to).emit('private-message', createMessage(name, message))
    })


    socket.on('disconnect', () => {
        let { name, room } = users.disconnectUser(socket.id)
        socket.broadcast.to(room).emit('show-alert', createMessage(
            'Administrador', `${name} abandonó el chat`
        ))
        socket.broadcast.to(room).emit('users-online', users.getUsersByRoom(room))
    })
}


module.exports = {
    socketsController
}