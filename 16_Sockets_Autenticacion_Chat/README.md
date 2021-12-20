# Sección 16: Sockets con autenticación

Veremos cómo establecer una comunicación con nuestro WebScoket server pero validando la autenticación del usuario, y a la vez confirmar que los mensajes enviados por ese usuario son de quien dice ser.

Puntualmente veremos:

- Autenticar Sockets
- Usar JWT para validar Sockets
- Headers personalizados para Sockets
- Implementar el login en el FrontEnd
- Implementar y usar el GoogleSign in creado
- Enviar mensajes privados
- Enviar mensajes a salas
- Enviar mensajes globales

Es una sección que visualmente no es atractiva, pero les dará todos los fundamentos necesarios para que lo sigan mejorando tanto como deseen.

## Inicio del proyecto - SocketChat

Para está sección vamos a manejar la última versión del [RESTServer](../13_Archivos) que hemos creamos. Es importante recordar que se deben configurar las variables de entorno a partir del archivo `.example.env`, e instalamos todos los paquetes con el comando `npm install`. Para levantar el servidor usamos el comando `nodemon app`. Vamos a implementar un poco de Bootstrap para qye se vea un poco más estilizado.

## Configurar Socket.io

Vamos a instalar el paquete de Socket.io con el comando `npm i socket.io`. Dentro del modelo de nuestro servidor añadimos las la configuración para el server de los sockets, al cual ponemos a escuchar en el puerto definido:

```js
class Server {
    constructor() {
        ...
        this.server = require('http').createServer(this.app)
        this.io = require('socket.io')(this.server)
        ...
    }
    ...
    listen() {
        this.server.listen(this.PORT, () => {...})
    }
}
```

También definimos un método para escuchar los sockets y su controlador:

```js
const { socketController } = require('../sockets/sockets.controller')

class Server {
    constructor() {
        ...
        this.sockets()
    }
    ...
    sockets() {
        this.io.on('connection', socketController)
    }
}
```

Creamos una nueva vista llamada `public/chat.html` y un archivo js llamado `public/js/chat.js` para la configuración de nuestro cliente.

## Diseño del login y su funcionamiento

Vamos a separar el script de SignIn with Google en un archivo js llamado `public/js/auth.js`, en el cual una vez enviamos las credenciales de la autenticación, tomamos la data que nos devuelve, la convertimos en JSON y de la misma tomamos el token, que vamos a guardar en el Local Storage, luego redireccionamos a la vista de chat.

```js
function handleCredentialResponse(response) {
    ...
    fetch(url, {...})
        .then(res => res.json())
        .then(({ token }) => {
            ...
            localStorage.setItem('token', token)
            ...
            window.location = `chat.html`
        })
        .catch(console.warn)
}
```

Dentro del archivo `index.html` vamos a crear un pequeño formulario para ingresar con email y password.

```js
<div class="col-sm-6">
    <h1>Sign In with email</h1>
    <hr>
    <form class="d-grid">
        <input type="text" class="form-control mb-2" name="email" placeholder="Email" />
        <input type="password" class="form-control mb-2" name="password" placeholder="Password" />
        <button type="submit" class="btn btn-outline-primary">Ingresar</button>
    </form>
</div>
```

Cambiamos el endpoint para el fetch en el archivo de `auth.js`, con el fin de que url apunte solo a auth, y luego en cada método se añade el lugar a donde se termina de apuntar:

```js
const url = (window.location.hostname.includes('localhost'))
    ? 'http://localhost:8080/api/auth/' 
    : 'https://restserver-nodejs-mongo.herokuapp.com/api/auth/'


function handleCredentialResponse(response) {
    ...
    fetch(url + 'google', {...})
        ...
}
```

Añadimos la referencia al formulario para ingreso manual. Luego le añadimos un evento con el que va a detectar el submit, va a evitar que se recargue la pantalla, va a recorrer todos los elementos, y en aquellos en los que tenga nombre va a tomarlo como referencia para agregar su valor dentro del objeto que se va enviar por el método POST mediante Fetch. Obtenemos la respuesta de nuestra petición, la convertimos en JSON y de dicha respuesta desestructuramos el mensaje en caso de error o el token del usuario en caso exitoso. Dicho token los sobrescribimos en el localStorage.

```js
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
            if (msg) return console.error(msg)
            localStorage.setItem('token', token)
        })
        .catch(console.warn)
})
```

## Validar el JWT - Servicio

Vamos a crear un endpoint para validar si un JWT es valido. Vamos a las rutas de Auth y creamos una nueva ruta que use un middleware que ya tenemos y también que use un controlador:

```js
router.get('/', validateJWT, renewToken)
```

