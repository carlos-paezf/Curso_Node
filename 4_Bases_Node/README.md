# Sección 4: Bases de node

La sección se enfoca en los siguientes temas:

- Requerir información de otros archivos
- Requerir paquetes
- Importar archivos personalizados
- NPM
  - Install
  - Uninstall
- Package.json
- Yargs
- Recibir parámetros por línea de comando
- Colores para la consola

## Requerir paquetes - require

Tenemos un archivo con las tabla de multiplicar del 0 al 10 de un número base. La idea es que la impresión la pasemos a un archivo te texto plano dentro del mismo directorio. Desde el navegador no se puede, pero Node nos permite hacer esta funcionalidad por medio del File System. En la documentación de Node, podemos encontrar la especificaciones de dicho modulo y su uso.

El modulo de `fs` permite interactuar con el sistema de archivos de manera modelada con funciones de estandar POSIX. Para su uso usamos la siguiente línea dentro de nuestro archivo:

```js
const fs = require('fs')
```

Para crear los archivos de manera dinamica, teniendo en cuenta la base para multiplicar, podemos hacer el siguiente código, en este caso usamos la función `fs.writeFile(path, data[, options], callback)`:

```js
const fs = require('fs')

const base = 5

let salida = ''

for (let i = 0; i <= 10; i++) {
    salida += `${base} * ${i} = ${base*i}\n`
}

fs.writeFile(`tabla-${base}.txt`, salida, (err) => {
    if (err) throw err
    console.log(`tabla-${base}.txt creada`)
})
```

También tenemos la opción de `fs.writeFileSync(path, data[, options])`, el cual es un poco más simple.

```js
fs.writeFileSync(`tabla-${base}.txt`, salida)
```

## Importar archivos de nuestro proyecto

Es importante que nuestro archivo principal del proyecto, sea limpio de lógica, por lo que creamos archivos para la lógica empresarial en otros lugares y luego los importamos. Por ejemplo, queremos que el método de crear el archivo con las multiplicaciones este en otro directorio, y luego lo importamos a `app.js`. Para ello primero creamos el archivo `helpers/multiplicar.js` con la siguiente lógica dentro:

```js
const fs = require('fs')


const crearArchivo = (base = 1) => {
    console.log('=================');
    console.log(`Tabla del ${base}`);
    console.log('=================');

    let salida = ''

    for (let i = 0; i <= 10; i++) {
        salida += `${base} * ${i} = ${base * i}\n`
    }

    console.log(salida)

    fs.writeFileSync(`tabla-${base}.txt`, salida)
    console.log(`tabla-${base}.txt creada`)
}
```

Y nuestro archivo de `app.js` quedaría de la siguiente manera:

```js
console.clear()

const base = 5
```

Para poder llamar el método de `crearArchivo()` dentro de `app.js` debemos exportar dicha función, para lo cual usamos:

```js
module.exports = {
    crearArchivo
}
```

Y ahora dentro de `app.js` lo importamos:

```js
const { crearArchivo } = require('./helpers/multiplicar')

crearArchivo(base)
```

Si queremos capturar los movimientos de nuestra función, podemos hacer que nuestro método sea asincrono y que intente realizar la lógica y retorne un mensaje, o atrapar el error:

```js
const crearArchivo = async (base = 1) => {
    try {
        ...
        fs.writeFileSync(`tabla-${base}.txt`, salida)
        return `tabla-${base}.txt`
    } catch (error) {
        throw error
    }
}
```

Y ya podemos obtener las respuesta dentro de la llamada al método:

```js
crearArchivo(base)
    .then(nombreArchivo => console.log(nombreArchivo, 'creado'))
    .catch(error => console.log(error))
```

## Recibir información desde línea de comando

Podemos observar lo que pasa al escribir `node app` mediante la siguiente línea de código:

```js
console.log(process.argv)
```

Esto nos mostrara un arreglo como el siguiente:

```txt
[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\carlo\\Documents\\Cursos\\Curso_Node.js\\4_Bases_Node\\app.js'
]
```

Si nosotros le pasamos otro parámetro por comando, como por ejemplo: `node app --base=9`, obtendremos lo siguiente:

```js
[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\carlo\\Documents\\Cursos\\Curso_Node.js\\4_Bases_Node\\app.js',
  '--base=9'
]
```

Esa base la podemos rescatar y desestructurar para poder usarla como parámetro de la función `crearArchivo()` de la siguiente manera, y en caso de que no venga ningún valor, ponemos valores por defecto:

