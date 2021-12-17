const lblOnline = document.querySelector('#lblOnline')
const lblOffline = document.querySelector('#lblOffline')

const txtMessage = document.querySelector('#txtMessage')
const btnSend = document.querySelector('#btnSend')


const socket = io()


socket.on('connect', () => {
    console.log('Conectado')
    lblOffline.style.display = 'none'
    lblOnline.style.display = ''
})

socket.on('disconnect', () => {
    console.log('Desconectado del servidor')
    lblOnline.style.display = 'none'
    lblOffline.style.display = ''
})


btnSend.addEventListener('click', () => {
    const message = txtMessage.value
    const payload = {
        message,
        id: '1234',
        fecha:  new Date()
    }
    socket.emit('send-message', payload)
})