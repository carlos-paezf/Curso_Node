# Sección 2: Fundamentos de Node

## Hola mundo en Node

Dentro del archivo `app.js` tenemos una simple línea de código:

```js
console.log('Hola mundo')
```

Para la ejecución del archivo con Node, escribimos en consola:

```txt
node app.js
```

## Ciclo de eventos de Node

Tenemos una constante que se va a ser registrada dentro del objeto global y luego se llama dentro de una impresión.

```js
const saludar = (nombre) => {
    return `Saludos ${nombre}`
}

console.log(saludar('Carlos'));
```

## Nodemon

`nodemon` es una herramienta que ayuda en el desarrollo de aplicaciones basadas en node.js. Permite que se recargue automaticamente la aplicación una vez detecte cambios en los archivos. Para su instalación, se requiere que sea en global y con permisos de administrador.

``` text
npm install -g nodemon
```

Para usarlo, escribimos `nodemon <file>` en vez de `node <file>`. Para terminar su proceso usamos la combinación `ctrl + c`.
