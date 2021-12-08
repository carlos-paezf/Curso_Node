# Sección 5: Aplicación de Consola Interactiva - Tareas por hacer

El objetivo es que creemos una aplicación de consola interactiva, con opciones que se puedan seleccionar con las teclas direccionales, números y con la tecla espaciadora cuando hay multiples opciones.

Puntualmente sería:

- stdin
- stdout
- Ciclos
- Inquirer
- Clases en JavaScript
- Archivos JSON
- Fuertemente async y await
- Transformaciones

Esta es una aplicación real que les puede servir mucho cuando tengan que crear alguna aplicación de consola.

## Inicio del proyecto

Se ha creado el directorio que contendrá el proyecto y ademas se ha ingresado el siguiente comando en consola para generar el package.json: `npm init - y`. Además se instala el paquete de Colors con `npm i colors` y lo usamos en `app.js` así:

```js
require('colors')
```

## stdin - stdout - Readline

Iniciamos creando un método `main()` dentro del archivo `app.js`, con el cual vamos a llamar las funciones principales de la aplicación.

```js
const main = async () => {}

main()
```

Posteriormente creamos un directorio para las funciones, en este caso sera `helpers`. El archivo `mensaje.js` tendrá las funciones de `mostrarMenu()` y `pausa()`, los cuales también exportamos:

```js
const mostrarMenu = () => {}

const pausa = () => {}


module.exports = {
    mostrarMenu,
    pausa
}
```

Ahora bien para ambos métodos requerimos del modulo `readline`, del cuál vamos a usar el método de `createInterface()`, en el que definimos un objeto para las procesos de entradas y salida.

```js
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})
```

Ahora bien, para el método de `mostrarMenu()` hacemos una pregunta que espere una opción, mientras que para `pausa()` lanzamos una pregunta que espere que se pulse Enter.

```js
readline.question('Seleccione una opción: ', (opt) => {
    readline.close()
})
```

```js
readline.question(`\nPresionse ${'ENTER'.cyan} para continuar\n`, (opt) => {
    readline.close()
})
```

## Repetir el menú de forma infinita

Es importante que esperemos y devolvamos el valor que el usuario ingresa, esto lo podemos hacer con async y await, pero en este caso la solución más sencilla es con `Promise()`. Para el método de `mostrarMenu()` encerramos la lógica de nuestro método dentro de la promesa y resolvemos con la opción ingresada:

```js
const mostrarMenu = () => {
    return new Promise(resolve => {
        ...

        readline.question('Seleccione una opción: ', (opt) => {
            readline.close()
            resolve(opt)
        })
    })
}
```

Y hacemos algo similar para `pausa()`:

```js
const pausa = () => {
    return new Promise(resolve => {
        ...

        readline.question(`\nPresionse ${'ENTER'.cyan} para continuar\n`, (opt) => {
            readline.close()
            resolve()
        })
    })
}
```

Ahora bien, una vez que hemos podido capturar los valores que el usuario ingresa, debemos usarlos para mostrar el menú o para salir de la aplicación. El ciclo debe ser un `do{} while()`, ya que nos permite ejecutar el método si o si una vez, y luego se hacen las validaciones. Definimos una variable que va a tomar el valor de la opción que se retorna de esperar `mostrarMenu()` y la usamos para el análisis de si salimos de la aplicación o mostramos la pausa:

```js
const main = async () => {
    console.clear()

    let opt = '0'
    do {
        opt = await mostrarMenu()
        console.log({opt})
        opt !== '0' && await pausa()
    } while (opt !== '0')
}
```

## Construir el menú interactivo - Inquirer

Para la instalación de Inquirer, usamos el comando `npm i inquirer`. Ya vimos como se puede ir creando el menú de manera manual, pero aún no podiamos capturar los valores seleccionados. Por medio del paquete Inquirer, tenemos la ventaja de crear un menú que capture la selección.

Lo primero que vamos a hacer es crear un archivo para el uso de Inquirer, `helpers/inquirer.js`. Dentro de este archivo definimos el las preguntas a mostrar:

```js
const preguntas = [
    {
        type: 'list',
        name: 'opcion',
        message: '¿Que desea hacer?',
        choices: [
            'opt1',
            'opt2',
            'opt3'
        ]
    }
]
```

