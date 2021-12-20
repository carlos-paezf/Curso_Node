# Sección 17: Bonus: Node + TypeScript + MySQL

Aquí aprenderemos sobre los siguientes temas:

- Creación de proyectos con TypeScript
- Configurar Express con TypeScript
- Conectarnos a MySQL desde Node
- Crear un CRUD usando Sequelize - ODM (Parecido a Mongoose)

## Inicio del proyecto ts-rest-server

Primero vamos a instalar TypeScript de manera global con el comando `npm i -g typescript` y para verificar la versión escribimos `tsc --version`. Luego creamos el `package.json` de manera automatica con el comando `npm init -y`.

Debemos crear el archivo de configuración para TypeScript para determinar como compilar el proyecto. La configuración la hacemos al escribir el comando `tsc --init`. Dentro del archivo configuramos lo siguiente:

```json
{
    "compilerOptions": {
        ...,
        "moduleResolution": "node", 
        ...
        "sourceMap": true,   
        ... 
        "outDir": "./dist",
    }
}
```

Cuando queremos compilar el código debemos primero escribir este comando: `tsc`. Esto va a generar los archivo js necesarios para la ejecución del proyecto dentro de la carpeta `dist`. Para ejecutar escribimos el comando `node dist/app.js`.

Para añadir ts-lint instalamos la librería ts-lint como dependencia de desarrollo con el comando `npm i tslint --save-dev`. Para hacer el archivo de configuración de esta librería debemos instalar TypeScript en local como dependencia de desarrollo con el comando `npm i typescript --save-dev`. Para inicializar ts-lint debemos usar el comando `./node_modules/.bin/tslint --init`. Una vez tenemos el archivo `tslint.json` en la raiz del proyecto añadimos la siguiente regla:

```json
{
    ...
    "rules": {
        "no-console": false
    },
}
```

## Crear el servidor de express y sus middlewares

Vamos a crear un archivo llamado `models/server.ts` donde haremos el modelo para nuestro servidor. También vamos a instalar express, cors, dotenv y colors mediante el comando `npm i express cors dotenv colors`. En nuestro archivo del server, cuando importamos express vamos a tener el siguiente error:

```txt
No se encontró ningún archivo de declaración para el módulo 'express'. '..../node_modules/express/index.js' tiene un tipo "any" de forma implícita.
Pruebe "npm i --save-dev @types/express" si existe o agregue un nuevo archivo de declaración (.d.ts) que incluya "declare module 'express';".
```

Para solucionarlo seguimos el comando que se nos dice en el error: `npm i --save-dev @types/express`.

En TypeScript no podemos usar propiedades en el constructor sin antes definirlas, además de que es muy recomendable darles que tipo de variable serán:

```ts
import express, { Application } from 'express'


class Server {
    private app: Application

    constructor() {
        this.app = express()
    }
}
```

Cuando queremos exportar una clase en TS, podemos hacerlo de 2 maneras: Si tenemos varias clases a exportar en un archivo podemos usar esta forma:

```ts
export class Server {...}
```

O, si solo tenemos una clase para exportar, podemos usar esta forma.

```ts
class Server {...}
export default Server
```

Nuestra clase Server por el momento se ve de la siguiente manera:

```ts
import express, { Application } from 'express'
import colors from 'colors'


class Server {
    private app: Application
    private PORT: string

    constructor() {
        this.app = express()
        this.PORT = process.env.PORT || '8080'
    }

    listen = () => {
        this.app.listen(this.PORT, () => {
            console.log(`Servidor corriendo en: http://localhost:${this.PORT}`.america)
        })
    }
}


export default Server
```

Y nuestro archivo `app.ts` está de la siguiente manera:

```ts
import dotenv from "dotenv"

import Server from "./models/server"

dotenv.config()


