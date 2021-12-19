# Sección 15: Sockets - Aplicación de Cola

Aquí cubriremos varios temas como:

- Aplicar sockets en un proyecto real
- Aprender sobre clases del ES6
- Asignar Tickets
- Leer Tickets
- Notificaciones

En resumen, crearemos una aplicación de cola

## Inicio del proyecto - Aplicación de colas

Nos basamos en el código de la sección anterior, pero se le añadió un esqueleto en el directorio de `public` para simular la atención por tickets de un banco o una fila de atención. Para instalar los paquetes usamos el comando `npm install` o `npm i`.

## Clase para centralizar la lógica de los tickets

Vamos a crear una clase para centralizar la lógica de negocio de nuestros tickets. También ocupamos un JSON que hará las veces de base de datos. Nuestra clase tendra las siguientes propiedades:

```js
class TicketControl {
    constructor() {
        this.latest = 0
        this.today = new Date().getDate()
        this.tickets = []
        this.last4 = []
    }
}
```

También creamos un método get que nos retorne un objeto con dichas propiedades:

```js
class Server {
    ...
    get toJson() {
        return {
            latest: this.latest,
            today: this.today,
            tickets: this.tickets,
            last4: this.last4
        }
    }
}
```

Para inicializar la clase creamos un método llamado `init()`, con el cual comparamos el día que está guardado en el JSON con el día actual. Si coinciden, se les asigna a los datos las propiedades de la instancia de nuestra clase, en caso contrario, se guardan los datos.

```js
class TicketControl {
    constructor(){
        ...
        this.init()
    }
    ...
    init() {
        const { latest, today, tickets, last4 } = require('../db/data.json')
        if (today === this.today) {
            this.tickets = tickets
            this.latest = latest,
            this.last4 = last4
        } else {
            this.saveDB()
        }
    }
}
```

Para guardar los datos en el archivo JSON requerimos del paquete path y fs de node:

```js
const path = require('path')
const fs = require('fs')

class TicketControl {
    ...
    saveDB() {
        const dbPath = path.join(__dirname, '../db/data.json')
        fs.writeFileSync(dbPath, JSON.stringify(this.toJson))
    }
}
```

Vamos a instanciar la clase en el controlador de los sockets:

```js
const TicketControl = require("../models/ticket-control")

const ticketControl = new TicketControl()
```

## Modelo - Siguiente y atender nuevo ticket

Creamos una clase para definir la estructura de un ticket:

```js
class Ticket {
    constructor(number, desk) {
        this.number = number
        this.desk = desk
    }
}
```

Para pasar al siguiente ticket, aumentamos la propiedad de último, creamos una nueva instancia de un ticket, lo añadimos al arreglo de tickets, guardamos en la base de datos y retornamos un mensaje con el número del ticket.

```js
class TicketControl {
    ...
    next() {
        this.latest += 1
        const ticket = new Ticket(this.latest, null)
        this.tickets.push(ticket)

        this.saveDB()

        return `Ticket: ${ticket.number}`
    }
}
```

Para atender un ticket, debemos tener en cuenta el escritorio al que lo vamos a enviar. En caso de que la lista de tickets este vacia retornamos un nulo porque no hay nada que atender. En caso contrario, tomamos el primer ticket de la lista de tickets y lo eliminamos de la misma mediante el método de `shift()`, el cual toma el elemento que está en la posición 0 del arreglo lo asigna al lugar donde se llama, y luego lo elimina del arreglo. Teniendo el ticket a atender, le asignamos el escritorio al que debe acudir y además lo añadimos a los últimos 4 tickets que se van a atender. Si este arreglo supera la longitud de 4 elementos, elimina el último. Luego la información se guarda en la base de datos y se retorna el ticket.

```js
class TicketControl {
    ...
    serveTicket(desk) {
        if (this.tickets.length === 0) {
            return null
        }
        
        const ticket = this.tickets.shift()
        ticket.desk = desk

        this.last4.unshift(ticket)

        if (this.last4.length > 4) {
            this.last4.splice(-1,1)
        }
        this.saveDB()
        return ticket
    }
}
```

## Socket: Siguiente Ticket

Dentro el controlador de los sockets escuchamos el evento personalizado de `next-ticket`, nosotros no necesitamos enviar el payload por el momento, por lo cual lo marco con un `_`, pero si necesitamos un callback con el que enviamos el siguiente ticket.

```js
const socketController = (socket) => {
    socket.on('next-ticket', (_, callback) => {
        const next = ticketControl.next()
        callback(next)
    })
}
```

Dentro del archivo `public/new_ticket.js` llamamos el archivo de socket.io:

```html
<script src="./socket.io/socket.io.js"></script>
```

