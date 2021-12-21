# Sección 19: Socket Chat

Aquí cubriremos varios temas como:

- Comunicación entre usuarios
- Comunicación entre 1 a muchos
- Comunicación 1 a 1
- Comunicación entre salas de chat
- Diseño del chat
- Diseño del login
- Notificaciones de entrada de usuarios y salida de usuarios

El objetivo es crear una aplicación de chat completa

## Inicio del proyecto

Instalamos los paquete de la aplicación provista en el curso, mediante el comando `npm install`. Además se reestructuro el proyecto para manejarlo mediante el patron MVC, teniendo como modelo al `Server`, como vista los archivos de la carpeta `public` y como controlador el controller de los sockets. Para ejecutar el proyecto se usa el comando `node app` o `nodemon app` durante el desarrollo.

## Clase para controlar los usuarios del chat

Creamos un archivo llamado `server/classes/users.js` con el que vamos a manejar el modelo de usuarios. Lo primero es tener un arreglo con todos los usuarios que están conectados. Para conectar un usuario requerimos de su id y de su nombre, luego creamos un objeto que almacene dicha información y lo agregamos a la lista de usuarios. Tambien tenemos un método para obtener un usuario por si id, con el cual filtramos la lista y retornamos el user que tenga dicho identificador. El método para obtener todos los usuarios retorna la lista de objetos de usuarios. Por último, para cuando se desconecte un usuario, creamos una variable que va a retornar el usuario que se desconectó y lo sacamos de la lista general de usuarios.

```js
class Users {
    constructor() {
        this.users = []
    }

    get allUsersOnline() {
        return this.users
    }

    getUserByID(id) {
        return this.users.filter(user => user.id === id)[0]
    }

    get usersByRoom() {
        // TODO
    }
    
    connectUser(id, name) {
        this.users.push({id, name})
        return this.users
    }

    disconnectUser(id) {
        const userDisconnect = this.getUserByID(id)
        this.users = this.users.filter(user => user.id !== id)
        return userDisconnect
    }
}


module.exports = Users
```

## Front-End: Conectar un usuario

Tenemos un archivo llamado `public/chat.html` que hace la importación del script de `socket.io.js` y también del socket-client para administrarlo. Dentro del último script que se en encuentra en el archivo `public/js/socket-chat.js`, obtenemos por parámetros de la URL el nombre del usuario para crear un objeto con el mismo y de esa manera emitirlo luego en un evento.

```js
const params = new URLSearchParams(window.location.search)
if (!params.has('name')) {
    window.location = 'index.html'
    throw new Error('El nombre es necesario')
}

const user = {
    name: params.get('name')
}
```

El evento `enter-chat` se emite cada que se conecta, enviando el objeto con su nombre y otras propiedades futuras, e imprime la respuesta que le regresa el servidor.

```js
socket.on('connect', () => {
    console.log('Usuario conectado al servidor')

    socket.emit('enter-chat', user, (res) => {
        console.log(res)
    })
})
```

Cuando el servidor escucha el evento anterior, recibe un payload y también un callback. Del payload desestructuramos el nombre y validamos que se ingrese y que no esté vacio. Luego creamos un arreglo que va a tomar los usuario que están conectados más el que se acaba de conectar y emitió el evento de ingreso al chat. Por último regresa los usuarios conectados.

```js
const socketsController = (socket, io) => {
    socket.on('enter-chat', ({ name }, callback) => {
        if (!name || name.trim().length === 0) {
            return callback({
                error: true,
                msg: 'El nombre es necesario'
            })
        }
        let usersOnline = users.connectUser(socket.id, name)
        callback(usersOnline)
    })
}
```

## Desconectar usuarios

Cuando el cliente se desconecta, en el lado del servidor se crea una variable que almacene la información del usuario que se acaba de desconectar, para lo cual se usa el método de desconectar un usuario que creamos en el modelo de `Users` y el id es que poseé el socket. Luego se emite una alerta informatica con un mensaje de que alguien salió del chat y por último se emite un evento con todos los usuarios conectados en el momento.

