# Sección 6: Aplicación de Clima - GeoLocation + OpenWeatherMaps

La sección se enfoca en los siguientes temas:

- Consumo de APIs
- Llamadas HTTP hacia servidores externos
- Paquete request - superficialmente
- Paquete Axios
- Mapbox places para obtener lugares por nombre
- Uso de OpenWeather para obtener el clima
- Aplicación de consola con historial
- Variables de entorno

## Inicio del proyecto

Para poder hacer uso de paquetes, creamos el archivo `package.json` automaticamente mediante el comando `npm init -y`. Dentro de dicho archivo configuramos el comando para iniciar el servidor. En la sección de `"scripts"` añadimos un nuevo elemento:

```json
{
    ...,
    "scripts": {
        "start": "node app.js",
        ...
    },
    ...
}
```

Con esa configuración podemos ejecutar tanto `node app.js` o `npm start`. También vamos a instalar el paquete de Colors e Inquirer, ambos los instalamos en un solo comando: `npm i colors inquirer`.

De la sección anterior, volvemos a utilizar el archivo `helpers/inquirer.js`, obviamente lo vamos a modificar.

## Menú de la aplicación

Definimos el menú a mostrar dentro de `inquirerMenu()`:

```js
const inquirerMenu = async () => {
    const preguntas = [
        {
            type: 'list',
            name: 'opcion',
            message: '¿Que desea hacer?',
            choices: [
                {
                    value: 1,
                    name: `${'1.'.green} Buscar ciudad`
                },
                {
                    value: 2,
                    name: `${'2.'.green} Historial`
                },
                {
                    value: 0,
                    name: `${'0.'.green} Salir\n`
                }
            ]
        }
    ]
    ...
    const { opcion } = await inquirer.prompt(preguntas)
    return opcion
}
```

Luego hacemos uso del mismo dentro del método `main()` de `app.js`:

```js
const { inquirerMenu, inquirerPausa } = require("./helpers/inquirer")

const main = async () => {
    let opt = 0

    do {
        opt = await inquirerMenu()

        switch (opt) {
            case 1: break;
            case 2: break;
            default: break;
        }

        opt !== 0 && await inquirerPausa()
    } while (opt !== 0);
}
```

## Modelo para controlar la aplicación

Necesitamos un modelo que pueda controlar las búsquedas que hacemos, para ello, creamos una clase dentro del archivo `models/busquedas.js`:

```js
class Busquedas {
    historial = []

    constructor() {
        // TODO: Leer DB si existe
    }

    
    async ciudad(lugar=''){
        // TODO: Petición HTTP
        return []
    }
}

module.exports = Busquedas
```

Dicho modelo lo instanciamos dentro del método `main()`:

```js
const main = async () => {
    let busqueda = new Busquedas()
    ...
}
```

También definimos parte del esqueleto de como va a funcionar la aplicación cuando se ingrese la opción 1:

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            case 1: 
                // TODO: Mostrar Mensaje ✔️
                const lugar = await inquirerLeerInput('Ciudad: ')
                // TODO: Buscar los lugares
                // TODO: Seleccionar el lugar
                // TODO: Datos del clima
                // TODO: Mostrar Resultados
                console.log(`\nInformación de la ciudad\n`.green)
                console.log(`Ciudad: `)
                console.log(`Latitud: `)
                console.log(`Longitud: `)
                console.log(`Temperatura: `)
                console.log(`Temp. Minima: `)
                console.log(`Temp. Máxima: `)
            break;
            ...
        }
        ...
    } while (opt !== 0);
}
```

## Realizar peticiones HTTP desde Node

Para hacer las peticiones a otro backend que se encuentra en internet, usaremos axios. Para instalarlo, usamos el comando `npm i axios`. Tenemos la intención que se haga la búsqueda de un lugar que ingrese el usuario por terminal, entonces creamos el siguiente esqueleto dentro de la función de `ciudad()` en la clase Busquedas:

```js
class Busquedas {
    ...
    async ciudad(lugar=''){
        // TODO: Petición HTTP
        try {
            const res = axios.get()
            return []
        } catch (error) {
            return []
        }
    }
}
```

Luego simulamos como vamos a aplicar la búsqueda en el método `main()`:

```js
const main = async () => {
    let busqueda = new Busquedas()
    ...
    do {
        ...
        switch (opt) {
            case 1: 
                const lugar = await inquirerLeerInput('Ciudad: ')
                await busqueda.ciudad(lugar)
                ...
            break;
            ...
        }
        ...
    } while (opt !== 0);
}
```

## Mapbox Search API y Token de acceso

Entramos a [Mapbox](https://www.mapbox.com/) y creamos una cuenta para poder acceder a su API. Una vez registrados y logeados accedemos a la función de *Tokens*, en donde creamos un token nuevo que tenga seleccionado todos los *Public Scopes*. Dentro de nuestro proyecto creamos un archivo para guardar el Token. Ese es el enlace para la documentación de [Geocoding](https://docs.mapbox.com/api/search/geocoding/)

## Crear instancias de Axios

Dentro de la clase Busquedas creamos un método get con el que definimos los parámetros que se pasan a la url que accede a la API, en estos momentos solo necesitamos el token de acceso, el limite de respuesta y el lenguaje de las respuestas.

```js
class Busqueda {
    ...
    get paramsMapbox() {
        return {
            'access_token': `pk.eyJ1IjoiY2FybG9zLXBhZXpmIiwiYSI6ImNrd3pqNzBubTB2b2Uyb2tqcXY4NmQxd24ifQ.2j5R5ToMiXg3xOR8OMgdVw`,
            'limit': 6,
            'language': 'es'
        }
    }
}
```

Dentro del método `ciudad()` de la clase Busquedas, creamos una instancia de axios que tenga una URL base, y un objeto con los parámetros que se le uniran, los cuales los podemos obtener el método get `paramsMapbox()`

```js
class Busquedas {
    ...
    async ciudad(lugar = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            })
            const res = await instance.get()
            return []
        } catch (error) {
            return []
        }
    }
}
```

## Variables de Entorno

Podemos usar un paquete para determinar las variables de entorno como el token de mapbox. El paquete se llama dotenv y lo instalamos con el comando `npm i dotenv`. Luego, creamos un archivo llamado `.env` en el que almacenamos nuestras variables. Dentro del archivo `app.js` hacemos la siguiente importación:

```js
require('dotenv').config()
```

Dentro del método get `paramsMapbox()`, cambiamos el token de acceso por:

```js
get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            ...
        }
    }
