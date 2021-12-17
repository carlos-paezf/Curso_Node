# Sección 14: Sockets - Fundamentos de los sockets

Aquí cubriremos varios temas como:

- Introducción a los sockets
- Resolver preguntas comunes sobre los sockets
- Instalación de Socket.io
- Detectar conexiones y desconexiones de usuarios
- Emitir mensajes cliente servidor / servidor cliente
- Escuchar los mensajes servidor cliente / cliente servidor
- Broadcast
- Callbacks en los sockets
- Pruebas en Heroku

## ¿Qué son los sockets? ¿Para qué nos pueden servir?

Imaginemos una arquitectura cliente-servidor. El cliente le va a solicitar la información y el servidor le va a responder, pero en caso de que haya en ese momento una actualización, el servidor no va a ser capaz de notificar la nueva información, solo hasta que esl usuario haga una nueva petición. En caso de que un cliente necesite enviarle información a otro cliente, ambos clientes deben hacer peticiones al servidor. Los sockets permiten que se tenga una comunicación activa en doble via, permitiendo una comunicación en tiempo real. También permite que se notifique cuando se conecta o desconecta un usuario o cuando se vuelve a conectar y obtener la misma sesión que tenía anteriormente. Una de las peculiaridades de los sockets es que nos permite tener eventos personalizados para notificaciones que nos interesen.

## Inicio del proyecto - Fundamentos sobre Web Sockets

Vamos a crear un nuevo proyecto, para lo cual primero usamos el comando `npm init -y` con el que creamos nuestro `package.json` por default. Luego creamos un modelo para nuestro servidor llamado `models/server.js` y lo configuramos de la siguiente manera:

```js
class Server {
    constructor() {}

    middlewares = () => {}

    routes = () => {}

    listen = () => {}
}


module.exports = Server
```

Instalamos inicialmente los siguientes paquetes:

- Express: Manejo del servidor
- Dotenv: Variables de entorno
- Cors: Manipulación del CORS (Cross-origin resource sharing) de la aplicación
- Colors: Impresiones en consola más esteticas

```console
npm i express dotenv cors colors
```

Una vez instaladas las librerías procedemos a configurar la clase `Server` de las siguiente manera:

```js
require('dotenv').config()
require('colors')

const express = require('express')
const cors = require('cors')


class Server {
    constructor() {
        this.app = express()
        this.PORT = process.env.PORT
        this.paths = {}
        this.middlewares()
        this.routes()
    }

    middlewares = () => {
        this.app.use(cors())
        this.app.use(express.static('public'))
    }

    routes = () => {}

    listen = () => {
        this.app.listen(this.PORT, () => {
            console.log(`Aplicación corriendo en http://localhost:${this.PORT}/`.green)
        })
    }
}


module.exports = Server
```

Dentro del archivo `app.js` creamos una instancia del servidor y lo ponemos a escuchar:

```js
const Server = require('./models/server')


const server = new Server()


console.clear()
server.listen()
```

También vamos a crear una carpeta pública con su `index.html` y un directorio para almacenar la configuración de los sockets. Esta vez vamos a usar un poco de CSS mediante Bootstrap con su CDN.

## Instalación de Socket.io

Para la instalación del paquete de Socket.io usamos el comando `npm i socket.io`, y para su uso empezamos con añadir una propiedad a la clase del Server además de cambiar la propiedad del método `listen()`:

```js
const http = require('http')

class Server {
    constructor() {
        ...
        this.server = http.createServer(this.app)
        this.io = require('socket.io')(this.server)
    }
    ...
    listen = () => {
        this.server.listen(this.PORT, () => {...})
    }
}
```

Para comprobar que todo sigue funcionando entramos a la sigiente URL: http://localhost:8080/socket.io/socket.io.js, y nos debe mostrar un archivo extenso de JavaScript. En caso de nuestro frontend se encuentra en otro hosting debemos usar el paquete ***Socket.io Client***. Una vez logramos acceder a la ruta anterior, la copiamos y la añadimos como script en nuestro `index.html` antes del script de socket-client.

```html
<body>
    ...
    <script src="http://localhost:8080/socket.io/socket.io.js"></script>
    <script src="./js/socket-client.js"></script>