```js
const socketsController = (socket, io) => {
    ...
    socket.on('disconnect', () => {
        let userOffline = users.disconnectUser(socket.id)
        socket.broadcast.emit('show-alert', {
            user: 'Administrador',
            message: `${userOffline.name} abandonó el chat`
        })
        socket.broadcast.emit('users-online', users.allUsersOnline)
    })
}
```

En el lado del frontend, el cliente escucha cuando los eventos de las alertas y de los usuario en linea:

```js
socket.on('show-alert', (alert) => {
    console.log('Servidor: ', alert)
})

socket.on('users-online', (usersOnline) => {
    console.log('Users Online:', usersOnline)
})
```

En el servidor, también podemos informar cuantos usuarios hay en linea e informar cuando se conecta uno nuevo:

```js
const socketsController = (socket, io) => {
    socket.on('enter-chat', ({ name }, callback) => {
        ...
        socket.broadcast.emit('show-alert', {
            user: 'Administrador',
            message: `${name} se unió al chat`
        })
        socket.broadcast.emit('users-online', users.allUsersOnline)
        callback(usersOnline)
    })
    ...
}
```

## Enviando un mensaje a todo el grupo

Para crear los mensajes vamos a usar una función que ubicamos en el archivo `helpers/sockets-utils.js`

```js
const createMessage = (from, message) => {
    return {
        from,
        message, 
        date: new Date().getTime()
    }
}


module.exports = {
    createMessage
}
```

Teniendo esta función podemos reducir un poco las líneas de código al enviar alertas o mensajes. Por ejemplo al alerta la conexión o desconexión de un usuario

```js
const socketsController = (socket, io) => {
    socket.on('enter-chat', ({ name }, callback) => {
        ...
        socket.broadcast.emit('show-alert', createMessage(
            'Administrador', `${name} se unió al chat`
        ))
        ...
    })

    socket.on('disconnect', () => {
        ...
        socket.broadcast.emit('show-alert', createMessage(
            'Administrador', `${userOffline.name} abandonó el chat`
        ))
        ...
    })
}
```

Ahora bien, nuestro servidor debe escuchar el evento de enviar el mensaje, crea una variable con el nombre del usuario que emite el evento y con el payload que se envia, y vuelve a emitir el evento para todos con el mensaje creado.

```js
const socketsController = (socket, io) => {
    ...
    socket.on('send-message', (data) => {
        let { name } = users.getUserByID(socket.id)
        let message = createMessage(name, data)
        socket.broadcast.emit('send-message', message)
    })
    ...
}
```

El socket cliente debe escuchar el mensaje, por ejemplo de la siguiente manera:

```js
socket.on('send-message', (message) => {
    console.log('Nuevo mensaje: ', message)
})
```

Por ejemplo si nosotros ponemos en la consola del navegador lo siguiente, todos los demás clientes lo deben escuchar:

```js
socket.emit('send-message', {message: 'Hola a todos'})
```

## Enviar un mensaje a un usuario en especifico

Cuando un cliente envie un mensaje privado, el cliente que lo recibe lo escucha de la siguiente manera:

```js
socket.on('private-message', (message) => {
    console.log('Mensaje privado: ', message)
})
```

En nuestro servidor también debemos escuchar el evento y emitir el evento a una sala en especifica, que en este caso la sala por defecto lleva el id de cada socket-client conectado.

```js
const socketsController = (socket, io) => {
    ...
    socket.on('private-message', ({ to, message }) => {
        let { name } = users.getUserByID(socket.id)
        socket.broadcast.to(to).emit('private-message', createMessage(name, message))
    })
    ...
}
```

Los id de los sockets se cambian cada que el cliente se conecta, son volatiles. Pero por ejemplo, podemos emitir el evento del mensaje privado desde la consola del navegador, enviandolo a un id de los que se encuentren en el momento:

```js
socket.emit('private-message', {message: 'Hola a todos', to: '1zwkb43wHH2zQbrqAAAL'})
```

Solo el socket que tenga en ese momento el id de destino, podra observar el mensaje.

## Salas de Chat

Dentro del archivo `public/index.html`, creamos un formulario con el que vamos a enviar el nombre del cliente y la sala a la que se conecta.

