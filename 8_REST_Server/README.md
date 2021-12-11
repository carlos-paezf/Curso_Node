# Sección 8: REST Server - Configuraciones Iniciales

## Iniciando el proyecto - RESTServer

Comandos y archivos iniciales.

- `npm init -y`: `package.json`
- `app.js`
- `.gitignore`
- `npm i express dotenv`

Dentro del archivo `app.js` hacemos la configuración de *Express*:

```js
require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.listen(PORT, () => {
    console.log(`Aplicación corriendo en http://localhost:${PORT}`);
})
```

## Express basado en clases

Vamos a crear un archivo llamado `models/Server.js`. Dentro de este archivo hacemos la instanciación de la aplicación dentro del constructor de la clase Server.

```js
const express = require('express')


class Server {
    constructor() {
        this.app = express()
    }
}


module.exports = Server
```

También creamos un método dentro de la misma clase para la configuración de las rutas:

```js
class Server {
    constructor() {
        ...
        this.routes()
    }

    routes() {
        this.app.get('/', (req, res) => {
            res.send('Hello world')
        })
    }
}
```

Para definir el puerto y el método de escuchar creamos una variable que tenga por valor inicial el puerto definido en las variables de entorno. Luego creamos el método para que el servidor escuche en dicho puerto.

```js
require('dotenv').config()

class Server {
    constructor() {
        ...
        this.PORT = process.env.PORT
    }
    ...
    listen() {
        this.app.listen(this.PORT, () => {
            console.log(`Aplicación corriendo en http://localhost:${this.PORT}`);
        })        
    }
}
```

Teniendo el archivo `app.js` "limpio", creamos una instancia del Server para poder hacer que la aplicación empiece a escuchar:

```js
const Server = require("./models/Server");

const server = new Server()

server.listen()
```

Los Middlewares son funciones que le añaden una funcionalidad a nuestro WebServer. En este caso queremos un middleware que nos permita usar el contenido estático de un archivo html dentro de la carpeta `public`:

```js
class Server {
    constructor() {
        ...
        this.middlewares()
    }
    ...
    middlewares() {
        this.app.use(express.static('public'))
    }
}
```

Es importante que la llamada al método de `middlewares()` dentro del constructor, se haga antes del llamado de `routes()`, de lo contrario no será reconocido el contenido estático:

```js
class Server {
    constructor() {
        ...
        this.middlewares()
        this.routes()
    }
    ...
}
```

## Peticiones HTTP (GET - PUT - POST - DELETE)

Dentro del método de rutas de nuestro Server, vamos a crear una ruta que al ingresar a un determinado path, nos retorne una respuesta en formato JSON:

```js
class Server {
    ...
    routes() {
        this.app.get('/api', (req, res) => {
            res.json({
                msg: 'get data from API'
            })
        })
    }
}
```

También podemos manejar diversos códigos de estado dentro de nuestra respuesta. Por ejemplo un error 403 solo de decoración por el momento:

```js
class Server {
    ...
    routes() {
        this.app.get('/api', (req, res) => {
            res.status(403).json({
                status: 403,
                msg: 'Unauthorized response'
            })
        })
    }
}
```

Hasta el momento solo hemos manejado el método get, pero Express nos facilita mucho el trabajo al proveernos de los métodos:

```js
class Server {
    ...
    routes() {
        this.app.get('/api', (req, res) => res.json({ msg: 'get data from API' }))

        this.app.put('/api', (req, res) => res.json({ msg: 'put data to API' }))

        this.app.post('/api', (req, res) => res.json({ msg: 'post data to API' }))

        this.app.delete('/api', (req, res) => res.json({ msg: 'delete data from API' }))
    }
}
```

## Códigos de respuestas HTTP

Es muy importante que nuestros servicios siempre retornen un código de respuesta dependiendo de lo que suceda. Existe un estándar que se muestra en el siguiente PDF:

- [HTTP Response Codes](./http-response-codes.pdf)

## Usando códigos de respuesta HTTP en Express

Como se alcanzo a mostrar anteriormente, podemos hacer cambios en los estado de respuesta al añadir el método `status()` a la response, por ejemplo un estatus 201 luego de crear un elemento:

```js
class Server {
    ...
    routes() {
        this.app.post('/api', (req, res) =>  res.status(201).json({ msg: 'Post data in API' }))
    }
}
```

## CORS - Middleware

Vamos a instalar un paquete llamado cors el cual se usa para activar el CORS (intercambio de recursos cruzados - Cross-origin resource sharing) con varias opciones, permitiendo la conexión con otros dominios o solo en un dominio privado. Los instalamos mediante el comando `npm i cors`.

Para el uso del paquete, dentro de la clase Server, en el método `middlewares()` hacemos uso de dicho middleware.

```js
const cors = require('cors')

class Server {
    ...
    middlewares() {
        this.app.use(cors())
        ...
    }
    ...
}
```

## Separar las rutas y el controlador de la clase

Creamos un nuevo archivo dentro del directorio `routes` llamado `user.routes.js`. Dentro de este archivo vamos a desestructurar un método llamado `Router`, y creamos una variable que guarde su valor. Esta variable la usamos en lugar de `this.app`, puesto que nos hemos traido todas las rutas de la clase Server. Además, eliminamos los paths de estas rutas.

```js
const { Router } = require('express')