En el archivo `public/js/new-ticket.js` creamos las referencias a un span y un botón que se encuentran en el archivo de `public/new-ticket.js`. También una constante que use a `io()`.

```js
const lblNuevoTicket = document.querySelector("#lblNuevoTicket")
const btnCrear = document.querySelector("#btnCrear")

const socket = io()
```

Al conectarse el cliente el boton para crear un ticket estará habilitado, en caso de que se desconecté, el botón se deshabilita.

```js
socket.on('connect', () => {
    btnCrear.disable = false
})

socket.on('disconnect', () => {
    btnCrear.disable = true
})
```

Cada que presionamos el botón para crear un ticket, se emite el evento de `next-ticket`, y por medio del callback se obtiene el ticket creado y lo añadimos al atributo de texto del label:

```js
btnCrear.addEventListener('click', () => {
    socket.emit('next-ticket', null, (ticket) => {
        lblNuevoTicket.innerText = ticket
    })
})
```

Cada que creamos un ticket se va a recargar nuestro servidor en entorno desarrollo si lo hemos lanzado con nodemon, puesto que está detectando la modificación del archivo JSON que representa nuestra base de datos. Para evitar esto, creamos un archivo en la raiz del proyecto llamado `nodemon.json` y añadimos las siguientes líneas:

```json
{
    "ignore": ["db/*.json"]
}
```

También podemos emitir desde el servidor el último ticket creado, cada que se recargue la aplicación:

```js
const socketController = (socket) => {
    socket.emit('last-ticket', ticketControl.latest)
    ...
}
```

Y escuchamos el evento en el cliente:

```js
socket.on('last-ticket', (lastTicket) => {
    lblNuevoTicket.innerText = `Último Ticket: ${lastTicket}`
})
```

## Preparar pantalla de escritorio (Desk)

En el archivo de `public/js/desk.js` vamos a validar que la ruta tenga el parámetro de `escritorio`, en caso contrario se debe redireccionar al inicio:

```js
const searchParams = new URLSearchParams(window.location.search)


if (!searchParams.has('escritorio')) {
    window.location = 'index.html'
    throw new Error('El escritorio es obligatorio')
}
```

Dento del archivo de `public/desk.html` vamos a importar el archivo de socket.io:

```html
<script src="./socket.io/socket.io.js"></script>
```

Volvemos al archivo `desk.js` para crear las referencias:

```js
const lblEscritorio = document.querySelector('#lblEscritorio')
const lblTicket = document.querySelector('#lblTicket')
const btnNext = document.querySelector('#btnNext')

const socket = io()
```

Al label de escritorio le asignamos el valor del parámetro de la búsqueda:

```js
const desk = searchParams.get('escritorio')
lblEscritorio.innerHTML = escritorio
```

Al botón de siguiente lo configuramos para que se desactive cuando el cliente esté desconectado:

```js
socket.on('connect', () => {
    btnNext.disable = false
})

socket.on('disconnect', () => {
    btnNext.disable = true
})
```

## Socket: Atender un cliente

Necesitamos una referencia más, el cual apunta a un div con una alerta de que no hay usuario por atender:

```js
const divAlert = document.querySelector('.alert')

divAlert.style.display = 'none'
```

Cada que presionemos el botón para atender el siguiente ticket, nuestro cliente emite un evento en que envia el escritorio que se ingreso por parámetro de la ruta.

```js
btnNext.addEventListener('click', () => {
    socket.emit('serve-client', {desk}, () => {})
})
```

A partir del payload que envía en el evento, el servidor realiza una validacion para saber si se paso el escritorio, con el cual usa el método `serverTicket(desk)` en la instancia de la clase de Ticket Control. Si no hay tickets envia un error, pero si lo hay envía la información del ticket por medio del callback.

```js
const socketController = (socket) => {
    socket.on('serve-client', ({desk}, callback) => {
        if (!desk) {
            return callback({
                ok: false,
                msg: 'El escritorio es obligatorio'
            })
        }

        const ticket = ticketControl.serveTicket(desk)
        if (!ticket) {
            callback({
                ok: false,
                msg: 'Ya no hay tickets pendientes'
            })
        } else {
            callback({
                ok: true,
                ticket
            })
        }
    })
}
```

Una vez el servidor envié la información por el callback, el cliente lo recibe y hace el tratamiento visual.

```js
btnNext.addEventListener('click', () => {
    socket.emit('serve-client', { desk }, ({ ok, msg, ticket }) => {
        if (!ok) {
            lblTicket.innerText = `Nadie`
            return divAlert.style.display = ''
        }
        lblTicket.innerText = `Ticket ${ticket.number}`
    })
})
```

## Mostrar cola de tickets en pantalla