```html
<form action="chat.html">
    <input type="text" class="form-control my-3" name="name" placeholder="Nombre:">
    <input type="text" class="form-control my-3" name="room" placeholder="Sala:">
    
    <button type="submit" class="btn btn-success">Ingresar</button>
</form>
```

Nuestro socket-client debe reconocer si se le pasan dichos parámetros por la url, en caso contrario debe redirigir a la página principal.

```js
const params = new URLSearchParams(window.location.search)
if (!params.has('name') || !params.has('room')) {
    window.location = 'index.html'
    throw new Error('Los campos son necesarios')
}
```

Además debe crear un objeto que contenga la información de los 2 parámetros:

```js
const user = {
    name: params.get('name'),
    room: params.get('room')
}
```

Cuando un cliente entra a una sala de chat, debemos recibirla y unir el usuario a dicha sala, además, cuando usamos el método de conectar un usuario, le pasamos por parámetros el id del socket, el nombre del cliente y la sala a la que se conecta.

```js
const socketsController = (socket, io) => {
    socket.on('enter-chat', ({ name, room }, callback) => {
        if (!name || name.trim().length === 0 || !room || room.trim().length === 0) {
            return callback({
                error: true,
                msg: 'Todos los datos son necesarios'
            })
        }
        
        socket.join(room)
        let usersOnline = users.connectUser(socket.id, name, room)
        ...
    })
    ...
}
```

Debemos hacer un pequeño cambio en el modelo de `Users`:

```js
class User {
    ...
    connectUser(id, name, room) {
        this.users.push({ id, name, room })
        return this.users
    }
    ....
}
```

## Mensajes y notificación a las salas de chat

Lo primero que vamos a hacer para enviar un mensaje solo a una sala privada es emitir el broadcast solo a dicha sala:

```js
const socketsController = (socket, io) => {
    socket.on('enter-chat', ({ name, room }, callback) => {
        ...
        socket.broadcast.to(room).emit('show-alert', createMessage(
            'Administrador', `${name} se unió al chat`
        ))
        socket.broadcast.to(room).emit('users-online', users.allUsersOnline)
        ...
    }

    socket.on('send-message', (data) => {
        let { name, room } = users.getUserByID(socket.id)
        ...
        socket.broadcast.to(room).emit('send-message', message)
    })
    ...
    socket.on('disconnect', () => {
        let { name, room } = users.disconnectUser(socket.id)
        socket.broadcast.to(room).emit('show-alert', createMessage(
            'Administrador', `${name} abandonó el chat`
        ))
        socket.broadcast.to(room).emit('users-online', users.allUsersOnline)
    })
}
```

Debemos obtener los usuarios por sala y no los usuario en general, puesto que los usuarios están en salas independientes. Vamos a crear la logica del método `getUsersByRoom()` en la clase `Users`:

```js
class Users {
    ...
    getUsersByRoom(room) {
        return this.users.filter(user => user.room === room)
    }
    ...
}
```

Luego, en el controlador de los sockets hacemos este cambio:

```js
const socketsController = (socket, io) => {
    socket.on('enter-chat', ({ name, room }, callback) => {
        ...
        socket.broadcast.to(room).emit('users-online', users.getUsersByRoom(room))

        callback(usersOnline)
    })
    ...
    socket.on('disconnect', () => {
        ...
        socket.broadcast.to(room).emit('users-online', users.getUsersByRoom(room))
    })
}
```

## Diseño de nuestra sala de chat

Dentro del curso de proveyo de un material para el frontend, por lo que los cambios en la parte visual son obra del creador del curso, Fernando Herrera.

## Renderizar usuarios

Vamos a crear un archivo llamado `public/js/socket-chat-jquery.js` y lo importamos en los scripts de la vista de chat, antes de la configuración de nuestro socket-client.

```html
<script src="./js/socket-chat-jquery.js"></script>
<script src="./js/socket-chat.js"></script>
```

Dentro de dicho archivo vamos a referenciar un div que contiene a los usuarios conectados. Creamos una función que crea un template string para interpolar los datos dinamicos de nuestra aplicación.