Luego hacemos el menú apoyandonos en Inquirer y Colors, y lo exportamos:

```js
const inquirer = require('inquirer')
require('colors')


const inquirerMenu = async () => {
    console.clear()
    console.log('=================================='.blue)
    console.log('Seleccione una opción'.underline.blue)
    console.log('==================================\n'.blue)

    const opt = await inquirer.prompt(preguntas)

    return opt
}


module.exports = {
    inquirerMenu
}
```

Dentro de `app.js` cambiamos el método para la creación del menú:

```js
const { inquirerMenu } = require('./helpers/inquirer')

const main = async () => {
    ...
    do {
        opt = await inquirerMenu()
        ...
    } while (opt !== '0')
}
```

## Opciones del menú interactivo

Procedemos a crear las opciones para el menú que se usara con inquirer, para ello modificamos la propiedad de `choices` en nuestra variable `preguntas`:

```js
const preguntas = [
    {
        ... ,
        choices: [
            {
                value: '1',
                name: `${'1.'.green} Crear Tarea`
            },
            {
                value: '2',
                name: `${'2.'.green} Listar Tarea`
            },
            {
                value: '3',
                name: `${'3.'.green} Listar Tareas Completadas`
            },
            {
                value: '4',
                name: `${'4.'.green} Listar Tareas Pendientes`
            },
            {
                value: '5',
                name: `${'5.'.green} Completar Tarea(s)`
            },
            {
                value: '6',
                name: `${'6.'.green} Eliminar Tarea`
            },
            {
                value: '0',
                name: `${'0.'.green} Salir\n`
            }
        ]
    }
]
```

Además como tenemos que dentro de `preguntas`, en la propiedad de `name`, hemos puesto `opcion`, podemos hacer una desestructuración del mismo para retornarlo como valor de `inquirerMenu()`:

```js
const inquirerMenu = async () => {
    ...
    const { opcion } = await inquirer.prompt(preguntas)
    return opcion
}
```

También vamos a cambiar el método para la pausa, y ahora usaremos inquirer para dicha funcionalidad:

```js
const inquirerPausa = async () => {
    const pausa = [
        {
            type: 'input',
            name: 'opcion',
            message: `Pulsa ${'ENTER'.cyan} para continuar`
        }
    ]
    console.log('\n')
    await inquirer.prompt(pausa)
}


module.exports = {
    ... ,
    inquirerPausa
}
```

Y el método de `inquirerPausa()` lo usamos en reemplazo de `pausa()` en el método `main()`:

```js
const { inquirerPausa } = require('./helpers/inquirer')

const main = async () => {
    ...
    do {
        ...
        opt !== '0' && await inquirerPausa()
    } while (opt !== '0')
}

```

## Lógica para el manejo de las tareas por hacer

Lo primero que hacemos es crear una clase para crear una tarea, para ello creamos un archivo llamado `models/tarea.js`. También vamos a usar la librería UUID, con la que generaremos identificadores únicos para las tareas. Para instalar dicho paquete usamos el comando `npm i uuid`.

La clase `Tarea` va a recibir una descripción, mientras que el id será automatico y la fecha de creación por el momento será null.

```js
const { v4: uuidV4 } = require('uuid')


class Tarea {
    id = ''
    desc = ''
    completadoEn = null

    constructor(desc) {
        this.id = uuidV4()
        this.desc = desc
        this.completadoEn = null
    }
}


module.exports = Tarea
```

Ahora bien, para poder manejar varias tareas vamos a crear otra clase dentro del archivo `models/tareas.js`, el cual va a guardar un arreglo con las tareas que se creen:

```js
class Tareas {
    _listado = {}

    constructor() {
        this._listado = {}
    }
}


module.exports = Tareas
```

Podemos ver el funcionamiento de lo que hemos hecho, si ponemos lo siguiente en el método `main()`:

```js
const Tarea = require('./models/tarea')
const Tareas = require('./models/tareas')


const main = async () => {
    const tareas = new Tareas()
    const tarea = new Tarea('Ganarle a Thanos')
    console.log(tarea)

    tareas._listado[tarea.id] = tarea
    console.log(tareas)
}


main()
```

