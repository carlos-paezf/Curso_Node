let user = null
let socket = null


const txtUid = document.querySelector('#txtUid')
const txtMessage = document.querySelector('#txtMessage')
const ulUsers = document.querySelector('#ulUsers')
const ulChat = document.querySelector('#ulChat')
const btnLogout = document.querySelector('#btnLogout')


const url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/'
    : 'https://restserver-nodejs-mongo.herokuapp.com/api/auth/'


const validateJWT = async () => {
    const token = localStorage.getItem('token') || ''
    if (token.length <= 10) {
        window.location = 'index.html'
        throw new Error('Np hay token en el servidor')
    }
    const res = await fetch(url, {
        headers: { 'x-token': token }
    })
    const { userAuth: userDB, token: tokenDB } = await res.json()
    localStorage.setItem('token', tokenDB)
    user = userDB
    document.title = user.name

    await connectSocket()
}


const connectSocket = async () => {
    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    })

    socket.on('receive-message', showMessages)

    socket.on('active-users', showUsers)

    socket.on('private-message', console.log)
}


const showUsers = (users = []) => {
    let usersHtml = ''
    users.forEach(({ name, uid }) => {
        usersHtml += `
        <li>
            <p>
                <h5 class="text-success">${name}</h5>
                <span class="fs-6 text-muted">${uid}</span>
            </p>
        </li>
        `
    })
    ulUsers.innerHTML = usersHtml
}

const showMessages = (messages = []) => {
    let messagesHtml = ''
    messages.forEach(({ name, message }) => {
        messagesHtml += `
        <li>
            <p>
            <span class="text-primary">${name}</span>
            <span>${message}</span>
            </p>
        </li>
        `
    })
    ulChat.innerHTML = messagesHtml
}


txtMessage.addEventListener('keyup', ({ keyCode }) => {
    const message = txtMessage.value
    const uid = txtUid.value

    if (keyCode !== 13) return
    if (message.length === 0 && message.trim().length === 0) return
    socket.emit('send-message', { uid, message })
    txtMessage.value = ''
})


const main = async () => await validateJWT()
main()


// const socket = io()