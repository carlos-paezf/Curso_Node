# Sección 10: Autenticación de usuario - JWT

Aquí cubriremos varios temas como:

- Introducción a los tokens
- JWT
- Login personalizado
- Protección de rutas vía token
- Leer payload del token sin la firma
- Tips importantes para Postman
- Despliegues en Heroku para pruebas en producción
- Uso de Middleware

## Introducción a los Tokens

Un token puede ser físico o virtual, y la razón de usarlas es por el tema de variables de sesión, puesto que estás últimas son útiles en plataformas con 5000 o 10000 usuarios, el problema radica en que un usuario puede iniciar sesión en múltiples dispositivos.

Un JSON Web Token (JWT) está compuesto de un header, un payload y una firma. El header contiene la información del algoritmo para la encriptación junto con el tipo de token, el payload contiene la información que se quiere almacenar en el token, y la firma le permite a los verificadores de token saber si el valido.

Los token permiten que el servidor no conozca cuantas personas estén conectadas, solo los reconoce cuando se hace la validación del token.

Existe un código para leer el payload y la fecha de expiración de un token [Tomado de Klerith/parse-jwt.js](https://gist.github.com/Klerith/44ee5349fa13699d9c5f1e82b3be040e), es muy importante NO USAR está función, solo es educativa:

```js
function parseJWT (token) {
    var base64Url = token.split('.')[1]
    var base54 = base64Url.replace('-', '+').replace('_', '/')
    return JSON.parse(window.atob(base64))
}
```

## Información importante sobre los JWT

Vamos a la página de [JWT](https://jwt.io/), allí podemos observar un ejemplo del contenido de cada una de las partes de un JWT. En header podemos ver el algoritmo de encriptación, el cual por defecto es un `HS256`, un algoritmo de doble vía, con el cual podemos observar el contenido de lo que hay en el payload. Los JWT se graban comunmente de manera local en el Local Storage para que persistan en el equipo.

## Crear ruta autenticación - Auth - Login

Se toma nuevamente como base el proyecto de la sección anterior, para instalar de nuevo los paquetes se usa `npm install` o `npm i`. Para levantar el servidor hago uso de `nodemon app`. Volvemos a conectarnos con nuestra base de datos a través de MongoDB Compass. También volvemos a abrir Postman o Thunder (en VSCode).

La idea es ahora crear una ruta para el login que sea de la siguiente manera: `http://localhost:8080/api/auth/login` y que además sea de tipo POST. Lo primero es ir al constructor de la clase Server y crear una nueva variable, la cual la enviaremos por medio del middleware `use()` en nuestras rutas:

```js
class Server {
    constructor() {
        ...
        this.authPath = '/api/auth'
        ...
    }
    ...
    routes() {
        this.app.use(this.authPath, require('../routes/auth.routes'))
        ...
    }
}
```

Creamos el archivo `routes/auth.routes.js` y copiamos la primera parte del contenido del otro archivo de rutas, lo modificamos a nuestra necesidad y obtendriamos lo siguiente:

```js
const { Router } = require('express')
const { check } = require('express-validator')

const router = Router()


router.post('/login', login)


module.exports = router
```

Creamos el archivo para el controlador de las rutas de auth `controllers/auth.controller.js` y creamos la función que controla la ruta de login:

```js
const { request, response } = require('express')


const login = async (req, res = response) => {
    res.json({
        msg: 'Login ok'
    })
}


module.exports = {
    login
}
```

Debemos aplicar middlewares a la ruta, como por ejemplo, verificar que se pase un email o que sea valido, o que la contraseña sea obligatorio:

```js
const { validateFields } = require('../middleware/validate-fields')

router.post('/login', [
    check('email', 'El correo es obligatorio').not().isEmpty(),
    check('email', 'Debe ingresar un correo valido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
], login)
```

Esta ruta tendra un body como el siguiente:

```json
{
    "email": "test1@mail.com",
    "password": "123456"
}
```

## Configuración de los API Client

Tanto en Postman como en Thunder Client, al momento, tengo la siguiente configuración (Los ejemplos de los body los he venido especificando en los Readmes de cada sección):

| Sección              | Valor                                | Nombre                                             | Ruta                                        |
| -------------------- | ------------------------------------ | -------------------------------------------------- | ------------------------------------------- |
| **Enviroment (ENV)** | Producción - RESTServer Node MongoDB |
|                      |                                      | {{url-users}}                                      | http://localhost:8080/api/users             |
|                      |                                      | {{url-auth}}                                       | http://localhost:8080/api/auth              |
| **Collections**      | Users - RESTServer Node MongoDB      |
|                      | GET                                  | Obtener usuarios de manera paginada - Café MongoDB | {{url-users}}?limit=`n`&from=`n`            |
|                      | POST (Contiene un body)              | Crear un usuario - Cafe MongoDB                    | {{url-users}}                               |
|                      | PUT (Contiene un body)               | Actualizar un usuario - Café MongoDB               | {{url-users}}/`id-Documento`                |
|                      | DELETE                               | Eliminación TOTAL de un usuario - Café MongoDB     | {{url-users}}/total-delete/`id-Documento`   |
|                      | DELETE                               | Eliminación PARCIAL de un usuario - Café MongoDB   | {{url-users}}/partial-delete/`id-Documento` |
| **Collections**      | Auth - RESTServer Node MongoDB       |
|                      | POST (Contiene un body)              | Login - Café MongoDB                               | {{url-auth}}/login                          |

## Login de usuario

Dentro del controlador de login vamos a validar si el email que se ingresa existe, si el usuario está activo dentro de nuestra base de datos, si la contraseña es correcta, y también generamos el JWT. Lo primero va a ser verificar el email en nuestra base de datos:

```js
const User = require('../models/user')


const login = async (req, res = response) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ msg: "Email / Password incorrectos - Email" })
        ...
    } catch (error) {
        ...
    }
}
```

Procedemos a verificar si el usuario esta activo dentro de nuestra BD y no ha sido eliminado.

```js
const User = require('../models/user')


const login = async (req, res = response) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        ...
        if (!user.status) return res.status(400).json({ msg: "Email / Password incorrectos - Status" })
        ...
    } catch (error) {
        ...
    }
}
```

Comparamos la contraseña que se ingresa con la que se encuentra en nuestra base de datos, recordar que la última esta cifrada, por lo que usamos de nuevo Bcryptjs para hacer la comparación:

```js
const bcryptjs = require('bcryptjs')

const login = async (req, res = response) => {
    const { email, password } = req.body

    try {
        ...
        const validPassword = bcryptjs.compareSync(password, user.password)
        if (!validPassword) return res.status(400).json({ msg: "Email / Password incorrectos - Password" })
        ...
    } catch (error) {
        ...
    }
}
```

Estos serán los errores que nos pueden aparecer con code 400 gracias a los middlewares:

```json
{
  "errors": [
    {
      "value": "",
      "msg": "El correo es obligatorio",
      "param": "email",
      "location": "body"
    },
    {
      "value": "",
      "msg": "Debe ingresar un correo valido",
      "param": "email",
      "location": "body"
    },
    {
      "value": "",
      "msg": "La contraseña es obligatoria",
      "param": "password",
      "location": "body"
    }
  ]
}
```

Y estos serán los mensajes de alerta que generamos por nuestra parte:

```json
{
  "msg": "Email / Password incorrectos - Email"
}
```

```json
{
  "msg": "Email / Password incorrectos - Status"
}
```

```json
{
  "msg": "Email / Password incorrectos - Password"
}
```

## Generar un JWT

Vamos a utilizar un nuevo paquete para los JWT, y lo instalamos con el comando `npm i jsonwebtoken`. Creamos un archivo llamado `helpers/generate-JWT.js`. Dentro de este archivo creamos una función que genere un JWT a partir del uid (User Identifier) del usuario. Vamos a retornar una promesa en la cual tenemos un payload que se entrega a la función de `sign()`, la cual a su vez también pide una llave secreta para firmar el token. Lo que vamos a hacer es crear una variable de entorno para la llave privada, su valor debe ser bastante seguro, por el momento tenemos una llave con un valor educativo:

```.env
SECRET_KEY = "3st@_3s_my_Pub1ic_K3Y"
```

Continuando con la función, el tercer parámetro de `sign()` son las opciones, como por ejemplo el tiempo en que expira del token. Por último tenemos un callback que nos permite obtener un error, o en caso contrario el token.

```js
require('dotenv').config()
require('colors')
const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.SECRET_KEY


const generateJWT = (uid = '') => {
    return new Promise((resolve, reject) => {
        const payload = { uid }
        jwt.sign(payload, SECRET_KEY, {
            expiresIn: '2h'
        }, (err, token) => {
            if (err) {
                console.log('Error: '.red, err)
                reject('No se pudo generar un token')
            } else {
                resolve(token)
            }
        })
    })
}


module.exports = {
    generateJWT
}
```

Una vez terminado este helper, lo usamos dentro del controlador de login:

```js
const login = async (req, res = response) => {
    const { email, password } = req.body

    try {
        ...
        const token = await generateJWT(user.id)

        res.json({
            msg: 'Login ok',
            user,
            token
        })
    } catch (error) {
        ...
    }
}
```

Cuando hacemos la petición http con un correo y una contraseña validas, obtendremos la siguiente respuesta:

```json
{
  "msg": "Login ok",
  "user": {
    "_id": "61b67df238d4b5b335d32217",
    "name": "test2",
    "email": "test2@mail.com",
    "role": "USER_ROLE",
    "status": true,
    "google": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MWI2N2RmMjM4ZDRiNWIzMzVkMzIyMTciLCJpYXQiOjE2Mzk0MjI2NjcsImV4cCI6MTYzOTQyOTg2N30.BrR9E31hHfkRaqLr_bfheuZz20Tmtm4u6J2A15NWEZQ"
}
```

## Cambiar visualmente un _id por un uid en Mongoose

Cuando generamos las peticiones y pedimos que se retorne la información de usuario, nosotros obtenemos un _id, la idea es cambiar el nombre de esa propiedad a uid, pero sin cambiar el nombre en la base de datos. Para hacer esto sobrescribimos de nuevo el método `toJSON()` del modelo User:

```js
UserSchema.methods.toJSON = function() {
    const { __v, password, _id, ...user} = this.toObject()
    user.uid = _id
    return user
}
```

## Proteger rutas mediante uso de Token Middlewares

Vamos a crear una middleware para validar el jwt, para ello creamos el archivo `middleware/validate-jwt.js`. Dentro de dicho archivo creamos una función para la validación. Lo primero que debe hacer es rescatar el token que se le va a pasar a la request mediante los headers, este campo se puede llamar Authorization, etc, en nuestro caso se llama x-token. Si el token no ha sido pasado, se envia un mensaje de error. Una vez tengamos el token vamos a obtener el `uid` que viene desde el `payload` del token que ha sido verificado mediante la función de `verify`. En caso de que el token sea invalido, lanzamos un error:

```js
require('dotenv').config()
const { response, request } = require('express');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY


const validateJWT = (req = request, res = response, next) => {
    const token = req.header('x-token')
    if (!token) return res.status(401).json({ msg: "No hay token en la petición" })

    try {
        const { uid } = jwt.verify(token, SECRET_KEY)
        req.uid = uid
        next()
    } catch (error) {
        console.log('Error: '.red, error)
        res.status(401).json({ msg: "Token no valido" })
    }
}


module.exports = {
    validateJWT
}
```

Por ejemplo queremos proteger la ruta de eliminación total y parcial, para ello, en el archivo de las rutas, en los middlewares de dichas acciones llamamos de primeras el middleware de verificación de token.

```js
router.delete('/total-delete/:id', [
    validateJWT,
    ...
], usersTotalDelete)

router.delete('/partial-delete/:id', [
    validateJWT,
    ...
], usersPartialDelete)
```

Cuando vamos a hacer la petición, debemos pasar el JWT en el campo x-token del header de la solicitud.

## Obtener información del usuario autenticado

Podemos obtener información del usuario autenticado mediante el JWT. Dentro del middleware para validar el JWT, una vez obtenido el uid que se encuentra en el payload, podemos consultar por id en el modelo de User, el valor que se encuentre allí se lo pasamos como parte de la request, y este propiedad la podemos recuperar dentro del controlador de la ruta:

```js
const User = require('../models/user');

const validateJWT = async (req = request, res = response, next) => {
    ...
    try {
        const { uid } = jwt.verify(token, SECRET_KEY)
        ...
        const userAuth = await User.findById(uid)
        req.userAuth = userAuth
        ...
    } catch (error) {
        ...
    }
}
```

```js
const usersPartialDelete = async (req, res = response) => {
    ...
    const userAuth = req.userAuth

    res.json({
        ...,
        userAuth
    })
}
```

Habiendo entendido como obtener la información del usuario, debemos verificar si el usuario esta inactivo en nuestra base de datos, por que si ese es el caso, no puede ejecutar ninguna acción, o también se puede dar el caso de que un usuario ha sido eliminado físicamente de la BD pero su token sigue activo:

```js
const validateJWT = async (req = request, res = response, next) => {
    ...
    try {
        ...
        const userAuth = await User.findById(uid)
        if (!userAuth) return res.status(401).json({ msg: "Token no valido - Usuario no existe" })
        if (!userAuth.status) return res.status(401).json({ msg: "Token no valido - Usuario status=false" })
        req.userAuth = userAuth
        ...
    } catch (error) {
        ...
    }
}
```

## Middleware: Verificar rol de administrador

Vamos a crear un middleware dentro del archivo `middleware/validate-role.js`. Lo que va a hacer esta función es verificar que ya se haya guardado el usuario autenticado en la request, tomamos el rol y el nombre y hacemos la validación de si el role pertenece a administrador.

```js
const { response } = require("express")


const validateAdminRole = (req, res = response, next) => {
    if (!req.userAuth) return res.status(500).json({ msg: "Validando rol sin verificar el token" })
    
    const { role, name } = req.userAuth

    if (role !== 'ADMIN_ROLE') return res.status(401).json({ msg: `El usuario ${name} no es adminstrador` })

    next()
}


module.exports = {
    validateAdminRole
}
```

Este middleware lo llamamos en la ruta a proteger, una vez se haya hecho la validación del JWT.

```js
router.delete('/partial-delete/:id', [
    validateJWT,
    validateAdminRole,
    ...
], usersPartialDelete)
```

## Middleware: Tiene rol

Vamos a crear un middleware que sea más flexible y no solo valide si es administrador, si no que reciba por parámetros que roles pueden realizar la acción. Este es un middleware un tanto más complicado porque los parámetros de la funcion seran los roles y no el req, res y next; estos últimos seran los parámetros de una función que retornara nuestro middleware.

Dicha función anonima que se retorna va a validar que el request tenga el token, y luego que el rol del usuario autenticado este en el arreglo de roles que se han pasado por parámetro.

```js
const hasRole = (...roles) => {
    return (req, res = response, next) => {
        if (!req.userAuth) return res.status(500).json({ msg: "Validando rol sin verificar el token" })
        if (!roles.includes(req.userAuth.role)) return res.status(401).json({ msg: `El servicio requiere uno de esto roles: ${roles}` })
        next()
    }
}


module.exports = {
    ...,
    hasRole
}
```

```js
router.delete('/partial-delete/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE', 'OTHER_ROLE'),
    ...
], usersPartialDelete)
```

## Optimizar importaciones en Node

En el archivo de `user.routes.js` hay muchas importaciones que apuntan a un solo directorio. Lo que vamos a hacer es crear un archivo llamado `middleware/index.js` y vamos a crear unas contantes que apunten a los archivos necesarios. Luego exportamos dichas constantes acompañados del operado spread para poder obtener su contenido mediante desestructuración.

```js
const validateFields = require('../middleware/validate-fields')
const validateJWT = require('../middleware/validate-jwt')
const validateRole = require('../middleware/validate-role')


module.exports = {
    ...validateFields,
    ...validateJWT,
    ...validateRole
}
```

La importación en las rutas sería la siguiente:

```js
const { validateFields, validateJWT, validateAdminRole, hasRole } = require('../middleware')
```

## Desplegar en Heroku

Importante que se suba una variable de entorno al despliegue en heroku mediante el comando `heroku config:set SECRET_KEY="valor"` y luego podemos hacer el commit. Si queremos observar los logs de heroku, usamos el comando `heroku logs -n <Cantidad de logs a ver, ejm: 100>` y si lo queremos ver en vivo usamos el comando `heroku logs -n 100 --tail`