```

El archivo `.env` no será subido al repositorio, pero si un archivo `.example.env`

## Listar los países de manera interactiva

Como ya estamos recibiendo un string con el lugar a buscar, podemos extraer la `data` de los valores resultantes que nos envia la API. De dicha `data`, accedemos a su propiedad de `features`, la cúal mapeamos y retornamos un nuevo arreglo que contenga objetos con propiedades de id, nombre, longitud y latitud.

```js
class Busquedas {
    ...
    async ciudad(lugar = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            })
            const { data } = await instance.get()
            return data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))
        } catch (error) {
            return []
        }
    }
}
```

Dentro del archivo `inquirer.js` creamos o cambiamos un método llamado `inquirerListadoLugares()`, el cual recibe un arreglo de lugares, con las cuales creamos las opciones para lista seleccionable que nos proporciona Inquirer. Por cada lugar dentro del arreglo, retornamos un valor y un nombre.

```js
const inquirerListadoLugares = async (lugares = []) => {
    const choices = lugares.map((lugar, i) => {
        const idx = `${i+1}`.green
        return {
            value: lugar.id,
            name: `${idx}. ${lugar.nombre}`
        }
    })

    choices.unshift({
        value: '0',
        name: '0.'.green + ' Cancelar'
    })

    const preguntas = [{
        type: 'list',
        name: 'id',
        message: 'Seleccione el lugar',
        choices
    }]

    const { id } = await inquirer.prompt(preguntas)
    return id
}
```

En el método `main()`, en caso de que la opción sea 1, leemos el termino a buscar, luego hacemos la busqueda de las ciudades que coinciden con ese termino, los cuales son pasados al método que nos listan los lugares y obtenemos el id seleccionado. Creamos una variable que busque dentro del arreglo anterior de lugares el objeto que coincida con la id que se obtuvo de la selección. Con dicho id se muestra la información del nombre, latitud y longitud.

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            case 1: 
                const termino = await inquirerLeerInput('Ciudad: ')
                const lugares = await busqueda.ciudad(termino)
                const id = await inquirerListadoLugares(lugares)
                const lugarSeleccionado  = lugares.find(l => l.id === id)

                // TODO: Datos del clima
                // TODO: Mostrar Resultados
                console.log(`\nInformación de la ciudad\n`.green)
                console.log(`Ciudad: ${lugarSeleccionado.nombre}`)
                console.log(`Latitud: ${lugarSeleccionado.lat}`)
                console.log(`Longitud: ${lugarSeleccionado.lng}`)
                ...
            break;
            ...
        }
        ...
    } while (opt !== 0);
}
```

## OpenWeather - Información del clima

