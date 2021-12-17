const socketController = (socket) => {
    console.log(`Client conectado:`.blue, socket.id)

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado:`.cyan, socket.id)
    })

    socket.on('send-message', (payload, callback) => {
        console.log(`Mensaje recibido en el servidor:`.italic)
        console.log(payload)
        socket.broadcast.emit('send-message', payload)

        const id = 123456
        callback(id)
    })
}


module.exports = {
    socketController
}