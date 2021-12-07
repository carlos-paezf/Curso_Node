# Sección 3: Reforzamiento de los temas necesarios para seguir el curso

La sección se enfoca en los siguientes temas:

- Instalación de paquetes mediante npm
- Reforzamiento de ES6 y ES7
- Let vs Var
- Template literales
- Destructuración
- Funciones de flecha
- Callbacks y callbacks en cadena
- Promesas y promesas en cadena
- Async y Await

## Const vs Let vs Var

- `var`: El scope de la variable es global, por lo que podemos acceder a la misma desde cualquier parte del archivo, y por lo tanto también modificarla. Además podemos incurrir en el error de usar antes de inicializar la variable

  ```js
  var nombre_var = 'Carlos'
  
  if (true) {
      nombre_var = 'David'
  }

  console.log(nombre_var)     //* David
  ```

- `let`: Tiene un scope local, solo se puede acceder en el ámbito en la que se ha creado (una función, etc..). Solo se puede modificar su valor mientras se esté dentro de su scope.
  
  ```js
  if (true) {
      let nombre_let = 'Car-Da'
      nombre_let = 'Paez'
      console.log(nombre_let)   //* Paez
  }

  console.log(nombre_let)   //! nombre_let is not defined
  ```

- `const`: También tiene un scope local, pero la diferencia es que su valor es constante y no se puede modificar.
  
  ```js
  if (true) {
      const nombre_const = 'Ferrer'
      nombre_const = 'Ferreira'   //! Assignment to constant variable
      console.log(nombre_const)   //* Ferrer
  }

  console.log(nombre_const)   //! nombre_const is not defined
  ```

## Template Strings

Con los template string ` `` ` podemos interpolar texto o escribir código javascript para que se ejecute en esa sección.

```js
const nombre = "Deadpool"
const real = 'Wade Wilson'

const template = `${nombre} ${real}`

console.log(template)
```

## Desestructuración de Objetos

Supongamos que tenemos un objeto con algunas propiedades:

```js
const deadpool = {
    nombre: 'Wade',
    apellido: 'Wilson',
    poder: 'Regeneración',
    getNombre() {
        return `${this.nombre}, ${this.apellido}, ${this.poder}`
    }
}
```

Podemos traer los datos de este objeto de la siguiente manera:

```js
console.log(deadpool.getNombre())

const nombre = deadpool.nombre
const apellido = deadpool.apellido
const poder = deadpool.poder

console.log(nombre, apellido, poder)
```

Pero podemos reducir la cantidad de código al aplicar desestructuración:

```js
const { nombre, apellido, poder } = deadpool
console.log(nombre, apellido, poder)
```

Esto mismo lo podemos hacer dentro de una función, e incluso podemos añadir una nueva propiedad que no existe en el objeto original.

```js
const imprimirHeroe1 = (heroe) => {
    const { nombre, apellido, poder, edad = 0 } = heroe
    console.log(nombre, apellido, poder, edad)
}
imprimirHeroe1(deadpool)
```

Existe otra opción para el caso del destructuring en funciones, la diferencia es el scope de las variables... en el caso anterior las variables son constantes, pero en este nuevo caso las variables pueden alterar su valor en el ámbito de la función:

```js
const imprimirHeroe2 = ({ nombre, apellido, poder, edad = 0 }) => {
    nombre = 'David'
    console.log(nombre, apellido, poder, edad)
}
imprimirHeroe2(deadpool)
```

Por último, tenemos desestructuración para arreglos, y lo podemos hacer de la siguiente manera: (Las posiciones que no usamos las rellenamos con comas `,`)

```js
const heroes = ['Deadpool', 'Spyderman', 'Superman', 'Batman']

const [h0, , , h3] = heroes

console.log(h0, h3);
```

## Funciones de Flecha - Arrow Functions

Esta es una función tradicional:

```js
function sumar(a, b = 10) {
    return a + b
}
console.log(sumar(5))
```

Podemos crear una función de flecha de la siguiente manera:

```js
const restar = (a, b = 5) => {
    return a - b
}
console.log(restar(10))
```

Pero también podemos dejar un `return` implicito en una sola línea y dejar la función de la siguiente manera:

```js
const mult = (a, b) => a * b
console.log(mult(5, 10))
```

## Callbacks

Los callbacks son funciones que se ejecutan después de un cierto tiempo, además de que se envian como parámetros dentro de otras funciones. Un ejemplo sencillo sería:

```js
setTimeout(() => {
    console.log('Hola mundo')
}, 1000);
```

Podemos crear una función propia que reciba un id, y regrese por medio de un callback un usuario con ese id.

```js
const getUsuarioByID = (id, callback) => {
    const user = {
        id,
        nombre: 'David'
    }

    setTimeout(() => callback(user), 1500)
}
```

Teniendo el usuario, podemos aplicar cualquier cambio al valor retornado fuera de la función `getUsuarioByID`:

