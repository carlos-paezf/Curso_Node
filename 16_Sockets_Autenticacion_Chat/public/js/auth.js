const url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/'
    : 'https://restserver-nodejs-mongo.herokuapp.com/api/auth/'


function handleCredentialResponse(response) {
    const body = { id_token: response.credential }

    fetch(url + 'google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(({ user, token }) => {
            localStorage.setItem('email', user.email)
            localStorage.setItem('token', token)
            window.location = `chat.html`
        })
        .catch(console.warn)
}


const button = document.getElementById('google_signout')
button.onclick = () => {
    google.accounts.id.disableAutoSelect()
    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear()
        location.reload()
    })
}


const formLogin = document.querySelector('form')
formLogin.addEventListener('submit', e => {
    e.preventDefault()
    const formData = {}

    for (let element of formLogin.elements) {
        if (element.name.length > 0) formData[element.name] = element.value
    }
    fetch(url + 'login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(({ msg, token }) => {
            if (msg !== 'Login ok') return console.log(msg)
            localStorage.setItem('token', token)
            window.location = `chat.html`
        })
        .catch(console.warn)
})