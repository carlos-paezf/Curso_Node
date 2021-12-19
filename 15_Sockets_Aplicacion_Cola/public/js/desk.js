const lblEscritorio = document.querySelector('#lblEscritorio')
const lblTicket = document.querySelector('#lblTicket')
const btnNext = document.querySelector('#btnNext')
const divAlert = document.querySelector('.alert')
const lblPendientes = document.querySelector('#lblPendientes')


const searchParams = new URLSearchParams(window.location.search)


if (!searchParams.has('escritorio')) {
    window.location = 'index.html'
    throw new Error('El escritorio es obligatorio')
}

const desk = searchParams.get('escritorio')
lblEscritorio.innerHTML = `Escritorio: ${desk}`
divAlert.style.display = 'none'


const socket = io()


socket.on('connect', () => {
    btnNext.disable = false
})

socket.on('disconnect', () => {
    btnNext.disable = true
})

socket.on('pending-tickets', (pendings) => {
    lblPendientes.innerText = pendings
})

btnNext.addEventListener('click', () => {
    socket.emit('serve-client', { desk }, ({ ok, msg, ticket }) => {
        if (!ok) {
            lblTicket.innerText = `Nadie`
            return divAlert.style.display = ''
        }
        lblTicket.innerText = `Ticket ${ticket.number}`
    })
})