```js
getUsuarioByID(10, ( usuario ) => {
    console.log(usuario)
    console.log(usuario.nombre.toUpperCase())
})
```

## Problemas de los callbacks

Callback Hell o infierno de los callbacks, hace referencia a callbacks dentro de callbacks. Primero vamos a plantear un contexto. Tenemos un arreglo de empleados y deseamos obtener la información de uno de ellos mediante su id.

```js
const empleados = [
    {
        id: 1,
        nombre: 'Carlos'
    },
    {
        id: 2,
        nombre: 'David'
    },
    {
        id: 3,
        nombre: 'Paez'
    }
]
```

Creamos una función que recibe por parámetros el id y un callback, lo primero que va a hacer es buscar el empleado que tenga dicho id, en caso de que exista llama a la función callback que tiene a su vez 2 parámetros: un error y el valor resultante. Si encuentra al usuario pasa para el error un null y para el resultado, el empleado encontrado, en caso de que no encuentre al empleado, entonces, retorna un mensaje de error.

```js
const getEmpleado = (id, callback) => {
    const empleado = empleados.find(e => e.id === id)
    if (empleado) {
        callback(null, empleado.nombre)
    } else {
        callback(`Empleado con id ${id} no existe`)
    }
}
```

Al usar la función pasamos el id y una función anonima con los parámetros de error y empleado, en caso de que exista un error hacemos un tratamiento especifico, en caso contrario imprimimos el usuario.

```js
getEmpleado(id, (err, empleado) => {
    if (err) {
        console.log('Error:')
        return console.log(err)
    }
    console.log(empleado)
})
```

Ahora queremos averiguar el salario de dicho empleado a partir de otro arreglo:

```js
const salarios = [
    {
        id: 1,
        salario: 1000
    },
    {
        id: 2,
        salario: 200
    },
]
```

Creamos una función similar a la de obtener el empleado:

```js
const getSalario = (id, callback) => {
    const salario = salarios.find(s => s.id === id)?.salario
    if (salario) callback(null, salario)
    else callback(`Salario con id ${id} no encontrado`)
}
```

El callback hell empieza aquí, JS no se complica, él lo resuelve... el problema es que nosotros no podemos entender muy bien el código:

```js
getEmpleado(id, (err, empleado) => {
    if (err) {
        console.log('Error:')
        return console.log(err)
    }
    console.log(empleado)

    getSalario(id, (error, salario) => {
        if (error) {
            console.log('Error: ');
            return console.log(error)
        }
        console.log(`El empleado ${empleado} tiene un salario de ${salario}`)
    })
})
```

## Promesas

Son una solución al callback hell, pero si no se manejan bien puede resultar aún peor. Vamos a transformar las funciones de antes en funciones que retornen promesas:

```js
const getEmpleado = (id) => {
    return new Promise((resolve, reject) => {
        const empleado = empleados.find(e => e.id === id)?.nombre
        empleado ? resolve(empleado) : reject(`No existe empleado con id ${id}`)
    })
}


const getSalario = (id) => {
    return new Promise((resolve, reject) => {
        const salario = salarios.find(s =>  s.id === id)
        salario ? resolve(salario.salario) : reject(`No hay salario para el id ${id}`)
    })
}
```

Ahora bien, si seguimos la lógica del código anterior para obtener el salario del empleado encontrado, tendríamos el siguiente lio como un promise hell:

```js
getEmpleado(id)
    .then(empleado => {
        getSalario(id)
            .then(salario => {
                console.log(`El empleado ${empleado} tiene un salario de ${salario}`)
            })
            .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
```

## Promesas en cadena

Podemos concatenar promesas a partir del valor que se obtiene de la anterior. El problema es que algunos datos debemos manejarlos con variables pivot para poderlos usar en la siguiente promesa, como se muestra a continuación:

```js
let nombre

getEmpleado(id)
    .then(empleado => {
        nombre = empleado
        return getSalario(id)
    })
    .then(salario => console.log(`El empleado ${nombre} tiene un salario de ${salario}`))
    .catch(error => console.log(error))
```

## Async - Await

`async` transforma las funciones en que se usa, en Promesas. Los valores que se esperan se llaman usando `await`, el cual siempre debe de estar dentro de `async`. En el caso de las promesas anteriores, podemos crear una función que sea asincrona y espere el valor resultante de consultar al empleado y el salario, si intenta esto y es exitoso, retorna un mensaje, en caso contrario lanza un error. De esta manera se solucionan los callbacks y promises hells.

```js
const getInfoUsuario = async (id) => {
    try {
        const empleado = await getEmpleado(id)
        const salario = await getSalario(id)
        
        return `El salario del empleado ${empleado} es de ${salario}`
    } catch (error) {
        throw error
    }
}

getInfoUsuario(id)
    .then(msg => console.log(msg))
    .catch(error => console.log(error))
```
