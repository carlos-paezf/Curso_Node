# Sección 7: WebServer - HTTP - EXPRESS - HBS

Aquí cubriremos varios temas como:

- Uso y configuración de Express
- Servir contenido estático
- Servir contenido dinámico
- Template engines
- Handebars
- Parciales
- Variables
- Despliegues en Heroku
- Hacer carpetas públicas en la web
- Desplegar aplicaciones de Angular y React

## Inicio del proyecto WebServer

Creamos el `package.json` por defecto mediante el comando `npm init -y`. También creamos el archivo `app.js`. En este proyecto estaremos usando nodemon, por lo que ingresamos el comando `nodemon app`.

Si entramos a la documentación de Node.js, podremos encontrar una sección para HTTP, en nuestro caso requerimos crear un servidor, por lo que nos dirigimos a la sección de [http.createServer([options][, requestListener])](https://nodejs.org/docs/latest-v14.x/api/http.html#http_http_createserver_options_requestlistener). La manera en que creamos los primeros pasos de nuestro servidor será de la siguiente manera:

Importamos el paquete de Node `http`:

```js
const http = require('http')
```

Creamos un servidor que reciba un callback con una petición y una respuesta, y que además nos escuche por un puerto determinado.

```js
http.createServer((req, res) => {
    res.write('Hola mundo')
    res.end()
}).listen(8080)
```

Como mantenemos el servidor arriba gracias a nodemon, podemos ir a un navegador e ingresar la ruta `http://localhost:8080/`, en la cuál podemos observar un texto que se ha pasado mediante `res.write()`.

Por decisión propia, he decidido crear un archivo `.env` y un `.example.env`, en los que guardare las variables de entorno, como por ejemplo el Puerto. Para usarlas requiero instalar la librería ***dotenv*** con el comando `npm i dotenv`, por lo que ahora nuestro servidor escuchara por el puerto de la siguiente manera:

```js
require('dotenv').config()

http.createServer((req, res) => {
    ...
}).listen(process.env.PORT)
```

## Request y Response

Request es la petición del cliente que hace al WebServer, y response el la respuesta luego de procesar la petición. Para observar la petición podemos escribir:

```js
http.createServer((req, res) => {
    console.log(req)
}).listen(process.env.PORT)
```

También podemos escribir el código de respuesta a la petición, por ejemplo un código 404:

```js
http.createServer((req, res) => {
    res.writeHead(404)
    res.write('404 | Page no found')
    res.end()
}).listen(process.env.PORT)
```

También podemos definir el `Content-Type` de los headers, el cual podemos observar si vamos a la opción de *Inspeccionar* dentro del navegador, en la sección de *Red*, en el nombre de la solicitud, en el apartado de los *Encabezados*, y dentro de *Encabezados de respuesta*:

```js
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    const person = {
        id: 1,
        name: 'David Ferrer'
    }
    res.write(JSON.stringify(person))
    res.end()
}).listen(process.env.PORT)
```

También podemos definir el nombre de un archivo a descargar, por ejemplo de un CSV, para ello modificamos el `Content-Disposition` y le añadimos un archivo adjunto o attachment que tenga determinado nombre:

```js
http.createServer((req, res) => {
    res.setHeader('Content-Disposition', 'attachment; filename=lista.csv')
    res.writeHead(200, { 'Content-Type': 'application/csv' })
    res.write('id, person\n')
    res.write('1, Carlos\n')
    res.write('2, David\n')
    res.write('3, Ferrer\n')
    res.end()
}).listen(process.env.PORT)
```

Cómo podemos observar, aunque es solo una ruta, el tratamiento de la request y de la response es muy largo. Una solución que tenemos es usar EXPRESS.

## Introducción a EXPRESS

Vamos a limpiar nuestro archivo `app.js`, y vamos a instalar el paquete de ***express*** con el comando `npm i express`. Dentro de nuestro archivo principal escribimos la siguiente prueba:

```js
require('dotenv').config()

const express = require('express')
const app = express()


app.get('/', (req, res) => {
    res.send('Hello world')
})

app.listen(process.env.PORT)
```

Si miramos el código, nos daremos cuenta que solo está cubriendo la ruta de `/`, si intentamos ingresar a cualquier otra ruta que no tengamos definida, nos dará esta respuesta `Cannot GET /<nombre de la ruta>`. Aunque también lo podemos personalizar al crear una ruta de comodin:

```js
app.get('*', (req, res) => {
    res.send('404 | Page no found')
})
```

También podemos añadir un mensaje personalizado del puerto en que se escucha la aplicación:

```js
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Escuchando en http://localhost:${PORT}`);
})
```

## Servir contenido estático

Podemos mostrar un contenido estático dentro de nuestra aplicación, para ello creamos una carpeta llamada `public`, dentro de la cual añadimos un archivo `index.html` con un contenido determinado. Para hacer uso del mismo en la ruta de `/`, solo escribimos lo siguiente:

```js
app.use(express.static('public'))