```js
var params = new URLSearchParams(window.location.search)

let divUsers = $('#divUsuarios')


const renderUsers = (users) => {
    let html = '';

    html += 
    `<li>
        <a href="javascript:void(0)" class="active"> Chat de <span>${params.get('room')}</span></a>
    </li>`

    for (let i = 0; i < users.length; i++) {
        html += 
        `<li>
            <a data-id="${users[i].id}" href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>${users[i].name}<small class="text-success">online</small></span></a>
        </li >`
    }

    divUsers.html(html);
}
```

Ahora, dentro de nuestro archivo para configurar el socket-client (`socket-client.js`), llamamos la función anterior en 2 eventos:

```js
socket.on('connect', () => {
    socket.emit('enter-chat', user, (res) => {
        renderUsers(res)
    })
})
...
socket.on('users-online', (usersOnline) => {
    renderUsers(usersOnline)
})
```

## Obtener el ID del usuario conectado

Cuando hicimos el template string dinamico para todos los usuarios, le agregamos a la etiqueta `<a></a>` una propiedad llamada `data-id`, (en la cual el elemento después del guión puede ser cualquier nombre), lo podemos usar para que por medio de un listener de JQuery obtengamos el valor que se pasa por la misma. En este caso queremos que al hacer click se nos muestre la información del id del usuario.

```js
divUsers.on('click', 'a', function() {
    let id = $(this).data('id')
    if (!id) return
    console.log(id)
})
```

## Enviar y renderizar usuarios

Agregamos otro listener para el formulario donde escribimos los mensajes, debemos evita que se recargue la aplicación cada que hacemos un envio y también debemos validar que el mensaje no esté vacio. Luego emitimos un evento de enviar mensaje, con la información del usuario y el valor del mensaje.

```js
formSend.on('submit', function (e) {
    e.preventDefault()
    if (txtMessage.val().trim().length === 0) return

    socket.emit('send-message', { from: userName, message: txtMessage.val() }, (message) => {
        txtMessage.val('').focus()
    })
})
```

En el controlador de los sockets, cuando escuchamos el evento, también le añadimos un callback para que regrese el mensaje enviado

```js
const socketsController = (socket, io) => {
    ...
    socket.on('send-message', (data, callback) => {
        let { name, room } = users.getUserByID(socket.id)
        let message = createMessage(name, data)
        socket.broadcast.to(room).emit('send-message', message)

        callback(message)
    })
    ...
}
```

Mediante JQuery traemos una referencia para la sección de los mensajes. También creamos una función para renderizar el html con los mensajes que se envian.

```js
let divChatbox = $('#divChatbox')

const renderMessage = ({ from, message }) => {
    let html = ''

    html +=
        `<li class="animated fadeIn">
            <div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" />
            </div>
            <div class="chat-content">
                <h5>${from} </h5>
                <div class="box bg-light-info">${message} </div>
            </div>
            <div class="chat-time">10:56 am</div>
        </li>`

    divChatbox.append(html)
}
```

La función anterior se usa cuando emitimos y escuchamos el evento de enviar mensaje.

```js
formSend.on('submit', function (e) {
    e.preventDefault()
    if (txtMessage.val().trim().length === 0) return

    socket.emit('send-message', txtMessage.val(), (message) => {
        txtMessage.val('').focus()
        renderMessage(message)
    })
})
```

```js
socket.on('send-message', (message) => {
    console.log('Nuevo mensaje: ', message)
    renderMessage(message)
})
```

## Mejorar la forma de renderizar mensajes

Vamos a manejar la manera en que se reciben y envian mensajes y también como se muestran las alertas del administrador. Para ello vamos a usar operadores ternarios.

```js
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
```

Cada que se recibe un mensaje deberiamos hacer que el scroll del div se ubique en la parte inferior a menos que el usuario se quiera ubicar en una parte especifica del scroll superior:

```js
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
```

En el JQuery del cliente llamamos la función dentro del listener del formulario de envio:

```js
formSend.on('submit', function (e) {
    ...
    scrollBottom()
})
```

Dentro de nuestro controlador de los sockets llamamos ese método en 2 partes:

```js
socket.on('show-alert', (alert) => {
    renderMessage(alert, false)
    scrollBottom()
})
...
socket.on('send-message', (message) => {
    renderMessage(message, false)
    scrollBottom()
})
```