const server = new Server()
server.listen()
```

## Nodemon y TSC --watch

Primero vamos a transpilar todos los archivo a JS mediante el comando `tsc`. Luego podemos ejecutar el proyecto con el comando `node dist/app` o en desarrollo con `nodemon dist/app`. El inconveniente de esto, es que cada vez que hacemos un cambio debemos transpilar de nuevo el proyecto, puesto que en el caso de nodemon, solo escucha los cambios en los archivos JS.

Para poder trabajar y que se autotranspile nuestro proyecto TS cada que guardamos cambios, lo hacemos con el comando `tsc --watch` y de esa manera nodemon recibira los cambios que hagamos.

## Rutas de mi aplicación

Vamos a crear un archivo para nuestras rutas de cliente llamado `routes/users.routes.ts`, además de crear un archivo para los controladores de dichas rutas llamado `controllers/users.controller.ts`. Nuestro archivo de rutas para los usuarios tendrá la siguiente estructura:

```ts
import { Router } from 'express'
import { deleteUser, getUser, getUsers, postUser, putUser } from "../controllers/user.controller";

const router = Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', postUser)
router.put('/:id', putUser)
router.delete('/:id', deleteUser)

export default router
```

También vamos a definir los esqueletos de los controladores para dichas rutas (En los parámetros del request y la response debemos definir el tipo):

```ts
import { Request, Response } from 'express'


export const getUsers = (req: Request, res: Response) => {
    res.json({
        msg: 'Get Users'
    })
}


export const getUser = (req: Request, res: Response) => {
    const { id } = req.params
    
    res.json({
        msg: 'Get User',
        id
    })
}


export const postUser = (req: Request, res: Response) => {
    const { body } = req

    res.json({
        msg: 'Post User',
        body
    })
}


export const putUser = (req: Request, res: Response) => {
    const { id } = req.params
    const { body } = req
    
    res.json({
        msg: 'Put User',
        id,
        body
    })
}


export const deleteUser = (req: Request, res: Response) => {
    const { id } = req.params
    
    res.json({
        msg: 'Delete User',
        id
    })
}
```

En nuestro clase `Server` creamos una propiedad para los paths y un método para los mismos:

```ts
import userRouter from '../routes/users.routes'

class Server {
    ...
    private paths = {
        users: '/api/users'
    }

    constructor() {
        ...
        this.routes()
    }
    routes = () => {
        this.app.use(this.paths.users, userRouter)
    }
    ...
}
```

## Middlewares necesarios

Vamos a crear un método en la clase `Server` para los middlewares de nuestra aplicación. Necesitamos configurar el CORS, el parseo del Body y la configuración para el uso de una carpeta publica en caso de que la usemos.

El paquete de CORS toca instalarlo con el comando `npm i --save-dev @types/cors`, pues no tiene ningun archivo de declaración para el mismo.

Nuestros middlewares quedarían de la siguiente manera: Definimos el CORS, parseamos el body de los request a JSON y luego damos acceso a la carpeta pública.

```ts
import cors from 'cors'

class Server {
    constructor() {
        ...
        this.middlewares()
        ...
    }
    middlewares = () => {
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.static('public'))
    }
    ...
}
```

## MySQL - Instalaciones y conexión

Debemos tener instalado un gestor como XAMPP, WAMP, AMPSS, LAMPS o una dependencia propia de MySQL. Podemos hacer la gestión de la base de datos desde phpMyAdmin o mediante un programa llamado [TablePlus](https://tableplus.com/). En dicho programa podemos agregar una nueva conexión a MySQL con un nombre personalizado, la dirección a donde se debe conectar, el puerto, el usuario y la contraseña en caso de tenerla. Podemos hacer click en test para saber si lo que ingresamos es correcto.

## Tabla de usuarios

Vamos a crear una Base de Datos. En TablePlus pulsamos el icono de Database el cual por medio de un tooltip nos dice: *Show databases list*, y creamos una nueva DB, en mi caso la llame `node_ts`. Abrimos la base de datos y creamos una tabla que contenga los datos que le vamos a pedir al usuario, por ejemplo el nombre y el email. Volvemos a manejar un status para mantener la integridad referencial. Una vez definimos los campos guardamos los cambios.

El código SQL hasta el momento sería el siguiente:

```sql
CREATE DATABASE `node_ts`;
USE `node_ts`;