Ingresamos a [OpenWeather](https://openweathermap.org/) y nos registramos. Luego entramos a la sección de *API keys* y creamos un token para el acceso de nuestra aplicación. Dicho token lo guardamos en las variables de entorno. De todas las APIs que nos ofrecen, nos interesa la que se llama **Current Weather Data** y dentro de dicha documentación nos dirigimos a [By geographic coordinates](https://openweathermap.org/current#geo).

## Obtener información del clima del lugar seleccionado

Dentro de la clase Busquedas creamos un método para definir algunos de los parámetros que usaremos junto a la URL que nos permite acceder a la API que necesitamos para el clima. Este será un método get.

```js
class Busquedas {
    ...
    get paramsOpenWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }
}
```

También creamos un método que nos permita obtener el clima mediante una petición con axios. Creamos una instancia que tenga una URL base, y luego le pasamos los parámetros. Aquí debo hacer la aclaración de que como el método solicita la latitud y la longitud por parámetros, pero a la vez no los tenemos en el objeto que nos regresa el método get `paramsOpenWeather()`, usamos un objeto que tenga los elementos de longitud y latitud, y pasamos una copia del contenido del objeto del método get, de esa manera podemos añadir más parámetros.

Luego hacemos la petición, y de la respuesta desestructaremos los elementos de `weather` y `main`, los cuales almacenan la información que queremos retornar dentro del objeto. Como `weather` es un arreglo que contiene a un objeto, accedemos a su primera posición y luego si podemos obtener la información.

```js
class Busquedas {
    ...
    async clima(lat = '', lon = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {lat, lon, ...this.paramsOpenWeather}
            })
            const res = await instance.get()
            const { weather, main } = res.data
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (error) {
            return ''
        }
    }
}
```

En el método `main()`, luego de obtener la información geografica de la ciudad, usamos el método para consultar el clima, pasandole los parámetros que require. Finalmente, de los datos resultantes, terminamos de llenar la información en consola.

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            case 1: 
                const termino = await inquirerLeerInput('Ciudad: ')
                const lugares = await busqueda.ciudad(termino)
                const id = await inquirerListadoLugares(lugares)
                const lugarSeleccionado  = lugares.find(l => l.id === id)

                const clima = await busqueda.clima(lugarSeleccionado.lat, lugarSeleccionado.lng)

                console.clear()
                console.log(`\nInformación de la ciudad\n`.green)
                console.log(`Ciudad: ${lugarSeleccionado.nombre.blue}`)
                console.log(`Latitud: ${lugarSeleccionado.lat}`)
                console.log(`Longitud: ${lugarSeleccionado.lng}`)
                console.log(`Temperatura: ${clima.temp}`)
                console.log(`Temp. Minima: ${clima.min}`)
                console.log(`Temp. Máxima: ${clima.max}`)
                console.log(`El clima está: ${clima.desc.italic.magenta}`)
            break;
            ...
        }
        ...
    } while (opt !== 0);
}
```

## Persistencia de las búsquedas

Dentro de la clase Busquedas creamos un método que nos permita agregar el lugar buscado a un historial. Lo primero es comparar si el lugar no ha sido buscado antes, por que en tal caso, no se agregara al arreglo. Una vez se tenga que es un lugar nuevo, se guarda el lugar en la primera posición del arreglo y se activa el método de guardar en base de datos.

El método para guardar en la base de datos escribe un archivo en un determinado path y la información que se le envía es el arreglo del historial.

```js
class Busquedas {
    ...
    historial = []
    path = './db/database.json'
    ...
    agregarHistorial(lugar = '') {
        if (this.historial.includes(lugar.toLowerCase())) return
        this.historial.unshift(lugar.toLowerCase())
        this.guardarDB()
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync(this.path, JSON.stringify(payload))
    }
}
```

Dentro del método `main()`, hacemos una validación para saber si la selección por parte del usuario no es 0, por qué de ser así, se debe continuar con el menú. Si la selección es valida, entonces procedemos a agregar el nombre del lugar seleccionado dentro del historial.

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            case 1: 
                ...
                if (id === 0) continue
                busqueda.agregarHistorial(lugarSeleccionado.nombre)
                ...
            break;
            ...
        }
        ...
    } while (opt !== 0);
}
```

Podemos hacer una búsqueda temporal de los elementos que se encuentren dentro del arreglo del historial a manera de revisión.

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
            case 2: 
                busqueda.historial.forEach((lugar, i) => {
                    const idx = `${i+1}.`.green
                    console.log(`${idx} ${lugar}`)
                })
            break;
            ...
        }
        ...
    } while (opt !== 0);
}
```

## Leer del archivo JSON

Para leer los archivos del JSON, creamos un método que permita verificar la existencia del archivo, y luego extraiga la información del mismo, y pase al arreglo historial los elementos que se encuentre bajo ese nombre.

```js
class Busquedas {
    ...
    leerDB() {
        if (!fs.existsSync(this.path)) return
        const info = fs.readFileSync(this.path, { encoding: 'utf-8' })
        const data = JSON.parse(info)
        this.historial = data.historial
    }
}
```

También se creó un método que permita devolver la información de historial de manera Capitalizada. Para ello, se toma el arreglo del historial, por cada elemento se hace una separación por espacios y por cada nuevo elemento generado por la función `split()`, lo mapeamos y a la primera posición se le pone mayuscula y se le une el resto de elementos desde la posición 1. Finalmente se une todo el elemento del historial con espacios.

```js
class Busquedas {
    ...
    get historialCapitalizado() {
        return this.historial.map(h => {
            let palabras = h.split(' ')
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1))
            return palabras.join(' ')
        })
    }
}
```

Finalmente, en el método `main()` podemos llamar el nuevo arreglo generado por el método get `historialCapitalizado()`, el cual ya esta persistido en nuestra "Base de datos".

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
            case 2: 
                busqueda.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+1}.`.green
                    console.log(`${idx} ${lugar}`)
                })
            break;
            ...
        }
        ...
    } while (opt !== 0);
}
```
