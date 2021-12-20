const { Socket } = require("socket.io");
const { verifyJWT } = require("../helpers");
const { ChatMessages } = require("../models");


const chatMessages = new ChatMessages();


const socketController = async (socket = new Socket(), io) => {
    const user = await verifyJWT(socket.handshake.headers['x-token'])
    if (!user) return socket.disconnect()

    chatMessages.connectUser(user)
    socket.join(user.id)
    io.emit('receive-message', chatMessages.last10)
    socket.emit('active-users', chatMessages.usersArr)
    
    socket.on('disconnect', () => {
        chatMessages.disconnectUser(user.id)
        io.emit('active-users', chatMessages.usersArr)
    })

    socket.on('send-message', ({ uid, message }) => {
        if (uid) {
            socket.to(uid).emit('private-message', { from: user.name, message })
            socket.emit('private-message', { from: user.name, message })
        } else {
            chatMessages.sendMessage(user.id, user.name, message)
            io.emit('receive-message', chatMessages.last10)
        }
    })
}


module.exports = {
    socketController
}