Con lo anterior tenemos la siguiente impresión en consola, que se asemeja al manejo de datos en BBDD no relacionales:

```txt
Tarea {
  id: 'e85c286d-ac00-4c2b-9430-f0c859b4d176',   
  desc: 'Ganarle a Thanos',
  completadoEn: null
}

Tareas {
  _listado: {
    'e85c286d-ac00-4c2b-9430-f0c859b4d176': Tarea {
      id: 'e85c286d-ac00-4c2b-9430-f0c859b4d176',
      desc: 'Ganarle a Thanos',
      completadoEn: null
    }
  }
}
```

## Crear y listar tareas

Vamos a crear un método que nos permita añadir tareas al objeto `_listado`, en el objeto que tenga el indice de la tarea:

```js
class Tareas {
    ...
    crearTarea(desc = '') {
        const tarea = new Tarea(desc)
        this._listado[tarea.id] = tarea
    }
}
```

Como necesitamos pedir la descripción por consola, creamos un método generico que lea la entrada de los datos por línea de comando dentro del archivo `inquirer.js` y lo exportamos:

```js
const inquirerLeerInput = async (message) => {
    const question = [
        {
            type: 'input',
            name: 'desc',
            message,
            validate(value) {
                if (value.length === 0) {
                    return 'Por favor ingrese un valor'
                }
                return true
            }
        }
    ]

    const { desc } = await inquirer.prompt(question) 
    return desc
}


module.exports = {
    ...
    inquirerLeerInput
}
```

Como tenemos que analizar las opciones que se ingresar, usamos un `switch` para poder crear la funcionalidad de crear y listar las tareas

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            case '1':
                const desc = await inquirerLeerInput('Descripción:')
                tareas.crearTarea(desc)
                console.log(desc)
                break;
            case '2': console.log(tareas._listado); break;
            default:
                break;
        }
        ...
    } while (opt !== '0')
}
```

## Transformar objeto a un arreglo - Detalles estéticos

Nuestra variable `_listado` es un objeto, y necesitamos pasar sus valores a un arreglo. Para ello usamos `Object.keys()` con el que podemos obtener los valores de un objeto a partir de sus llaves. Posteriormente extraemos las tareas una a una de `_listado` a partir de su key y lo añadimos a una variable que retornamos dentro del método get (principios de POO).

```js
class Tareas {
    ...
    get listadoArr() {
        const listado = []
        Object.keys(this._listado).forEach(key  => {
            const tarea = this._listado[key]
            listado.push(tarea)
        })
        return listado
    }
}
```

Para usarlo dentro del método `main()`, hacemos la siguiente modificación:

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ....
            case '2': console.log(tareas.listadoArr); break;
            default:
                break;
        }
        ...
    } while (opt !== '0')
}
```

## Guardar tareas en un archivo de texto

Vamos a guardas las tareas que se creen dentro de un archivo de texto o un JSON. Para ello creamos un archivo llamado `helpers/adminArchivo.js` en que tenemos la siguiente función:

```js
const fs = require('fs')


const guardarDB = (data) => {
    const archivo = './db/data.json'
    fs.writeFileSync(archivo, JSON.stringify(data))
}


module.exports = {
    guardarDB
}
```

Esta función por el momento la llamamos así en el método `main()`:

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
        }
        guardarDB(tareas.listadoArr)

        ...
    } while (opt !== '0')
}
```

## Leer nuestra base de datos

Para leer los datos de la "base de datos" temporal que tenemos, creamos un método dentro del archivo `adminArchivo.js`, con el cual vamos a lista los registros que se se guardan en nuestra `data.json`. Lo primero es asegurarnos que el archivo exista, en caso contrario se retorna un valor nulo. Posteriormente obtenemos la información que hay dentro del archivo y ya que viene en string, lo parseamos a un JSON. Por último retornamos la data.

```js
const leerDB = () => {
    if (!fs.existsSync(archivo)) return null
    const info = fs.readFileSync(archivo, { encoding: 'utf-8'})
    const data = JSON.parse(info)
    return data
}

