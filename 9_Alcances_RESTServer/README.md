# Sección 9: Alcances del RESTServer y mantenimiento de la colección de usuarios

Aquí cubriremos varios temas como:

- Definir los alcances de nuestro RESTServer
- CRUD
- Encriptación de contraseñas
- Validaciones personalizadas
- Creación de roles
- Conexiones con MLAB
- Despliegue de base de datos en la nube
- Conexión con Robo 3T con base de datos en la nube
- Configuración de variables de entorno
- Borrado de archivos
  - Eliminado físico de la base de datos
  - Eliminación por estado en un campo de la colección

## Alcances del proyecto RESTServer

La aplicación contará con una base de datos que tiene 3 colecciones, los cuales a su vez tienen diversos atributos:

1. Usuarios:
   - `_id`: automático
   - `name`: string
   - `email`: string
   - `password`: string - crypt
   - `img`: string
   - `role`: string
   - `status`: boolean
   - `google`: boolean
2. Categorias:
   - `_id`: automático
   - `name`: string
   - `user`: objectId
3. Productos:
   - `_id`: automático
   - `name`: string
   - `unitPrice`: number
   - `category`: objectId
   - `available`: boolean
   - `user`: objectId

## Configuración de MongoDB - MongoAtlas

Vamos a la página de [MongoAtlas](https://www.mongodb.com/atlas/database) y creamos una cuenta o nos logeamos en caso de tener una. Creamos un Cluster según el presupuesto y las necesidades. Para el tema de acceso, creamos un usuario a nuestro cluster, junto con un password, por ejemplo en mi caso use como usuario `admin_cafe` y de password `OT86eDJOpaazwFVp`. Aunque no es necesario, se pueden poner como variables de entorno dentro del proyecto. Al usuario le damos permiso de lectura y escritura a cualquier base datos dentro del cluster, y finalizamos la creación.

## MongoDB Compass - Prueba de Conexión

Indispensable tener el cluster y el usuario. Dentro de MongoAtlas nos dirigimos a la sección de Clusters o Databases y seleccionamos **Connect**. Añadimos dirección IP de conexión, y seguimos con el paso de elegir un método de conexión. Seleccionamos **Connect using MongoDB Compass**. Seleccionamos la versión de nuestro MongoDB Compass y copiamos la cadena de conexión que se nos muestra en pantalla. Luego abrimos MongoDB Compass y copiamos la cadena de conexión con los valores que se nos pide reemplazar, es decir que nuestro enlace de conexión quedaría: `mongodb+srv://admin_cafe:OT86eDJOpaazwFVp@clustercafe.sogwx.mongodb.net/cafeDB`.

## Mongoose - Conectarnos a la base de datos

Para usar el paquete de Mongoose usamos el comando `npm i mongoose`. Para el manejo de nuestra base de datos, creamos un directorio con el nombre de `database`, en el cual añadimos un archivo llamado `config.db.js`. Lo primero sera crear una clase con un método asincrono para la conexión con la base de datos, para lo cual hacemos uso de un try-catch. Lo que intentaremos será hacer que mongoose se conecte a nuestra DB:

```js
require('dotenv').config()
require('colors')

const mongoose = require('mongoose')


class ConfigDB {
    constructor() {
        this.MONGODB_CNN = process.env.MONGODB_ATLAS_CNN
    }

    dbConnection = async () => {
        try {
            await mongoose.connect(this.MONGODB_CNN, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
            })
            console.log(`Base de Datos online`.green)
        } catch (error) {
            throw new Error(`Error en la base de datos: ${error}`)
        }
    }
}


module.exports = ConfigDB
```

Posteriormente dentro de la clase del Server, instanciamos una variable de Database para poder usar sus métodos.

```js
const ConfigDB = require('../database/config.db')

const db = new ConfigDB()
```

Aún dentro de la clase de Server creamos un método async para llamar la conexión a la Database, y lo llamamos en los métodos antes de los middlewares.

```js
class Server {
    constructor() {
        ...
        this.connectDB()
        ..
    }

    async connectDB() {
        await db.dbConnection()
    }
}
```

Ya podemos levantar el servidor. Al día 11 de diciembre de 2021, las opciones de `usecreateindex, usefindandmodify` ya no son soportadas, por lo que el código para conectar mediante mongoose quedo de la siguiente manera:

```js
class ConfigDB {
    ...
    dbConnection = async () => {
        try {
            await mongoose.connect(this.MONGODB_CNN, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            console.log(`Base de Datos online`.green)
        } catch (error) {
            ...
        }
    }
}
```

## Modelo de Usuario

Vamos a crear un archivo llamado `models/user.js`. En este archivo vamos a desestructurar la clase `Schema` y la función `model` de la importación de `mongoose`. Creamos un esquema para el usuario con todos los atributos que debe llevar y luego exportamos un modelo que se llame `User` y que apunte a nuestro `UserSchema`.

```js
const { Schema, model } = require('mongoose')


const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida']
    },
    image: {
        type: String
    },
    role: {
        type: String,
        required: [true, 'El rol es requerido'],
        emun: ['ADMIN_ROLE', 'USER_ROLE']
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
})


module.exports = model('User', UserSchema)
```

## POST: Creando un usuario en la colección

Dentro de la función `usersPost()` de `user.controller.js`, vamos a instanciar un usuario que tenga por contenido el cuerpo de la request.

```js
const User = require('../models/user')


const usersPost = (req, res = response) => {
    const body = req.body
    const user = new User(body)

    res.json({
        msg: 'post data to API - controller',
        user
    })
}
```

Ahora, dentro de Postman o de Thunder, hacemos una petición POST y en la sección de **Body** enviamos un raw en formato JSON con una información falsa. La idea es que guardemos dicha información dentro de nuestra base de datos en MongoDB. Para ello usamos la función `save()`.

```js
const usersPost = async (req, res = response) => {
    ...
    await user.save()
    ...
}
```

Como nosotros configuramos que la información del usuario en algunos campos sea requerida, si no la enviamos, nos mostrara un error en consola. Es importante bajar el servidor y volver a enviar los datos ya que aún no hacemos un tratamiento para ese tipo de error. Por ejemplo enviamos el siguiente request:

```json
{
    "name": "Carlos",
    "google": true,
    "email": "test1@mail.com",
    "password": "123456",
    "status": true,
    "role": "USER_ROLE"
}
```

Si todo está bien, obtenemos la siguiente respuesta:

```js
{
  "msg": "post data to API - controller",
  "user": {
    "name": "Carlos",
    "email": "test1@mail.com",
    "password": "123456",
    "role": "USER_ROLE",
    "status": true,
    "google": true,
    "_id": "61b63fadaa0ff62ec187b54d",
    "__v": 0
  }
}
```

## BcryptJS: Encriptando la contraseña

Primero vamos a hacer una validación para los datos de nuestro endpoint. Como estamos creando un usuario, algunos datos estarán por defecto, por lo que necesitamos que aunque los pasen en el json del request, no se creen, solo los que solicitamos nosotros.

```js
const usersPost = async (req, res = response) => {
    const { name, email, password, role } = req.body
    const user = new User({ name, email, password, role })
    ...
}
```

Por ejemplo pasamos este request:

```json
{
    "name": "Carlos",
    "email": "test1@mail.com",
    "password": "123456",
    "role": "USER_ROLE",
    "status": false,
    "img": "",
    "google": true
}
```

La respuesta que debemos obtener solo debe tener modificados los campos que desestructuramos en la función:

```json
{
  "msg": "post data to API - controller",
  "user": {
    "name": "Carlos",
    "email": "test1@mail.com",
    "password": "123456",
    "role": "USER_ROLE",
    "status": true,
    "google": false,
    "_id": "61b6422a562d03588213436d",
    "__v": 0
  }
}
```

Ahora si vamos a encriptar la contraseña. Necesitamos instalar el paquete **BcryptJS** para tener un hash de una sola via. Para la instalación usamos el comando `npm i bcryptjs`, y para usarlo hacemos lo siguiente: Lo importamos, y dentro de nuestra función creamos un `salt` con el que definimos la cantidad de vueltas a dar dentro del hash (por defecto 10), entre más vueltas mejor, pero también aumenta el tiempo de respuesta. Luego le decimos a la función que la contraseña del usuario debe tener un hash y para ello usamos la función `hashSync()` usando por parámetros la contraseña que ingresa por el body y la variable salt (esta es opcional).

```js
const bcryptjs = require('bcryptjs')


const usersPost = async (req, res = response) => {
    ...
    const salt = bcryptjs.genSaltSync(20)
    user.password = bcryptjs.hashSync(password, salt)
    ...
}
```

Podemos usar la misma petición de arriba y veremos que la respuesta será la siguiente (como son usuarios de prueba, los he ido eliminado de la BD):

```json
{
  "msg": "post data to API - controller",
  "user": {
    "name": "Carlos",
    "email": "test1@mail.com",
    "password": "$2a$10$1fRDbbFOhEfm.0ORywajSOyr/ugx6rs.Ogv7b/uBnKwb88GJ0aNZ2",
    "role": "USER_ROLE",
    "status": true,
    "google": false,
    "_id": "61b6476004c94d938c176baf",
    "__v": 0
  }
}
```

## Validar campos obligatorios, Email

Debemos validar que el campo de correo sea una expresión que si sea un correo, para ello podriamos hacer la comparación con una expresión regular, pero como el correo se va a usar en muchos campos estariamos repitiendo mucho código. La solución es un paquete llamado Express Validator y los instalamos con el comando `npm i express-validator`.

Primero vamos a validar si el correo existe, y si ese es el caso se envia un estatus de error:

```js
const usersPost = async (req, res = response) => {
    ...
    const emailExists = await User.findOne({ email })
    if (emailExists) {
        return res.status(400).json({
            error: 'El correo ya está registrado'
        })
    }
    ...
}
```

El paquete de express-validator nos proporciona diversos middlewares, los cuales para usarlos se ponen antes de definir el controlador en las rutas. Por ejemplo usar un middleware para validar si es un correo:

```js
const { check } = require('express-validator')

router.post('/', [
    check('email', 'El correo no es valido').isEmail(),
], usersPost)
```

Los errores que nos dan estos middleware los debemos manipular en los métodos de los controladores en donde validamos los resultados, obviamente como en algunos otros métodos se usaran las mismas validaciones, se extraeran luego en otros archivos:

```js
const { validationResult } = require('express-validator')

const usersPost = async (req, res = response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(errors)
    }
    ...
}
```

Si enviamos un email invalido obtendremos este mensaje:

```json
{
  "errors": [
    {
      "value": "test1",
      "msg": "El correo no es valido",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Validar todos los campos obligatorios

Volvemos a usar middlewares para validar que el campo de nombre NO esté vacio.

```js
router.post('/', [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    ...
], usersPost)
```

Si enviamos el nombre vacio obtendremos esto:

```json
{
  "errors": [
    {
      "value": "",
      "msg": "El nombre es obligatorio",
      "param": "name",
      "location": "body"
    }
  ]
}
```

Usamos de nuevo el middleware para validar que la contraseña sea de minimo 6 letras:

```js
router.post('/', [
    ...,
    check('password', 'La contraseña debe tener más de 6 letras').isLength({min: 6}),
    ...
], usersPost)
```

En caso contrario obtenemos este mensaje:

```json
{
  "errors": [
    {
      "value": "12345",
      "msg": "La contraseña debe tener más de 6 letras",
      "param": "password",
      "location": "body"
    }
  ]
}
```

También validamos que el rol sea uno de los valores predeterminados en una lista:

```js
router.post('/', [
    ...
    check('role', 'No es un rol válido').isIn(['ADMIN_ROLE', 'USER_ROLE']),
], usersPost)
```

```json
{
  "errors": [
    {
      "value": "SUPERUSER_ROLE",
      "msg": "No es un rol válido",
      "param": "role",
      "location": "body"
    }
  ]
}
```

Vamos a crear un middleware personalizado para validar los errores que se obtienen en el request y así poderlo usar en otras funciones. Creamos el archivo `middleware/validate-fields.js` y creamos una función para exportar, dentro de la cual copiamos el código que teniamos en el controlador:

```js
const { validationResult } = require('express-validator')


const validateFields = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json(errors)
    next()
}