</body>
```

## Configuración de socket.io - Frontend

Vamos a crear un método para los sockets, dentro de la clase de Server. Lo primero es saber que `this.io` es nuestro servidor de sockets, el cual es muy diferente a `this.app`, pero ambas conviven bajo el mismo techo. Si queremos conectar un cliente tendremos lo siguiente:

```js
class Server {
    constructor() {
        ...
        this.sockets()
    }
    ...
    sockets = () => {
        this.io.on('connection', socket => {
            console.log(`Cliente conectado`.blue)
        })
    }
}
```

Y dentro de `socket-client.js` vamos a conectar el socket.

```js
const socket = io()
```

Cada que ingresamos a nuestro path, o lo recargamos, se va a conectar un cliente, el cual en el acto de recargar la página se va a desconectar, y eso lo podemos observar cuando agregamos las siguiente líneas a nuestro método de `sockets()`:

```js
class Server {
    ...
    sockets = () => {
        this.io.on('connection', socket => {
            console.log(`Client conectado`.blue)

            socket.on('disconnect', () => {
                console.log(`Cliente desconectado`.cyan)
            })
        })
    }
}
```

Si queremos confirmar que son clientes diferentes los que se conectan cada que se recarga la aplicación, agregamos el id del socket al conectarse

```js
class Server {
    ...
    sockets = () => {
        this.io.on('connection', socket => {
            console.log(`Client conectado:`.blue, socket.id)

            socket.on('disconnect', () => {
                console.log(`Cliente desconectado:`.cyan, socket.id)
            })
        })
    }
}
```

## Mensajes de conexión y desconexión - Cliente

Ya vimos los mensajes de conexión del lado de nuestro servidor, pero también podemos observar los mensajes de conexión del lado del client. En el archivo de `socket-client.js` ponemos las siguientes líneas, y miramos la consola del navegador:

```js
socket.on('connect', () => console.log('Conectado'))

socket.on('disconnect', () => console.log('Desconectado del servidor'))
```

También lo podemos hacer más visual si ponemos lo siguiente en el html:

```html
<div class="container">
    <p>
        Server Status:
        <span id="lblOnline" class="text-success">Online</span>
        <span id="lblOffline" class="text-danger">Desconectado</span>
    </p>
</div>
```

Y lo siguiente dentro de `socket-client.js`:

```js
const lblOnline = document.querySelector('#lblOnline')
const lblOffline = document.querySelector('#lblOffline')
...

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
```

## Emitir desde el cliente - Escuchar en el servidor

Creamos un pequeño formulario para enviale un mensaje al servidor.

```html
<div class="container mt-4">
    <div class="row">
        <div class="col">
            <input type="text" id="txtMessage" class="form-control" />
        </div>
        <div class="col">
            <button id="btnSend" class="btn btn-succes">Enviar</button>
        </div>
    </div>
</div>
```

Mediante Vanilla JS logramos capturar el mensaje y emitimos un evento personalizado:

```js
const txtMessage = document.querySelector('#txtMessage')
const btnSend = document.querySelector('#btnSend')

btnSend.addEventListener('click', () => {
    const message = txtMessage.value
    socket.emit('send-message', message)
})
```

Para escuchar del lado del servidor el evento personalizado, recibimos el payload del evento emitido:

```js
class Server {
    ...
    sockets = () => {
        this.io.on('connection', socket => {
            ...
            socket.on('send-message', (payload) => {
                console.log(`Mensaje recibido en el servidor:`.italic, `${payload}`)
            })
        })
    }
}
```

El ideal es no solo enviar elementos planos, sino objetos, por ejemplo:

```js
btnSend.addEventListener('click', () => {
    const message = txtMessage.value
    const payload = {
        message,
        id: '1234',
        fecha:  new Date()
    }
    socket.emit('send-message', payload)
})
```

## Emitir desde el servidor - Escuchar en el cliente
