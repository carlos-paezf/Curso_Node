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
