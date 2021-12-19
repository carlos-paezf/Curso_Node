const TicketControl = require("../models/ticket-control")

const ticketControl = new TicketControl()


const socketController = (socket) => {
    socket.emit('last-ticket', ticketControl.latest)
    socket.emit('last-four', ticketControl.last4)
    socket.emit('pending-tickets', ticketControl.tickets.length)

    socket.on('next-ticket', (_, callback) => {
        const next = ticketControl.next()
        callback(next)
        socket.broadcast.emit('pending-tickets', ticketControl.tickets.length)
    })

    socket.on('serve-client', ({ desk }, callback) => {
        if (!desk) {
            return callback({
                ok: false,
                msg: 'El escritorio es obligatorio'
            })
        }

        const ticket = ticketControl.serveTicket(desk)

        socket.broadcast.emit('last-four', ticketControl.last4)
        socket.emit('pending-tickets', ticketControl.tickets.length)
        socket.broadcast.emit('pending-tickets', ticketControl.tickets.length)


        if (!ticket) {
            callback({
                ok: false,
                msg: 'Ya no hay tickets pendientes'
            })
        } else {
            callback({
                ok: true,
                ticket
            })
        }
    })
}


module.exports = {
    socketController
}