const router = Router()

router.get('/', (req, res) => res.json({ msg: 'get data from API' }))
router.put('/', (req, res) => res.json({ msg: 'put data to API' }))
router.post('/', (req, res) => res.json({ msg: 'post data to API' }))
router.delete('/', (req, res) => res.json({ msg: 'delete data from API' }))

module.exports = router
```

Y ahora, para llamar las rutas dentro del método `routes()` de la clase Server, aplicamos un middleware, con el que configuramos el path de las rutas:

```js
class Server {
    constructor() {
        ...
        this.usersPath = '/api/users'
        ...
    }
    ...
    routes() {
        this.app.use(this.usersPath, require('../routes/user.routes'))
    }
}
```

También vamos a crear un controlador en la carpeta `controllers` para los funciones de las rutas, dicho archivo se llama `users.controller.js`. Las funciones solo son la copia de lo que teníamos al momento dentro de las rutas. Es importante definir a que hago referencia con `res`, puesto que no sabra de donde viene el método de `.json()` o `.status()`, para ello desestructuramos la variable `response` de Express.

```js
const { response } = require('express')


const usersGet = (req, res = response) => res.json({ msg: 'get data from API - controller' })
const usersPost = (req, res = response) => res.json({ msg: 'post data to API - controller' })
const usersPut = (req, res = response) => res.json({ msg: 'put data to API - controller' })
const usersDelete = (req, res = response) => res.json({ msg: 'delete data from API - controller' })


module.exports = {
    usersGet,
    usersPost,
    usersPut,
    usersDelete
}
```

Ahora dentro de las rutas hacemos referencia a los métodos controller, más no los ejecutamos (ejecutar un método = `metodo()`, referenciarlo = `metodo`):

```js
const { usersGet, usersPost, usersPut, usersDelete } = require('../controllers/users.controller')

router.get('/', usersGet)
router.post('/', usersPost)
router.put('/', usersPut)
router.delete('/', usersDelete)
```

## Obtener datos de un POST

Para poder recibir la información que se pasa por el método POST debemos usar un middleware de Express que nos brinda esa funcionalidad y parsea a JSON lo que recibe.

```js
class Server {
    ...
    middlewares() {
        ...
        this.app.use(express.json())
        ...
    }
    ...
}
```

Luego en el controlador de la ruta, creamos una variable que almacene el cuerpo de la petición, y por ejemplo lo podemos pasar de nuevo por la respuesta. Recordar que con el middleware ya se ha convertido en JSON.

```js
const usersPost = (req, res = response) => {
    const body = req.body
    res.json({ 
        msg: 'post data to API - controller',
        body
    })
}
```

## Parámetros de segmento y query

Tenemos el ejemplo de querer actualizar un elemento según su id. En ese caso, debemos poder capturarlo desde el endpoint. Para ello le ponemos un nombre a los que esperamos por parámetro, y ya Express lo captura como variable:

```js
router.put('/:id', usersPut)
```

Luego, para poder obtener el id, recibimos los parámetros que se le pasan al request y desestructuramos el id.

```js
const usersPut = (req, res = response) => {
    const { id } = req.params
    res.json({ 
        msg: 'put data to API - controller', 
        id 
    })
}
```

En caso de que tengamos más parámetros, los cuales pueden ser opcionales hacemos lo siguiente:

```js
const { request, response } = require('express')

const usersGet = (req = request, res = response) => {
    const query = req.query
    res.json({
        msg: 'get data from API - controller',
        query
    })
}
```

Y si queremos valores más exactos usamos la desestructuración, y en algunos casos con valores por defecto en caso de que no los pasen por el request:

```js
const usersGet = (req = request, res = response) => {
    const { q, nombre = 'No Name', apikey, page = 1, limit = 10 } = req.query
    res.json({
        msg: 'get data from API - controller',
        q,
        nombre,
        apikey,
        page, 
        limit
    })
}
```

## Respaldo del RESTServer en GitHub

Con el archivo `.gitignore` descartamos la subida de los datos de node_modules. Cuando creamos un repositorio, tenemos la oportunidad de volver a versiones anteriores, y en caso de recuperar los datos de la última versión usamos el comando `git checkout -- .`

También podemos crear release tag, para poder descargar versiones del proyecto, para ello usamos el comando: `git tag -a v1.0.0 -m "Mensaje del Tag"` y luego `git push --tags`.

## Desplegar el RESTServer a Heroku

Seguimos la documentación de Heroku CLI, con el proyecto en un directorio aparte. Es importante que antes de subir el proyecto se configure la sección de `scripts` dentro del `package.json`:

```js
{
    "scripts": {
        "start": "node app.js",
        ...
    },
}
```

## Pro Tip: Ambiente de producción y desarrollo en Postman

Para crear entornos en Postman, ingresamos a la opción de **Enviroments**, le damos a **+**, cambiamos el nombre, creamos una variable url en la cual ponemos un valor inicial y un valor actual.

Cuando queremos usar dicha variable, nos vamos a las peticiones, seleccionamos el entorno y escribimos:

```js
{{url}}/<nuevos parametros>
```

También podemos hacer esto con la extensión para VSCode llamada **Thunder Client**. Presionamos `ctrl + shift + p` y buscamos **Mostrar Client Thunder**. Seguimos los mismos pasos de Postman.