module.exports = {
    validateFields
}
```

Como es un middleware que aplica una validación, lo llamamos despues de los demás middlewares de las rutas:

```js
router.post('/', [
    ...,
    validateFields
], usersPost)
```

## Validar rol contra base de datos

En el momento tenemos 2 roles estaticos, pero en caso de que queramos tener más y con reglas que apliquen a cada uno, el mundo se nos complica. Por ello vamos a crear una nueva colección a nuestra base de datos mediante MongoDB Compass. En la misma herramienta, una vez creada la colección, añadimos 3 nuevos documentos:

```json
{
    "role": "ADMIN_ROLE"
}
```

```json
{
    "role": "USER_ROLE"
}
```

```json
{
    "role": "SALES_ROLE"
}
```

Para leer los documentos dentro de la colección, creamos un modelo en nuestro proyecto dentro del archivo `models/role.js`.

```js
const { Schema, model } = require('mongoose')


const RoleSchema = Schema({
    role: {
        type: String,
        required: [true, 'El rol es obligatorio']
    }
})


module.exports = model('Role', RoleSchema)
```

Ahora usamos un middleware que nos valide una función asincrona que tenga en cuenta los roles existentes en el modelo y los compare con el que se está intentando ingresar.

```js
router.post('/', [
    ...,
    check('role').custom(async (role = '') => {
        const roleExists = await Role.findOne({ role })
        if(!roleExists) {
            throw new Error(`El rol ${role} no está registrado en la base de datos`)
        }
    }),
    ...
], usersPost)
```

En caso de que se ingrese un rol que no existe, se nos mostrara este mensaje:

```json
{
  "errors": [
    {
      "value": "SUPERUSER_ROLE",
      "msg": "El rol SUPERUSER_ROLE no está registrado en la base de datos",
      "param": "role",
      "location": "body"
    }
  ]
}
```

## Centralizar la validación del rol

Creamos un nuevo archivo llamado `helpers/db-validators.js` en el cual copiamos la validación del rol:

```js
const Role = require('../models/role')


