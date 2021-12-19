const lblNuevoTicket = document.querySelector("#lblNuevoTicket")
const btnCrear = document.querySelector("#btnCrear")


const socket = io()


socket.on('connect', () => {
    btnCrear.disable = false
})

socket.on('disconnect', () => {
    btnCrear.disable = true
})

socket.on('last-ticket', (lastTicket) => {
    lblNuevoTicket.innerText = `Último Ticket: ${lastTicket}`
})

btnCrear.addEventListener('click', () => {
    socket.emit('next-ticket', null, (ticket) => {
        lblNuevoTicket.innerText = ticket
    })
})