/* app.get('/', (req, res) => {
    res.send('Hello world')
}) */
```

Si queremos un archivo especifico dentro de una ruta, creamos una carpeta en el directorio `public` con el nombre de la ruta y dentro un archivo `index.html` y eliminamos la ruta que se obtiene con express, ya que se la prioridad al contendido estático. O podemos crear un archivo html dentro de la carpeta `public` y lo añadimos a nuestra configuración de express de la siguiente manera:

```js
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/404.html')
})
```

## Servir un sitio web completo

Descargamos una plantilla llamada Road Trip by Templated, con la que al tener sus archivos dentro de nuestra carpeta `public`, podemos simular una pequeña aplicación. De dicho template contamos con 3 enlaces, los cuales para hacer funcionar tenemos este código:

```js
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/generic', (req, res) => {
    res.sendFile(__dirname + '/public/generic.html')
})

app.get('/elements', (req, res) => {
    res.sendFile(__dirname + '/public/elements.html')
})
```

## Handlebars - HBS

Vamos a instalar Handlebars.js mediante el comando `npm i hbs` que nos ayuda a utilizarlo con Express. Esta es una librería que nos permite tener la lógica de la vista separada del código.

Para usar Handlebars, escribimos el siguiente código en el `app.js`:

```js
app.set('view engine', 'hbs')
```

Los archivos de las vistas que obtuvimos del template, los pasamos a una nueva carpeta llamada `public/templates`. Luego, creamos una nueva carpeta llamada `./views` en la cual añadimos un archivo llamado `home.hbs`. Dentro de dicho archivo copiamos todo el contenido de `templates/index.html`. Volviendo a nuestro archivo `app.js`, para poder renderizar el home, añadimos el siguiente código:

```js
app.get('/', (req, res) => {
    res.render('home')
})
```

## Argumentos desde el controlador

Para pasar argumentos a nuestra vista desde el controlador, ocupamos que pasemos un segundo parámetro al método `render()` de la respuesta:

```js
app.get('/', (req, res) => {
    res.render('home', {
        nombre: 'David Ferrer',
        titulo: 'Curso de Node'
    })
})
```

Posteriormente, en la vista, traemos los parámetros mediante 2 llaves `{{ }}`:

```html
<div class="logo"><a href="/">{{ titulo }} <span>by {{ nombre }}</span></a></div>
```

## Usando parciales con HBS

Los parciales nos sirven para reutilizar código de nuestras vistas. Por ejemplo queremos reutilizar el header. Primero creamos una carpeta llamada `views/partials`, dentro creamos un archivo llamado `header.hbs`, y copiamos todo el elemento del header.

Para registar los parciales, requerimos la siguiente configuración en `app.js`:

```js
const hbs = require('hbs')

hbs.registerPartials(__dirname + '/views/partials')
```

Y en la template donde queremos reutilizar el header escribimos:

```js
{{> header}}
```

## Preparar WebServer para subirlo a un Hosting

Se necesita tener configurada una variable de entorno para el puerto, y la configuración de `start`.

```env
PORT =
```

```json
{
    "scripts": {
        "start": "node app.js",
        ...
    },
}
```

## Heroku, subiendo nuestra aplicación a producción

Necesitamos una cuenta en Heroku, dentro del Dashboard le damos a New, seguimos los pasos, y luego para hacer el deploy debemos instalar o verificar el CLI de Heroku y seguimos la documentación que nos ofrece Heroku.

## Desplegar aplicaciones de Angular y React

Debemos tener una versión de producción de nuestro frontend para poder usarlo dentro del directorio de `public`. Debemos configurar las rutas dentro de Express y descartamos HBS, puesto que solo nos sirve para aplicaciones pequeñas.