const validRole = async (role = '') => {
    const roleExists = await Role.findOne({ role })
    if(!roleExists) {
        throw new Error(`El rol ${role} no está registrado en la base de datos`)
    }
}


module.exports = {
    validRole
}
```

Y llamamos la función dentro del middleware de comparación en la ruta:

```js
router.post('/', [
    ...,
    check('role').custom(validRole),
    ...
], usersPost)
```

Para ocultar la versión y el hash de la contraseña del usuario de la respuesta del método, sobrescribimos el método `toJSON()` del modelo de usuario para descartar los elementos que queremos ocultar. Definimos cuales son las propiedas a ocultar y definimos las demás con un objeto nuevo, el cual retornamos:

```js
UserSchema.methods.toJSON = function() {
    const { __v, password, ...user} = this.toObject()
    return user
}
```

Cuando creamos un nuevo usuario, esta será la respuesta:

```json
{
  "msg": "post data to API - controller",
  "user": {
    "name": "Carlos",
    "email": "test1@mail.com",
    "role": "USER_ROLE",
    "status": true,
    "google": false,
    "_id": "61b66615f9c71e9bd12bc08a"
  }
}
```

## Tarea - Custom validation - EmailExiste

Vamos a centralizar el la validación de si un correo ya existe, para evitar que se haga en controlador y más bien sea pasado por un middleware. Lo primero es crear una función en el archivo `db-validator.js` y dentro de la misma copiar el código de validación.

```js
const User = require('../models/user')