module.exports = {
    ... ,
    leerDB
}
```

Dentro del método `main()` usamos la función para traer la data, pero debemos poner una pausa para poder observar la data:

```js
const main = async () => {
    ...
    const tareasDB = leerDB()

    if (tareasDB) {}

    await inquirerPausa()

    do {
       ...
    } while (opt !== '0')
}
```

## Cargar Tareas

Para cargar las tareas creamos un método dentro de la clase Tareas, con el cual recibimos un arreglo de tareas que será mapeado para asignar cada tarea al objeto `_listado`.

```js
class Tareas {
    ...
    cargarTareasFromArray(tareas = []) {
        tareas.map(tarea => {
            this._listado[tarea.id] = tarea
        })
    }
}
```

Posteriormente usamos dicho método en la función `main()`

```js
const main = async () => {
    ...
    const tareasDB = leerDB()

    if (tareasDB) {
        tareas.cargarTareasFromArray(tareasDB)
    }

    do {
       ...
    } while (opt !== '0')
}
```

## Listar Tareas

Para listar las tareas de una manera más elegante, creamos un método en la clase Tareas, en el cual usamos la data que se obtiene del método get y la mapeamos para tomar acciones de acuerdo a sus estados:

```js
class Tareas {
    ...
    listadoCompleto() {
        console.log('')
        this.listadoArr.map((d, i) => {
            console.log(`${`${i + 1}`.green}. ${d.desc} :: ${d.completadoEn ? 'Completado'.green : 'Pendiente'.red}`)
        })
    }
}
```

Este método lo usamos en `main()` de la siguiente manera:

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
            case '2': tareas.listadoCompleto(); break;
            default:
                break;
        }
        ...
    } while (opt !== '0')
}
```

## Tareas completadas y pendiente, opciones del menú

Para poder listar las tareas completadas y las que no lo están, creamos un método en la clase Tareas que por medio de una variable bool muestra un tipo de información u otra. Conserva el mismo principio del método para listar todas las tareas:

```js
class Tareas {
    ...
    listarPendienteCompletadas(completadas = true) {
        let contador = 1
        console.log('')

        this.listadoArr.map(tarea => {
            const { desc, completadoEn } = tarea
            const estado = completadoEn ? 'Completado'.green : 'Pendiente'.red
            if (completadas) {
                if (completadoEn) {
                    console.log(`${(contador + '.').green} ${desc} :: ${estado} ${completadoEn}`)
                    contador += 1
                }
            } else {
                if (!completadoEn) {
                    console.log(`${(contador + '.').green} ${desc} :: ${estado}`)
                    contador += 1
                }
            }
        })
    }
}
```

Y dentro del método `main()` lo usamos de la siguiente manera:

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
            case '3': tareas.listarPendienteCompletadas(); break;
            case '4': tareas.listarPendienteCompletadas(false); break;
            ...
        }
        ...
    } while (opt !== '0')
}
```

## Listado para borrar

En este caso creamos un nuevo método dentro de la clase Tareas, que va a recibir el id de la tarea a borrar, confirma si existe y elimina:

```js
class Tareas {
    ...
    borrarTarea(id = '') {
        if (this._listado[id]) {
            delete this._listado[id]
        }
    }
}
```

Vamos a hacer un método que permita ver un listado de las tareas para poder seleccionar una de ellas. Esto lo hacemos dentro del archivo `inquirer.js`. Recibimos por parámetros un arreglo de tareas, los cuales al mapearlos vamos a obtener sus datos para crear un objeto que servira para las opciones que lanzamos por medio del prompt de inquirer. Lo último es recolectar el id del elemento seleccionado.

```js
const inquirerListadoTareasBorrar = async (tareas = []) => {
    const choices = tareas.map((tarea, i) => {
        const idx = `${i+1}`.green
        return {
            value: tarea.id,
            name: `${idx} ${tarea.desc}`
        }
    })

    const preguntas = [{
        type: 'list',
        name: 'id',
        message: 'Borrar',
        choices
    }]

    const { id } = await inquirer.prompt(preguntas)
    return id
}


module.exports = {
    ... ,
    inquirerListadoTareasBorrar
}
```

## Confirmar y borrar tarea

Creamos una función dentro del archivo de `inquirer.js` con el fin de que se pueda utilizar en varias oportunidades. Esta función regresa un valor bool que usaremos para futuras comparaciones.

```js
const inquirerConfirmar = async (message) => {
    const question = [
        {
            type: 'confirm',
            name: 'ok',
            message
        }
    ]

    const { ok } = await inquirer.prompt(question)
    return ok
}



