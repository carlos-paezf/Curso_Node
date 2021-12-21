var params = new URLSearchParams(window.location.search)

const userName = params.get('name')
const room = params.get('room')


var divUsers = $('#divUsuarios')
let formSend = $('#formSend')
let txtMessage = $('#txtMessage')
let divChatbox = $('#divChatbox')


const renderUsers = (users) => {
    var html = '';

    html += `<li>
        <a href="javascript:void(0)" class="active"> Chat de <span>${params.get('room')}</span></a>
    </li>`

    for (let i = 0; i < users.length; i++) {
        html += `<li>
            <a data-id="${users[i].id}" href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>${users[i].name}<small class="text-success">online</small></span></a>
        </li >`
    }

    divUsers.html(html);
}


const renderMessage = ({ from, message, date }, author) => {
    let html = ''
    let dateMessage = new Date(date)
    let time = dateMessage.getHours() + ':' + dateMessage.getMinutes()

    let adminClass = 'info'
    if (from === 'Administrador') adminClass = 'danger'

    !author
        ? html +=
        `<li class="animated fadeIn">
            ${from !== 'Administrador' ? `<div class="chat-img"><img src="assets/images/users/1.jpg" alt="user"/></div>` : ''}
                <div class="chat-content">
                    <h5>${from} </h5>
                    <div class="box bg-light-${adminClass}">${message}</div>
                </div>
                <div class="chat-time">${time}</div>
            </li>`
        : html +=
        `<li class="reverse">
                <div class="chat-content">
                    <h5>${from}</h5>
                    <div class="box bg-light-inverse">${message}</div>
                </div>
                <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" />
                </div>
                <div class="chat-time">${time}</div>
            </li>`

    divChatbox.append(html)
}


const scrollBottom = () => {
    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}


divUsers.on('click', 'a', function () {
    let id = $(this).data('id')
    if (!id) return
    console.log(id)
})

formSend.on('submit', function (e) {
    e.preventDefault()
    if (txtMessage.val().trim().length === 0) return

    socket.emit('send-message', txtMessage.val(), (message) => {
        txtMessage.val('').focus()
        renderMessage(message, true)
    })

    socket.on('show-alert', (alert) => {
        renderMessage(alert, false)
    })

    scrollBottom()
})