El controlador para dicha ruta será lo siguiente: Toma el usuario autenticado en la request y genera un nuevo token para dicho usuario y luego retorna un json con la nueva información.

```js
const renewToken = async (req, res = response) => {
    const { userAuth } = req
    const token = await generateJWT(userAuth.id)
    res.json({
        userAuth,
        token
    })
}
```

## Validar Token - Frontend

Dentro del archivo `chat.js` creamos una función `main()` que va a ejecutar un método para validar el JWT. Primero rescata el token que se encuentra en el localStorage, luego valida si el token tiene cierta longitud de caracteres, si no cumple con la condición se redirige a la página de inicio. Si el token cumple, se hace una petición a la url base con Fetch enviando en los headers el token. De la respuesta se desestructura el usuario autenticado y el token que nos envia, el cual usamos para sobrescribir el campo de token en el Local Storage. Además asignamos el valor del usuario a la variable `user`, la cual usamos para darle un titulo al documento

```js
let user = null


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
        headers: { 'x-token' : token }
    })
    const { userAuth: userDB, token: tokenDB } = await res.json()
    localStorage.setItem('token', tokenDB)
    user = userDB
    document.title = user.name
}


const main = async () => await validateJWT()
main()
```

## Validar socket con JWT - Backend

En el archivo del cliente (`chat.js`) creamos una función para conectar el socket. Lo interesante es que cuando usamos `io()` le podemos enviar unos extra-headers, en el cual le entregamos el token que se almacena en el Local Storage. Esta función se va a usar una vez se valide el JWT en el lado del frontend.

```js
const validateJWT = async () => {
    ...
    await connectSocket()
}


const connectSocket = async () => {
    const socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    })
}
```

Vamos a crear una función helper que nos ayude a validar el JWT. El método recibe el token, valida su longitud, luego si el token es valido verifica el token con la llave privada y tomamos el uid. Con dicho id buscamos a un usuario que coincida con dicho uid. Retornamos el usuario si se encuentra y si su estatus es valido dentro de la base de datos.

```js
require('dotenv').config()
const jwt = require('jsonwebtoken')

const { User } = require('../models')

const verifyJWT = async (token = '') => {
    try {
        if (token.length < 10) return null
        const { uid } = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findById(uid)
        if (user) {
            if (user.status) return user
            else return null
        }
        else return null
    } catch (error) {
        return null
    }
}


module.exports = {
    verifyJWT
}
```

Dentro del controlador de nuestro socket vamos a obtener dicho token, el cual usamos para obtener el usuario propietario del mismo. Si no existe ningún usuario, desconectamos el socket:

```js
const socketController = async (socket = new Socket()) => {
    const token = socket.handshake.headers['x-token'];
    const user = await verifyJWT(token)
    if (!user) return socket.disconnect()
    console.log(`Se conecto ${user.name}`)
}
```

## HTML y JS que usaremos

Dentro del archivo `chat.html` creamos un esqueleto y ponemos algunos ids en lugares especificos. Dichos elementos los vamos a referenciar en el archivo `chat.js`:

```js
const txtUid = document.querySelector('#txtUid')
const txtMessage = document.querySelector('#txtMessage')
const ulUsers = document.querySelector('#ulUsers')
const ulChat = document.querySelector('#ulChat')
const btnLogout = document.querySelector('#btnLogout')
```

También definimos los eventos a escuchar por parte del cliente:

```js
let socket

const connectSocket = async () => {
    socket = io({...}})

    socket.on('receive-message', () => {})

    socket.on('active-users', () => {})

    socket.on('private-message', () => {})
}
```

## Modelo para el manejo de usuarios conectados y mensajes

Creamos una clase privada `Message` que se instancia con un uid, un nombre y un mensaje. Esta clase la usamos para enviar los mensajes. Tenemos otra clase que sería la principal llamada `ChatMessage` la cual tiene almacenado los mensajes y los usuarios del chat. Tiene un método get para obtener los últimos 10 mensajes, otro método get para obtener un arreglo con los usuarios, una función para enviar mensajes que se encarga de instanciar la clase privada de `Message` y guarda el valor resultante al principio del arreglo de mensajes, otra función para usuarios conectados y otra para los desconectados.

```js
class Message {
    constructor(uid, name, message) {
        this.uid = uid
        this.name= name
        this.message = message
    }
}


class ChatMessages {
    constructor() {
        this.messages = []
        this.users = {}
    }

    get last10() {
        this.messages = this.messages.splice(0, 10)
        return this.messages
    }

    get usersArr() {
        return Object.values(this.users)
    }

    sendMessage(uid, name, message) {
        this.messages.unshift(new Message(uid, name, message))
    }

    connectUser(user) {
        this.users[user.id] = user
    }

    disconnectUser(id) {
        delete this.users[id]
    }
}


module.exports = ChatMessages
```