module.exports = {
    ... ,
    inquirerConfirmar
}
```

Dentro del método de `inquirerListadoTareasBorrar()` añadimos una opción más al principio de la lista para poder cancelar la acción:

```js
const inquirerListadoTareasBorrar = async (tareas = []) => {
    ...
    choices.unshift({
        value: '0',
        name: '0.'.green + ' Cancelar'
    })
    ...
}
```

El uso dentro del método `main()` es el siguiente: Primero recibe el id de la tarea a eliminar, luego toma en cuenta las acciones distintas a `'0'` para poder proseguir con la eliminación de la tarea. En caso que se cancele desde la lista o desde la confirmación de eliminación, se muestra en consola un mensaje para anunciar que la acción se ha cancelado.

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
            case '6':
                const id = await inquirerListadoTareasBorrar(tareas.listadoArr)
                if (id !== '0') {
                    const ok = await inquirerConfirmar('¿Estás seguro de eliminar la tarea?')
                    if (ok) {
                        tareas.borrarTarea(id)
                        console.log('Tarea Eliminada correctamente'.gray)
                    } else {
                        console.log('Acción cancelada'.gray)
                    }
                } else {
                    console.log('Acción cancelada'.gray)
                }
                break;
                ...
        }
        ...
    } while (opt !== '0')
}
```

## Múltiples selecciones

Creamos una función dentro de `inquirer.js` que tiene gran similitud con `inquirerListadoTareasBorrar()`, pero que tiene una nueva propiedad para las `choices`. Esta propiedad es `checked`, la cual recibe un buleano, además el tipo para pregunta ahora es `checkbox`.

```js
const inquirerMostrarListadoChacklist = async (tareas = []) => {
    const choices = tareas.map((tarea, i) => {
        const idx = `${i+1}`.green
        return {
            value: tarea.id,
            name: `${idx}. ${tarea.desc}`,
            checked: tarea.completadoEn ? true : false
        }
    })

    const pregunta = [{
        type: 'checkbox',
        name: 'ids',
        message: 'Selecciones',
        choices
    }]

    const { ids } = await inquirer.prompt(pregunta)
    return ids
}


module.exports = {
    ... ,
    inquirerMostrarListadoChacklist
}
```

Su uso es bastante simple dentro del método `main()`, por parámetros se le va a pasar el arreglo con el listado de tareas.

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
            case '5': 
                const ids = await inquirerMostrarListadoChacklist(tareas.listadoArr)
                break;
            ...
        }
        ...
    } while (opt !== '0')
}
```

## Marcar como completadas o pendientes las tareas

Dentro de la clase Tareas creamos un método que tiene como finalidad recibir un arreglo de ids que serán mapeados, y por cada uno se toma una tarea del objeto `_listado` en la posición del id. Si dicha tarea no está completada, entonces al cambiar su estado se introduce una nueva fecha. Ahora bien, para el arreglo que se obtiene del método get, debemos recorrerlo y si en el arreglo de ids no está incluida alguna tarea que coincida con el id, entonces el valor de dicha tarea sera un null:

```js
class Tareas {
    ...
    toggleCompletadas(ids = []){
        ids.forEach(id => {
            const tarea = this._listado[id]
            if (!tarea.completadoEn) {
                tarea.completadoEn = new Date().toISOString()
            }
        })

        this.listadoArr.forEach(tarea => {
            if (!ids.includes(tarea.id)) {
                this._listado[tarea.id].completadoEn = null
            }
        })
    }
}
```

Dentro del método `main()`, luego de obtener los elementos que se han seleccionado, los pasamos al método `toggleCompletadas()` para analizar y cambiar su estado en caso de ser necesario.

```js
const main = async () => {
    ...
    do {
        ...
        switch (opt) {
            ...
            case '5':
                const ids = await inquirerMostrarListadoChacklist(tareas.listadoArr)
                tareas.toggleCompletadas(ids)
                break;
            ...
        }
        ...
    } while (opt !== '0')
}
```