CREATE TABLE `node_ts`.`users` (`id` serial,`name` VARCHAR(255) NOT NULL,`email` VARCHAR(255) NOT NULL,`status` TINYINT NOT NULL DEFAULT '1');
```

## Sequelize

Para instalar Sequelize usamos el comando `npm i --save sequelize`. Debemos instalar también un driver para nuestra base datos MySQL con el comando `npm i --save mysql2`. Luego, en nuestro proyecto creamos un archivo llamado `db/connection.ts` y configuramos lo siguiente:

```ts
import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config()


const DATABASE = process.env.DATABASE || ''
const USER_DB = process.env.USER_DB || ''
const PASSWORD_DB = process.env.PASSWORD_DB || ''
const HOST = process.env.HOST_DB || ''


const db = new Sequelize(DATABASE, USER_DB, PASSWORD_DB, {
    host: HOST,
    dialect: 'mysql',
    // logging: false
})


export default db
```

En la clase `Server` creamos un método asincrono para conectar con la base de datos:

```ts
import db from '../db/connection'

class Server {
    constructor() {
        ...
        this.dbConnection()
        ...
    }
    dbConnection = async () => {
        try {
            await db.authenticate()
            console.log(colors.blue.italic('Base de datos conectada'))
        } catch (error) {
            console.log(colors.red('Error en la DB: '))
            throw new Error(error)
        }
    }
    ...
}
```

## Modelo de Usuario

Vamos a crear un archivo llamado `models/user.ts`, en el cual definimos un modelo para un usuario. Dentro de dicho modelo definimos los tipos de los campos.

```ts
import { DataTypes } from 'sequelize'
import db from '../db/connection'


const User = db.define('User', {
    name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.BOOLEAN
    }
})


