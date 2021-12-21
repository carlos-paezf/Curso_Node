const socket = io()

var params = new URLSearchParams(window.location.search)
if (!params.has('name') || !params.has('room')) {
    window.location = 'index.html'
    throw new Error('Los campos son necesarios')
}

const user = {
    name: params.get('name'),
    room: params.get('room')
}


socket.on('connect', () => {
    console.log('Usuario conectado al servidor')

    socket.emit('enter-chat', user, (res) => {
        renderUsers(res)
    })
})


socket.on('disconnect', () => {
    console.log('Usuario desconectado')
})


socket.on('show-alert', (alert) => {
    renderMessage(alert, false)
    scrollBottom()
})

socket.on('users-online', (usersOnline) => {
    renderUsers(usersOnline)
})


socket.on('send-message', (message) => {
    renderMessage(message, false)
    scrollBottom()
})


socket.on('private-message', (message) => {
    console.log('Mensaje privado: ', message)
})