## Listado de usuario conectados

Para evitar que tengamos que emitir 2 veces un evento (el primero para el usuario y el segundo mediante broadcasta para los demás), pasamos por segundo parámetro del controlador una instancia de `io`:

```js
const socketController = async (socket, io) => {...}

```

Dentro del modelo de Server, donde llamamos a los sockets, debemos hacer este cambio:

```js
class Server {
    ...
    sockets() {
        this.io.on('connection', (socket) => socketController(socket, this.io))
    }
}
```

Cuando un usuario se conecta, debemos añadirlo al arreglo de usuarios conectados de la instancia de `ChatMessage`, luego emitimos el evento de usuario activos con el arreglo de los usuarios conectados. En caso de desconectarse un usuario, se elimina al mismo del arreglo mediante la función de la clase instanciada, y volvemos a emitir la lista de usuarios.  

```js
const chatMessages = new ChatMessages();

const socketController = async (socket = new Socket(), io) => {
    ...
    chatMessages.connectUser(user)
    io.emit('active-users', chatMessages.usersArr)
    
    socket.on('disconnect', () => {
        chatMessages.disconnectUser(user.id)
        io.emit('active-users', chatMessages.usersArr)
    })
}
```

## Mostrar en el HTML los usuarios conectados

Cuando se emita el evento de los usuarios conectados mostramos los usuario en el html. Para ello creamos un método que recorre todo el arreglo que se recibe en el payload del evento y se hace un template String para crear una estructura en HTML. Cada que un usuario se desconecta, la aplicación lo saca de las lista de usuario y cuando se vuelve a conectar, lo agrega.

```js
const connectSocket = async () => {
    ...
    socket.on('active-users', showUsers)
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
```

## Envío de mensajes a toda la sala de chat

Cuando enviamos un mensaje desde el input del formulario, validamos en el lado del cliente que para enviar el mensaje se haga con la tecla enter cuyo código es el 13, también validamos que no se envie un mensaje vacio. Una vez el mensaje pase todas las validaciones, se emite un evento que envía el uid y el mensaje.

```js
txtMessage.addEventListener('keyup', ({ keyCode }) => {
    const message = txtMessage.value
    const uid = txtUid.value

    if (keyCode !== 13) return
    if (message.length === 0 && message.trim().length === 0) return
    socket.emit('send-message', { uid, message })
    txtMessage.value = ''
})
```

El evento de enviar el mensaje se escucha en el servidor, el cual mediante la instancia de la clase `ChatMessages` usa el método de enviar el mensaje con todo los parámetros que se requieren. Luego emite un evento a todos los usuarios con los últimos 10 mensajes.

```js
const socketController = async (socket = new Socket(), io) => {
    ...
    socket.on('send-message', ({ uid, message }) => {
        chatMessages.sendMessage(user.id, user.name, message)
        io.emit('receive-message', chatMessages.last10)
    })
}
```

## Historial de mensajes en el HTML

Creamos una función que contenga un template string para mostrar los mensajes en el HTML.

```js
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
```

Esta función la usamos al escuchar el evento de mensajes recibidos, el cual como solo pasa un elemento en el payload, permite que solo referenciemos la función y ya ella interpreta cual parámetro se le está entregando:

```js
const connectSocket = async () => {
    ...
    socket.on('receive-message', showMessages)
    ...
}
```

## Mensajes Privados

Cuando el cliente se conecta, en la función del controlador (`const socketController = async (socket, io) => {}`), está enlazado a 2 salas, una es global y lo maneja mediante `io`, pero también se une a una sala con su propio id de socket y está se maneja mediante `socket`, pero dicho id se cambia cada que el cliente se conecta.

Lo que podemos hacer es unirlo a una sala independiente que se identifique con su id, y cada que envie un mensaje se identifique si es a una sala global o personal mediante el uid que se envia.

```js
const socketController = async (socket = new Socket(), io) => {
    ...
    chatMessages.connectUser(user)
    io.emit('receive-message', chatMessages.last10)
    socket.emit('active-users', chatMessages.usersArr)
    socket.join(user.id)
    ...
    socket.on('send-message', ({ uid, message }) => {
        if (uid) {
            socket.to(uid).emit('private-message', { from: user.name, message })
        } else {
            chatMessages.sendMessage(user.id, user.name, message)
            io.emit('receive-message', chatMessages.last10)
        }
    })
}
```

Y por ejemplo podemos mostrar en consola del cliente al que se le envia el mensaje, los mensajes privados:

```js
const connectSocket = async () => {
    ...
    socket.on('private-message', console.log)
}
```