```js
const [, , arg3 = 'base=5'] = process.argv
const [, base = 5] = arg3.split('=')
```

Pero la forma anterior presenta muchos problemas, por ejemplo que se nos ingresen flags diferentes.

## package.json - init - install - uninstall

Para poder instalar paquetes de terceros, debemos contar con un archivo llamado `package.json`. Para crearlo con valores iniciales por defecto usamos el comando `npm init -y`, pero para conceptos practicos del ejercicio, solo usamos `npm init`.

Al ingresar dicho comando se no va a pedir que ingresemos el nombre del paquete, la versión, una descripción, un punto de entrada, un comando de texto, un repositorio de git, keywords, autor, licencia. Al final esto genera una vista previa de lo que se va a crear.

Para la instalación de un paquete, como por ejemplo `colors`, usamos el comando `npm install colors`. Cuando revisamos el package.json vamos a observar que se ha añadido una nueva dependencia. Para la instalación especifica de una dependencia usamos el comando (por ejemplo para colors) `npm install colors@1.0.0`

Para desinstalar una dependencia escribimos el siguiente comando `npm uninstall <dependencia>`. Para actualizar las dependencias usamos el comando `npm update`

## Yargs

Para la instalar la dependencia de Yargs usamos el comando `npm i yargs`. Yargs ayuda en la creación de herramientas interactivas de la línea de comandos, para parsear argumentos y generar una interfaz de usuario elegante.

Nosotros podemos comparar las salidas con y sin usar yargs:

- Sin usar yargs `node app --base=5`:

  ```js
  console.log(process.argv)
  ```

  ```txt
  [
    'C:\\Program Files\\nodejs\\node.exe',       
    'C:\\Users\\carlo\\Documents\\Cursos\\Curso_Node.js\\4_Bases_Node\\app',
    '--base=5'
  ]
  ```

- Usando yargs `node app --base=5` o incluso `node app --base 5`:
  
  ```js
  const argv = require('yargs').argv

  console.log(argv)
  ```

  ```js
  { _: [], base: 5, '$0': 'app' }
  ```

## Configuraciones de Yargs

Queremos por ejemplo usar una flag para definir la base a multiplicar. También queremos que dicha flag tenga una abreviatura y que se pueda reconocer al ingresar los valores por la línea de comando. Para hacer esto podemos escribir el siguiente código:

```js
const argv = require('yargs')
    .option('b', {
        alias: 'base',
        type: 'number'
    })
    .argv
```

Hemos definido la bandera, un alias y el tipo, pero también podemos pasar argumentos como una descripción del para que sirve dicha bandera, si es requerido el campo, entre otros. También tenemos la opción de verificar si lo que se ha ingresado esta de acuerdo a lo que nosotros queremos:

```js
const argv = require('yargs')
    .option('b', {
        alias: 'base',
        type: 'number',
        demandOption: true
    })
    .check((argv, options) => {
        if (isNaN(argv.b)) {
            throw 'La base debe ser un número'
        }
        return true
    })
    .argv
```

También tenemos la opción de crear más flags, mediante la función `.options()`:

```js
const argv = require('yargs')
    .options({
        'b': {
            alias: 'base',
            type: 'number',
            demandOption: true
        },
        'l': {
            alias: 'listar',
            type: 'boolean',
            demandOption: false
        }
    })
    .check((argv, options) => {
        if (isNaN(argv.b)) {
            throw 'La base debe ser un número'
        }
        return true
    })
    .argv
```

Cuando ingresamos el comando `node app --help` vamos a observar las banderas que tenemos para nuestro proyecto.

## Configurar Yargs independientemente

El ideal es que `app.js` esté libre de lógica. Con eso en mente, creamos el archivo `config/yargs.js` en que llevamos la información de yargs y luego la exportamos mediante el siguiente código:

```js
module.exports = yargs
```

Para usarlo, simplemente importamos en el directorio requerido:

```js
const argv = require('./config/yargs')
```

## Colores de la consola

Por medio de la librería Colors podemos hacer que las salidas en consola sean más vistosas. Tenemos varias maneras de hacer uso del paquete... Todo se puede observar en la documentación de la misma.

```js
require('colors')

console.log(nombreArchivo.rainbow, 'creado'.green)
```

```js
const colors = require('colors')

console.log(colors.blue('================='))
console.log(`Tabla del ${base}`.underline.blue)
console.log(colors.blue('================='))
```