En el archivo `public/public.html` volvemos a hacer la importación de socket.io:

```html
<script src="./socket.io/socket.io.js"></script>
```

Dentro del controlador de los sockets emitimos un evento con los últimos 4 tickets, tanto al conectar el socket, como al atender un ticket:

```js
const socketController = (socket) => {
    ...
    socket.emit('last-four', ticketControl.last4)
    
    socket.on('serve-client', ({ desk }, callback) => {
        ...
        const ticket = ticketControl.serveTicket(desk)
        socket.emit('last-four', ticketControl.last4)
        ...
    })
}
```

Nuestro cliente solo require 1 vez para escuchar los eventos. Primero vamos a referencias los elementos del html que requieren dinamismo:

```js
const lblTicket1 = document.querySelector('#lblTicket1')
const lblEscritorio1 = document.querySelector('#lblEscritorio1')
const lblTicket2 = document.querySelector('#lblTicket2')
const lblEscritorio2 = document.querySelector('#lblEscritorio2')
const lblTicket3 = document.querySelector('#lblTicket3')
const lblEscritorio3 = document.querySelector('#lblEscritorio3')
const lblTicket4 = document.querySelector('#lblTicket4')
const lblEscritorio4 = document.querySelector('#lblEscritorio4')
```

El cliente cuando escucha el evento recibe un payload con un arreglo, por lo que vamos a aplicar desestructuración de arreglos y vamos a asignarles nombre, los cuales usamos para la poner las propiedades correspondientes en las referencias:

```js
socket.on('last-four', (payload) => {
    const [t1, t2, t3, t4] = payload

    console.log(payload)

    if (t1) {
        lblTicket1.innerText = `Ticket: ${t1.number}`
        lblEscritorio1.innerText = `Escritorio: ${t1.desk}`
    }
    if (t2) {
        lblTicket2.innerText = `Ticket: ${t2.number}`
        lblEscritorio2.innerText = `Escritorio: ${t2.desk}`
    }
    if (t3) {
        lblTicket3.innerText = `Ticket: ${t3.number}`
        lblEscritorio3.innerText = `Escritorio: ${t3.desk}`
    }
    if (t4) {
        lblTicket4.innerText = `Ticket: ${t4.number}`
        lblEscritorio4.innerText = `Escritorio: ${t4.desk}`
    }
})
```

Para que se actualizen los datos en tiempo real, debemos añadir la propiedad `broadcast` antes de emit los eventos cuando se ha atendido un cliente:

```js
const socketController = (socket) => {
    ...    
    socket.on('serve-client', ({ desk }, callback) => {
        ...
        const ticket = ticketControl.serveTicket(desk)
        socket.broadcast.emit('last-four', ticketControl.last4)
        ...
    })
}
```

## Tickets pendientes por atender

Ya sea que atendamos o creamos un nuevo ticket, debemos actualizar el número de tickets pendientes, para ello emitimos un evento del lado del servidor una vez se conecte:

```js
const socketController = (socket) => {
    ...
    socket.emit('pending-tickets', ticketControl.tickets.length)
}
```

Cuando creamos un ticket, emitimos el evento nuevamente, pero con broadcast para actualizar la pantalla de los demás clientes:

```js
const socketController = (socket) => {
    ...
    socket.on('next-ticket', (_, callback) => {
        ...
        socket.broadcast.emit('pending-tickets', ticketControl.tickets.length)
    })
```

Cuando atendemos, actualizamos la pantalla del cliente que está atendiendo y la de los demás, por ello emitimos el evento normal y también con broadcast.

```js
const socketController = (socket) => {
    ...
    socket.on('serve-client', ({ desk }, callback) => {
        ...
        const ticket = ticketControl.serveTicket(desk)
        ...
        socket.emit('pending-tickets', ticketControl.tickets.length)
        socket.broadcast.emit('pending-tickets', ticketControl.tickets.length)
        ...
    })
}
```

El evento lo escuchamos en el lado de cliente de la siguiente manera (`desk.js`):

```js
const lblPendientes = document.querySelector('#lblPendientes')
...

socket.on('pending-tickets', (pendings) => {
    lblPendientes.innerText = pendings
})
```

## Reproducir audio cuando se asigna un ticket

Es importante aclarar que Google Chrome no permite reproducir audio sin que el usuario realice un evento para lanzar la acción. Pero podemos lograr que por medio de Firefox pongamos en pantalla la vista de `public.html`, y se reproduzca el audio una vez hallamos configurado los permisos de audio y video. Para reproducir el audio hacemos lo siguiente en la escucha de `last-four`:

```js
socket.on('last-four', (payload) => {
    const audio = new Audio('./audio/new-ticket.mp3')
    audio.play()
    ...
})
```