export default User
```

## Obtener usuarios

Insertamos algunos datos dentro de la base de datos para luego poder obtenerlos mediante nuestro endpoint. Lo podemos hacer directamente con la aplicación de TablePlus o lo podemos hacer con una sentencia SQL como la siguiente:

```sql
INSERT INTO `users` (`name`, `email`, `status`) VALUES
('Desactivado', 'test3@mail.com', 2);
```

Dentro de nuestro controlador del endpoint para obtener todos los usuarios ponemos lo siguiente:

```ts
export const getUsers = async (req: Request, res: Response) => {
    const users = await User.findAll()
    
    res.json({users})
}
```

Cuando hacemos la petición ocurre un error debido a que no encuentra 2 columnas en la tabla. La sentencia que se ejecuta es la siguiente:

```sql
SELECT `id`, `name`, `email`, `status`, `createdAt`, `updatedAt` FROM `Users` AS `User`;
```

Necesitamos crear las últimas 2 columnas dentro de nuestra tabla. Lo podemos hacer mediante la GUI o por medio de una sentencia SQL. Si lo hacemos mediante TablePlus debemos darle click derecho a la tabla, seleccionamos Abrir Estructura y agregamos los campos que nos faltan de tipo TIMESTAMP. Por medio de SQL sería:

```sql
ALTER TABLE `node_ts`.`users`
ADD COLUMN `createdAt` TIMESTAMP AFTER `status` DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `updatedAt` TIMESTAMP AFTER `status` DEFAULT CURRENT_TIMESTAMP;
```

Podemos filtrar los usuarios que está activos mediante el `where` y también podemos hacer la paginación mediante las clausulas de `offset` y `limit`:

```js
export const getUsers = async (req: Request, res: Response) => {
    const { from = 0, limit = 10 } = req.query

    const [totalUsers, users] = await Promise.all([
        User.count({
            where: { 'status': 1 }
        }),
        User.findAll({
            offset: Number(from),
            limit: Number(limit),
            where: { 'status': 1 },
        })
    ])

    res.json({ total: totalUsers, from, limit, users })
}
```

Para obtener un solo usuario por su id, escribimos el siguiente código:

```ts
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params
    
    const user = await User.findByPk(id)

    if (!user) {
        return res.status(400).json({ msg: `No existe un usuario con el id ${id}` })
    }

    res.json({user})
}
```

Si queremos traer solo los usuarios validos, hacemos la siguiente validación:

```js
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await User.findByPk(id)

    if (!user) {
        return res.status(400).json({ msg: `No existe un usuario con el id ${id}` })
    }

    if (!user.status){
        return res.status(400).json({ msg: `No existe un usuario con el id ${id} - status` })
    }

    res.json({ user })
}
```

## Crear y actualizar usuarios

Primero, en nuestra base de datos debemos hacer que el campo de email sea unico, por lo que añadimos un indice en dicho campo:

```sql
ALTER TABLE `node_ts`.`users` ADD UNIQUE `email_unique` (`email`);
```

Cuando creamos un usuario, debemos validar que los campos que nos entreguen sean validos, y que además el email no exista aún en la base de datos. El siguiente método es muy extenso, pero si nos dirigimos a la sección donde construiamos nuestro [RESTServer con JavaScript y Mongo](../16_Sockets_Autenticacion_Chat), nos daremos cuenta que se pueden extraer algunos de los métodos como helpers para aplicar middlewares personalizados en el archivo de rutas.

```ts
export const postUser = async (req: Request, res: Response) => {
    const { name, email } = req.body

    try {
        if (!name || !email) return res.status(400).json({
            msg: 'Envie todos los datos'
        })

        if (name.trim().length === 0 || email.trim().length === 0) {
            return res.status(400).json({
                msg: 'Por favor complete todos los campos'
            })
        }

        const emailExists = await User.findOne({
            where: { email }
        })

        if (emailExists) return res.status(400).json({
            msg: 'Este email ya está registrado'
        })

        const user = await User.create({
            name,
            email
        })
        res.json({ user })
    } catch (error) {
        console.log('Error: ', error)
        return res.status(500).json({ msg: 'Hable con el administrador' })
    }
}
```

Para actualizar el usuario debemos validar si el id que se ingresa le pertenece a un usuario valido, y luego si podemos actualizar la data:

```ts
export const putUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, email } = req.body

    try {
        const user = await User.findByPk(id)

        if (!user) return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`
        })

        if (!user.status) return res.status(400).json({
            msg: `No existe un usuario con el id ${id} - status`
        })

        const emailExists = await User.findOne({
            where: { email }
        })

        if (emailExists) return res.status(400).json({
            msg: 'Este email ya está registrado'
        })

        await user.update({
            name, 
            email
        })

        return res.json({ user })
    } catch (error) {
        console.log('Error', error)
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
}
```

## Eliminar registros

Existen 2 maneras de eliminar registros de una base datos: De manera física, donde eliminamos por completo el registro, o de manera lógica, donde solo actualizamos es estado del registro y con ello mantenemos la integridad referencial. Los 2 métodos se evidencian a continuación:

```ts
export const partialDeleteUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const user = await User.findByPk(id)

        if (!user) return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`
        })

        await user.update({
            status: false
        })

        res.json({
            user
        })
    } catch (error) {
        console.log('Error', error)
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
}


export const totalDeleteUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const user = await User.findByPk(id)

        if (!user) return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`
        })

        await user.destroy()
        res.json({
            msg: 'Usuario eliminado totalmente de la base de datos',
        })
    } catch (error) {
        console.log('Error', error)
        return res.status(500).json({
            msg: 'Hable con el administrador'
        })
    }
}
```