const emailExists = async (email) => {
    const emailExists = await User.findOne({ email })
    if (emailExists) throw new Error(`El correo ${email} ya está registrado en la base de datos`)
}


module.exports = {
    ...,
    emailExists
}
```

Luego, llamamos el método dentro de los middlewares de la ruta:

```js
router.post('/', [
    ...,
    check('email').custom(emailExists),
    ...
], usersPost)
```

## PUT: Actualizar información del usuario

Para actualizar la información de un usuario vamos a modificar el controlador de la ruta put. Lo primero es convertirlo en una función asincrona. Luego, desestructuramos la contraseña, el parametro de google, el correo y lo demás será un nuevo objeto. Si el usuario modifica la contraseña, creamos un nuevo hash para la misma y la añadimos al objeto que agrupa las caracteristicas a modificar. Posteriormente usamos una función de mongoose para buscar por id y actualizar los datos del registro que encuentre con ese id.

```js
const usersPut = async (req, res = response) => {
    const { id } = req.params
    const { password, google, email, ...resto } = req.body
    
    if (password) {
        const salt = bcryptjs.genSaltSync()
        resto.password = bcryptjs.hashSync(password, salt)
    }
    const user = await User.findByIdAndUpdate(id, resto)

    res.json({
        msg: 'put data to API - controller',
        id,
    })
}
```

Si nosotros ponemos un id que no existe, este será el resultado (recordar que cambiamos el método a PUT dentro de Postman o Thunder):

```txt
UnhandledPromiseRejectionWarning: CastError: Cast to ObjectId failed for value "1" (type string) at path "_id" for model "User" ...
```

Por tal motivo, por el momento, vamos a tomar un id de los documentos de nuestra base de datos, y pasaremos los siguientes valores:

```json
{
    "name": "Usuario Actualizado",
    "email": "testActualizado@mail.com",
    "password": "123456",
    "role": "SuperUSER_ROLE",
    "status": false,
    "img": "",
    "google": true
}
```

La respuesta del REST API Client será la siguiente:

```json
{
  "msg": "put data to API - controller",
  "id": "61b66615f9c71e9bd12bc08a"
}
```

Y el documento con ese id tendrá los siguientes valores:

```json
{
    "_id":{"$oid":"61b66615f9c71e9bd12bc08a"},
    "name":"Usuario Actualizado",
    "email":"test1@mail.com",
    "password":"$2a$10$ZOZCV3RJLEA6uS127HLP1O.POmHoVvN9oCJc8XgCO53cjLvhlqIte",
    "role":"SuperUSER_ROLE",
    "status":false,
    "google":false,
    "__v":0
}
```

## Validaciones adicionales en el PUT

Debemos evitar que se modifique el campo `_id` del documento del usuario, por lo que vamos a desestructurarlo de los valores que se pasan por el request.

```js
const usersPut = async (req, res = response) => {
    ...
    const { _id, password, google, email, ...resto } = req.body
    ...
}
```

Ahora también vamos a controlar que el id que se pasa por parámetro sea valido, para ello volvemos con los middlewares:

```js
router.put('/:id', [
    check('id', 'No es un id valido').isMongoId(),
    validateFields
], usersPut)
```

Si pasamos un id invalido, obtendremos estos errores:

```json
{
  "errors": [
    {
      "value": "61b66615f9c71e9bd12bc09as",
      "msg": "No es un id valido",
      "param": "id",
      "location": "params"
    }
}
```

Creamos también una función para validar si existe algún usuario con el id que se está pasando:

```js
const userExistsByID = async (id) => {
    const userExists = await User.findById(id)
    if (!userExists) throw new Error(`El usuario con id ${id} no está registrado en la base de datos`)
}
```

Si se ingresa un id que no existe, este será el error:

```json
{
  "errors": [
    {
      "value": "61b66615f9c71e9bd12bc09a",
      "msg": "El usuario con id 61b66615f9c71e9bd12bc09a no está registrado en la base de datos",
      "param": "id",
      "location": "params"
    }
  ]
}
```

Volvemos a validar el rol del usuario, y usamos dentro del middleware para validar el rol la función de validación:

```js
router.put('/:id', [
    ...
    check('role').custom(validRole),
    validateFields
], usersPut)
```

## GET: Obtener todos los usuarios de manera paginada

Creamos varios usuarios de prueba (es este caso 15). Nos vamos al controlador del método GET. Ahora queremos traer una cantidad limite de usuarios, para lo cual podemos obtener el valor de limit desde la query y lo pasamos como parámetro a la función `limit()`:

```js
const usersGet = async (req = request, res = response) => {
    const { limit = 5 } = req.query
    const users = await User.find()
        .limit(Number(limit))

    res.json({
        users
    })
}
```

También podemos definir desde que registro queremos obtener la consulta, mediante el método `skip()`:

```js
const usersGet = async (req = request, res = response) => {
    const { limit = 5, from = 0 } = req.query
    const users = await User.find()
        .skip(Number(from))
        .limit(Number(limit))

    res.json({
        users
    })
}
```

## Retornar número total de registros en una colección

Para retornar la cantidad de documentos dentro de la colección de la base de datos usamos la función `countDocuments()`.

```js
const usersGet = async (req = request, res = response) => {
    ...
    const total = await User.countDocuments()
    ...
}
```

Ya no es recomendable borrar los registros dentro una colección, puede ser porque algunos tienen relaciones con algunos otros documentos y esto puede generar problemas. Por ello es recomendable tener un campo en los registros donde el estado `true` haga referencia a que está activo dentro de la plataforma o `false` cuando a sido deshabilitado, inactivo o eliminado de nuestra aplicación.

El total de registros debe cambiar y los que se muestran, pues ya no se debe contar a aquellos que estén en el estado comentado anteriormente. Para ello aplicamos un filtro a nuestra consulta.

```js
const usersGet = async (req = request, res = response) => {
    ...
    const query = { status: true }
    const users = await User.find(query)
        ...
    const total = await User.countDocuments(query)
    ...
}
```

Tanto `users` como `total` son promesas, pero se van a ejecutar una después de la otra por el `await`, lo que genera un retraso en las respuestas. Una forma de hacer que ambas se ejecuten a la vez es usando `Promise.all()`, el inconveniente va a ser que si da error en una, las demás también.

```js
const usersGet = async (req = request, res = response) => {
    const { limit = 5, from = 0 } = req.query
    const query = { status: true }

    const results = await Promise.all([
        User.countDocuments(query),
        User.find(query)
            .skip(Number(from))
            .limit(Number(limit))
    ])

    res.json({
        results
    })
}
```

Para retornar de manera más elegante el JSON, hacemos desestructuración de arreglos:

```js
const usersGet = async (req = request, res = response) => {
    ...
    const [ total, users ] = await Promise.all([
        ...
    ])

    res.json({
        total,
        users
    })
}
```

## DELETE: Borrando un usuario de la base de datos

Para la ruta de Delete debemos recibir el id por parámetro:

```js
router.delete('/:id', usersDelete)
```

Vamos a eliminar un usuario físicamente, esto no es recomendado por lo que se comentaba en la sección anterior. Lo primero es aplicar las validaciones necesarias en la ruta, mediante los middlewares:

```js
router.delete('/total-delete/:id', [
    check('id', 'No es un id valido').isMongoId(),
    check('id').custom(userExistsByID),
    validateFields
], usersTotalDelete)
```

Luego, en el controlador buscamos el usuario por el id y lo eliminamos:

```js
const usersTotalDelete = async (req, res = response) => {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)

    res.json({
        msg: 'total delete data from API - controller',
        user
    })
}
```

Cuando eliminamos el usuario, tendremos la siguiente respuesta:

```json
{
  "msg": "total delete data from API - controller",
  "user": {
    "_id": "61b68a65d1f6b75dbd19951f",
    "name": "test16",
    "email": "test16@mail.com",
    "role": "USER_ROLE",
    "status": true,
    "google": false
  }
}
```

Y si volvemos a intentar eliminar ese mismo id, tendremos la siguiente respuesta:

```json
{
  "errors": [
    {
      "value": "61b68a65d1f6b75dbd19951f",
      "msg": "El usuario con id 61b68a65d1f6b75dbd19951f no está registrado en la base de datos",
      "param": "id",
      "location": "params"
    }
  ]
}
```

Esto no es recomendable, puesto que si ha modificado documentos o tiene relación con ellos, se pierde la integridad referencial. Entonces surge el método para eliminar de manera "parcial", que lo que hace es simplemente modificar el campo de estado o status:

```js
const usersPartialDelete = async (req, res = response) => {
    const { id } = req.params

    const user = await User.findByIdAndUpdate(id, { status: false })

    res.json({
        msg: 'partial delete data from API - controller',
        user
    })
}
```

Si volvemos hacer una petición GET, se mostrara que el total es un registro menos.

## Desplegar RESTServer en Heroku

Para actualizar la plataforma en Heroku, debemos actualizar los cambios con git para almacenar el cambio en local `git add .` `git commit -m "<Nombre del commit>"`, luego enviamos los cambios a heroku en la rama que se está subiendo `git push heroku <branch>`. Al estar desplegado en Heroku, con la configuración global de CORS y con la base de datos en MongoAtlas, cualquier persona puede acceder a nuestro RESTServer y hacer el CRUD.

## Variables de entorno personalizadas Heroku

No es recomendable subir el archivo `.env` a un repositorio, por privacidad y seguridad, en caso de que ya se le esté haciendo seguimiento al archivo, lo podemos eliminar con el comando `git rm <directorio>.env --cached` y guardamos el commit. La idea es subir un archivo de respaldo como por ejemplo `.example.env` y ponemos los enunciados de que variables de entorno necesitamos.

El problema viene con Heroku porque no va a reconocer el archivo `.env`. Para ver las variables de entorno que reconocer Heroku usamos el comando `heroku config`. Para añadir una nueva variable de entorno usamos el comando `heroku config:set <nombre de variable>="Valor"`, es recomendable que el nombre de la variable sea semanticamente igual a como la necesita nuestro proyecto. Para eliminar la variable usamos el comando `heroku config:unset`.

Luego de configurar las variables de entorno se vuelve a subir los cambios a Heroku.
