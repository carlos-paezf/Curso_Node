# Sección 13: Carga de Archivos y protección de los mismos

Aquí cubriremos varios temas como:

- Carga de archivos
- Validaciones de archivos
- Re-ubicar archivos
- Actualizar fotografía del usuario
- Borrar archivos
- Cargar imágenes a los productos
- Servicio para mostrar y proteger imágenes
- Uso de dichas imágenes en el front-end
- Cluodinary
- Cloudinary SDK

## Client Server

En la siguiente tabla se muestran todos los endpoints resultantes de la sección anterior, estos están guardados en Postman y en Thunder. Para observar la documentación de los servicios ingresar al siguiente enlace: [POSTMAN Documentation, Curso Node - Café RESTServer](https://documenter.getpostman.com/view/8438809/UVR7L8dz).

| Sección              | Nombre                                 | Método                                                              | Ruta                                             |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| **Enviroment (ENV)** | *Producción - RESTServer Node MongoDB* |
|                      | {{url-users}}                          |                                                                     | http://localhost:8080/api/users                  |
|                      | {{url-auth}}                           |                                                                     | http://localhost:8080/api/auth                   |
|                      | {{url-categories}}                     |                                                                     | http://localhost:8080/api/categories             |
|                      | {{url-products}}                       |                                                                     | http://localhost:8080/api/products               |
|                      | {{url-search}}                         |                                                                     | http://localhost:8080/api/search                 |
| **Collections**      | *Café RESTServer Node MongoDB*         |
| **Folder**           | *Auth*                                 |
|                      | Login                                  | POST (Contiene un body)                                             | {{url-auth}}/login                               |
|                      | Google Sign In                         | POST (Contiende un body)                                            | {{url-auth}}/google                              |
| **Folder**           | *Users*                                |
|                      | Obtener usuarios de manera paginada    | GET                                                                 | {{url-users}}?limit=`n`&from=`n`                 |
|                      | Obtener usuario por ID                 | GET                                                                 | {{url-users}}/`id-Documento`                     |
|                      | Crear un usuario                       | POST (Contiene un body)                                             | {{url-users}}                                    |
|                      | Actualizar un usuario                  | PUT (Contiene un body)                                              | {{url-users}}/`id-Documento`                     |
|                      | Eliminación TOTAL de un usuario        | DELETE (Se debe pasar el token por el header, solo admin)           | {{url-users}}/total-delete/`id-Documento`        |
|                      | Eliminación PARCIAL de un usuario      | DELETE (Se debe pasar el token por el header, roles personalizados) | {{url-users}}/partial-delete/`id-Documento`      |
| **Folder**           | *Categories*                           |
|                      | Obtener categorías de manera paginada  | GET                                                                 | {{url-categories}}?limit=`n`&from=`n`            |
|                      | Obtener categoría por ID               | GET                                                                 | {{url-categories}}/`id-Documento`                |
|                      | Crear una categoría                    | POST (Contiene un body)                                             | {{url-categories}}                               |
|                      | Actualizar una categoría               | PUT (Contiene un body)                                              | {{url-categories}}/`id-Documento`                |
|                      | Eliminación TOTAL de una categoría     | DELETE (Se debe pasar el token por el header, solo admin)           | {{url-categories}}/total-delete/`id-Documento`   |
|                      | Eliminación PARCIAL de una categoría   | DELETE (Se debe pasar el token por el header, roles personalizados) | {{url-categories}}/partial-delete/`id-Documento` |
| **Folder**           | *Products*                             |
|                      | Obtener productos de manera paginada   | GET                                                                 | {{url-products}}?limit=`n`&from=`n`              |
|                      | Obtener producto por ID                | GET                                                                 | {{url-products}}/`id-Documento`                  |
|                      | Crear un producto                      | POST (Contiene un body)                                             | {{url-products}}                                 |
|                      | Actualizar un producto                 | PUT (Contiene un body)                                              | {{url-products}}/`id-Documento`                  |
|                      | Eliminación TOTAL de un producto       | DELETE (Se debe pasar el token por el header, solo admin)           | {{url-products}}/total-delete/`id-Documento`     |
|                      | Eliminación PARCIAL de un producto     | DELETE (Se debe pasar el token por el header, roles personalizados) | {{url-products}}/partial-delete/`id-Documento`   |
| **Folder**           | *Search*                               |
|                      | Buscar un usuario por su ID            | GET                                                                 | {{url-search}}/users/`id-Documento`              |
|                      | Buscar usuarios por nombre             | GET                                                                 | {{url-search}}/users/`nombre`                    |
|                      | Buscar usuarios por email              | GET                                                                 | {{url-search}}/users/`email`                     |
|                      | Buscar una categoría por su ID         | GET                                                                 | {{url-search}}/categories/`id-Documento`         |
|                      | Buscar categorías por nombre           | GET                                                                 | {{url-search}}/categories/`nombre`               |
|                      | Buscar un producto por su ID           | GET                                                                 | {{url-search}}/products/`id-Documento`           |
|                      | Buscar productos por nombre            | GET                                                                 | {{url-search}}/products/`nombre`                 |

## Continuación del proyecto RESTServer

Vamos a crear una ruta (`routes/uploads.routes.js`), un controlador (`controllers/uploads.controller.js`) y un path (`/api/uploads`) para la carga de archivos. Nuestra clase Server llamaría la ruta de la siguiente manera:

```js
class Server {
    constructor() {
        ...
        this.paths = {
            ...
            uploads: '/api/uploads/'
        }
    }
    ...
    routes() {
        this.app.use(this.paths.uploads, require('../routes/uploads.routes'))
    }
}
```

Como vamos a postear o subir un archivo, nuestra ruta para upload sería inicialmente la siguiente:

```js
router.post('/', uploadFile)
```

## Subir Archivos

Vamos a instalar el paquete Express FileUpload con el comando `npm i express-fileupload`. Luego vamos a configurar un middleware que nos ofrece dentro de los middlewares del Servidor.

```js
const fileUpload = require('express-fileupload')

class Server {
    ...
    middlewares() {
        ...
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: ''
        }))
    }
}
```

Si vamos al controlador y escribimos lo siguiente, podremos ver en consola la información del archivo que se subio por el request:

```js
const uploadFile = (req, res = response) => {
    console.log(req.files.foo)
    ...
}
```

Para subir un archivo en nuestro Client Server, debemos ir al endpoint con el método POST y seleccionar, en el caso de ***POSTMAN***: Body, form-data, le damos el nombre a KEY, desenfocamos el campo y seleccionamos en donde está un menú desplegable en el input la opción de FILE, y luego en VALUE subimos el archivo con la ayuda del botón que nos aparece. En el caso de ***THUNDER***: Body, Form, marcamos la palomita al lado derecho de FILES, y ya podemos seguir con la subida del archivo.

Volviendo a nuestro controlador, vamos ir a la documentación del paquete que acabamos de instalar, y si nos vamos al repositorio en github, podemos ver un ejemplo de subida de archivos, vamos a copiarlo y ponerlo en nuestro controlador. El código dice lo siguiente: Si la petición en no tiene ningún archivo, retorna un mensaje diciendo que no hay nada para subir, también lanza este error si luego de hacer un barrido por todas las llaves del objeto request no encuentra alguno llamado `req.files`. También podemos hacer una validación personal diciendo que si no viene la propiedad `req.files.<nombre de la propiedad, ejm: req.files.archivo o req.files.file>` también lance un error de que no hay nada para subir. Luego desestructuramos dicha propiedad para extraer su valor si hay algo para subir, para luego subirlo a un directorio que llamaremos `uploads` en la raiz del proyecto.

Para mover el archivo al directorio deseado vamos a usar la propiedad `.mv()` del archivo.

```js
const uploadFile = (req, res = response) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({ msg: 'No hay archivos que subir' })
    }

    const { file } = req.files
    const uploadPath = path.join(__dirname, '../uploads', file.name)

    file.mv(uploadPath, (err) => {
        if (err) return res.status(500).json({ err })
        res.status(201).json({ msg: `El archivo fue subido al ${uploadPath}` })
    })
}
```

## Validar la extensión

Para validar la extensión de un archivo, separamos su nombre por puntos y tomamos la última posición. Luego lo comparamos con el arreglo de extensiones permitidas y seguimos con la lógica.

```js
const uploadFile = (req, res = response) => {
    ...
    const nameSplit = file.name.split('.')
    const extension = nameSplit[nameSplit.length - 1]

    const allowedExtensions = [
        'png', 'jpg', 'jpeg', 'gif'
    ]

    if (!allowedExtensions.includes(extension)) return res.status(401).json({ msg: `La extensión ${extension} no es permitida`, allowedExtensions })
    ...
}
```

## Ubicar y cambiar nombre

Vamos a darles un nombre único a cada archivo, para lo cual usamos el paquete de UUID que se instala con el comando de `npm i uuid`. Lo que haremos es genera un identificador y concatenarle la extensión para renombrar el archivo en el path de destino:

```js
const { v4: uuidv4 } = require('uuid')


const uploadFile = (req, res = response) => {
    ...
    const tempName = uuidv4() + '.' + extension

    const uploadPath = path.join(__dirname, '../uploads', tempName)
    ...
}
```

## Helper - Subir archivo

Todo lo que tenemos en controlador para subir un archivo, se puede usar en otras rutas, por ellos sacamos la lógica y la ponemos dentro de una función en el archivo `helpers/upload-files.js`. La diferencia va a ser que vamos a manejar Promesas

```js
const uploadFiles = async (files, allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'], dir = '') => {
    return new Promise((resolve, reject) => {
        const { file } = files

        const nameSplit = file.name.split('.')
        const extension = nameSplit[nameSplit.length - 1]

        if (!allowedExtensions.includes(extension)) return reject(`La extensión ${extension} no es permitida. Extensiones permitidas: ${allowedExtensions}`)

        const tempName = uuidv4() + '.' + extension

        const uploadPath = path.join(__dirname, '../uploads', dir, tempName)

        file.mv(uploadPath, (err) => {
            if (err) return reject(err)
            resolve(tempName)
        })
    })
}
```

Nuestro controlador quedaría de la siguiente manera:

```js
const uploadFile = async (req, res = response) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({ msg: 'No hay archivos que subir' })
    }

    try {
        const name = await uploadFiles(req.files)
        return res.json({ name })
    } catch (error) {
        return res.status(400).json({ msg: error })
    }
}
```

## Crear carpetas de destino

Para crear una carpeta de destino por medio del parámetro del helper, primero debemos habilitar la propiedad el middleware de fileUpload en los middlewares de nuestro servidor:

```js
class Server {
    ...
    middlewares() {
        ...
        this.app.use(fileUpload({
            ...,
            createParentPath: true
        }))
    }
}
```

Y dentro de nuestro controlador podemos hacer esto:

```js
const uploadFile = async (req, res = response) => {
    ...
    try {
        const allowedExtensions = ['md', 'pdf', 'txt']
        const dir = 'textos'
        const name = await uploadFiles(req.files, allowedExtensions, dir)
        return res.json({ name })
    } catch (error) {
        ...
    }
}
```

En caso de que queramos dejar las extensiones por defecto, pero si necesitamos modificar el directorio, lo hariamos de la siguiente manera:

```js
const uploadFile = async (req, res = response) => {
    ...
    try {
        const name = await uploadFiles(req.files, undefined, 'images')
        ...
    } catch (error) {
        ...
    }
}
```

## Ruta para actualizar imágenes de Usuarios y Productos

Vamos a crear una nueva ruta con la que vamos a actualizar la imagen de un usuario o de un producto:

```js
router.put('/:collection/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE', 'USER_ROLE'),
    check('id', 'No es un id de mongo').isMongoId(),
    check('collection').custom(collection => allowedCollections(collection, ['users', 'products'])),
    validateFields
], updateImage)
```

Creamos un helper para validar la coleccion que se ingresa por parametros en el archivo de `helpers/db-validators.js` y comparandola con la colecciones permitidas.

```js
const allowedCollections = (collection = '', collections = []) => {
    const includes = collections.includes(collection)
    if (!includes) throw new Error(`La colección ${collection} no es permitida. Colecciones permitidas: ${collections}`)
    return true
}
```

## Actualizar imagen de usuario y de producto

Vamos a obtener la colección y el id de los parámetros de la url, luego creamos una variable para almacenar el modelo que pertenece a la colección que se solicita. Se debe validar si existe el id que se solicita y según la colección. Luego se modifica el campo de image en el modelo seleccionado con el nombre con el que se guarda la imagen y se guarda el modelo.

```js
const updateImage = async (req, res = response) => {
    const { collection, id } = req.params

    let model

    switch (collection) {
        case 'users':
            model = await User.findById(id)
            if (!model) return res.status(401).json({ msg: `No existe un usuario con el id ${id}` })
            break;
        case 'products':
            model = await Product.findById(id)
            if (!model) return res.status(401).json({ msg: `No existe un producto con el id ${id}` })
            break;

        default: return res.status(500).json({ msg: 'Categoria sin validar' }); break;
    }
    
    try {
        model.image = await uploadFiles(req.files, undefined, collection)
        await model.save()
        return res.json(model)
    } catch (error) {
        return res.status(400).json({ msg: error })
    }
}
```

## Desestructurar de undefined

En caso de que no venga ningún archivo en el body, debemos manejar una error.

```js
const updateImage = async (req, res = response) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({ msg: 'No hay archivos que subir' })
    }
    ...
}
```

Está logica es igual a la de otro método, razón por la cual la sacaremos a un middleware en el archivo `middleware/validate-file.js`.

```js
const { response } = require("express")


const validateFile = (req, res = response, next) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({ msg: 'No hay archivos que subir' })
    }
    next()
}


module.exports = {
    validateFile
}
```

Y también lo exportamos desde el index de su directorio:

```js
const validateFile = require('./validate-file')


module.exports = {
    ...,
    ...validateFile
}
```

Dentro de la ruta para actualizar o subir las fotos llamamos el middleware:

```js
router.post('/', validateFile, uploadFile)

router.put('/:collection/:id', [
    validateFile,
    ...
], updateImage)
```

## Borrar archivos del Servidor

Cada que subimos el archivo a actualizar, vamos a eliminar el anterior, por tal razón, primero validamos si nuestro modelo cuenta con el campo de `image`, luego tomamos el path completo de la imagen que se encuentra en dicho campo y si el archivo existe en nuestro servidor, lo eliminamos.

```js
const path = require('path')
const fs = require('fs')

const updateImage = async (req, res = response) => {
    ...
    try {
        if (model.image) {
            const pathImage = path.join(__dirname, '../uploads', collection, model.image)
            if (fs.existsSync(pathImage)) fs.unlinkSync(pathImage) 
        }
        ...
    } catch (error) {
        ...
    }
}
```

## Servicio para mostrar las imágenes

Creamos una ruta para mostrar la imagen de un usuario o de un producto:

```js
router.get('/:collection/:id', [
    check('id', 'El id es requerido').not().isEmpty(),
    check('id', 'No es un id de Mongo').isMongoId(),
    check('collection').custom(collection => allowedCollections(collection, ['users', 'products'])),
    validateFields
], showImage)
```

Para mostrar una imagen, debemos validar que la colección y el id sean correctos, además, debemos verificar si el archivo existe. Hasta este punto, se parece al método del controlador anterior. El punto es que ahora necesitamos enviar el archivo, para lo cual usamos `res.sendFile()`.

```js
const showImage = async (req, res = response) => {
    ...
    try {
        if (model.image) {
            const pathImage = path.join(__dirname, '../uploads', collection, model.image)
            if (fs.existsSync(pathImage)) return res.sendFile(pathImage)
        }
    } catch (error) {
        ...
    }

    return res.json({ msg: 'Mostrar un placeholder' })
}
```

## Mostrar imagen de relleno o placeholder

En caso de que no se encuentre una imagen para el modelo, se va a enviar un placeholder. Como es una imagen estatica, la guardamos en el directorio de `assets`.

```js
const showImage = async (req, res = response) => {
    ...
    const pathNotImage = path.join(__dirname, '../assets', `no-image.jpg`)
    if (fs.existsSync(pathNotImage)) return res.sendFile(pathNotImage)
}
```

## Función para obtener el modelo

Tanto en el controlador de `updateImage()` como de `showImage()`, se require saber cual es el modelo que se está de la colección que se require. La lógica para obtener dicho modelo se saco en una función aparte usando Promesas:

```js
const switchCollections = (collection = '', id = '', res = response) => {
    return new Promise(async (resolve, reject) => {
        let model
        switch (collection) {
            case 'users':
                model = await User.findById(id)
                if (!model) return reject({ error: `No existe un usuario con el id ${id}`, status: 401 })
                break;
            case 'products':
                model = await Product.findById(id)
                if (!model) return reject({ error: `No existe un producto con el id ${id}`, status: 401 })
                break;

            default: return reject({ error: 'Categoria sin validar', status: 500 })
        }
        resolve(model)
    })
}
```

Las funciones van a obtener el modelo de la siguiente manera:

```js
const updateImage = async (req, res = response) => {
    ...
    try {
        const model = await switchCollections(collection, id)
        ...
    } catch ({ error, status }) {
        return res.status(status).json({ msg: error })
    }
}
```

## Cloudinary - Servicio para imágenes y videos

No es recomendable subir los archivos en el mismo servidor de hosting. Una de las maneras de almacenar las imágenes y videos es mediante otro servidor, por ejemplo [Cloudinary](https://cloudinary.com/), en el cual nos vamos a registrar. Primero vamos a añadir los archivos que hay dentro la carpeta `uploads` al `.gitignore`.

Luego vamos a instalar el paquete de Cloudinary con el comando `npm i cloudinary`. Dentro de nuestro Dashboard de la cuenta en Cloudinary copiamos el API Enviroment variable y lo añadimos a nuestro archivo `.env`.

## Carga de imágenes a Cloudinary

Aunque no se debe, cree 2 rutas separadas, una para subir en local y otra en cloudinary, cada uno llama un controlador diferente:

```js
router.put('/local/:collection/:id', [
    ...
], updateImage)


router.put('/cloudinary/:collection/:id', [
    ...
], updateImageCloudinary)
```

La primera configuración para usar Cloudinary en nuestro controlador es esta:

```js
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)
```

Nuestro controlador seguira trayendo el modelo según la colección que se ingresa por parámetro. Vamos a aprovechar la propiedad `tempFilePath` que tenemos de nuestro archivo al subirlo. Luego cargamos el path temporal del archivo al servidor de Cloudinary, y de la respuesta que este nos de, obtenemos la propiedad `secure_url`, la cual será el nombre o dirección que tendrá nuestro modelo en el campo de nombre.

```js
const updateImageCloudinary = async (req, res = response) => {
    const { collection, id } = req.params

    try {
        const model = await switchCollections(collection, id)

        const { tempFilePath } = req.files.file
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath)
        model.image = secure_url

        await model.save()
        res.json(model)
    } catch ({ error, status }) {
        return res.status(status).json({ msg: error })
    }
}
```

## Borrar imágenes de Cloudinary

Para eliminar la imagen anterior que se encuentra almacenada en el modelo, validamos si esta el campo de `image` en el modelo, tomamos el valor de dicho campo y lo reparamos por `/`, luego tomamos la última posición del arreglo que se genera, del cuál al volver a separarlo en `.` tomamos la posición 0 mediante desestructuración de arreglos y le damos el nombre de `public_id` para enviarle a Cloudinary el elemento a destruir.

```js
const updateImageCloudinary = async (req, res = response) => {
    ...
    try {
        ...
        if (model.image) {
            const nameSplit = model.image.split('/')
            const name = nameSplit[nameSplit.length - 1]
            const [ public_id ] = name.split('.')
            await cloudinary.uploader.destroy(public_id)
        }
        ...
    } catch ({ error, status }) {
        ...
    }
}
```

## Desplegar en Heroku

Las images que se suben por la ruta en local, se van a eliminar del servidor luego de cierto tiempo, pero no es recomendable dejarlas allí, por ello las rutas en local solo son de prueba. Añadimos los cambios a un commit y lo enviamos a Heroku, es importante añadir la nueva variable de entorno con el comando `heroku config:set CLOUDINARY_URL="valor"`.

## Client Server Configuración FINAL

En la siguiente tabla se muestran todos los endpoints resultantes de la sección actual, estos están guardados en Postman y en Thunder. Para observar la documentación de los servicios ingresar al siguiente enlace: [POSTMAN Documentation, Curso Node - Café RESTServer](https://documenter.getpostman.com/view/8438809/UVR7L8dz).

| Sección              | Nombre                                 | Método                                                              | Ruta                                              |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| **Enviroment (ENV)** | *Producción - RESTServer Node MongoDB* |
|                      | {{url-users}}                          |                                                                     | http://localhost:8080/api/users                   |
|                      | {{url-auth}}                           |                                                                     | http://localhost:8080/api/auth                    |
|                      | {{url-categories}}                     |                                                                     | http://localhost:8080/api/categories              |
|                      | {{url-products}}                       |                                                                     | http://localhost:8080/api/products                |
|                      | {{url-search}}                         |                                                                     | http://localhost:8080/api/search                  |
|                      | {{url-uploads}}                        |                                                                     | http://localhost:8080/api/uploads                 |
| **Collections**      | *Café RESTServer Node MongoDB*         |
| **Folder**           | *Auth*                                 |
|                      | Login                                  | POST (Contiene un body)                                             | {{url-auth}}/login                                |
|                      | Google Sign In                         | POST (Contiende un body)                                            | {{url-auth}}/google                               |
| **Folder**           | *Users*                                |
|                      | Obtener usuarios de manera paginada    | GET                                                                 | {{url-users}}?limit=`n`&from=`n`                  |
|                      | Obtener usuario por ID                 | GET                                                                 | {{url-users}}/`id-Documento`                      |
|                      | Crear un usuario                       | POST (Contiene un body)                                             | {{url-users}}                                     |
|                      | Actualizar un usuario                  | PUT (Contiene un body)                                              | {{url-users}}/`id-Documento`                      |
|                      | Eliminación TOTAL de un usuario        | DELETE (Se debe pasar el token por el header, solo admin)           | {{url-users}}/total-delete/`id-Documento`         |
|                      | Eliminación PARCIAL de un usuario      | DELETE (Se debe pasar el token por el header, roles personalizados) | {{url-users}}/partial-delete/`id-Documento`       |
| **Folder**           | *Categories*                           |
|                      | Obtener categorías de manera paginada  | GET                                                                 | {{url-categories}}?limit=`n`&from=`n`             |
|                      | Obtener categoría por ID               | GET                                                                 | {{url-categories}}/`id-Documento`                 |
|                      | Crear una categoría                    | POST (Contiene un body)                                             | {{url-categories}}                                |
|                      | Actualizar una categoría               | PUT (Contiene un body)                                              | {{url-categories}}/`id-Documento`                 |
|                      | Eliminación TOTAL de una categoría     | DELETE (Se debe pasar el token por el header, solo admin)           | {{url-categories}}/total-delete/`id-Documento`    |
|                      | Eliminación PARCIAL de una categoría   | DELETE (Se debe pasar el token por el header, roles personalizados) | {{url-categories}}/partial-delete/`id-Documento`  |
| **Folder**           | *Products*                             |
|                      | Obtener productos de manera paginada   | GET                                                                 | {{url-products}}?limit=`n`&from=`n`               |
|                      | Obtener producto por ID                | GET                                                                 | {{url-products}}/`id-Documento`                   |
|                      | Crear un producto                      | POST (Contiene un body)                                             | {{url-products}}                                  |
|                      | Actualizar un producto                 | PUT (Contiene un body)                                              | {{url-products}}/`id-Documento`                   |
|                      | Eliminación TOTAL de un producto       | DELETE (Se debe pasar el token por el header, solo admin)           | {{url-products}}/total-delete/`id-Documento`      |
|                      | Eliminación PARCIAL de un producto     | DELETE (Se debe pasar el token por el header, roles personalizados) | {{url-products}}/partial-delete/`id-Documento`    |
| **Folder**           | *Search*                               |
|                      | Buscar un usuario por su ID            | GET                                                                 | {{url-search}}/users/`id-Documento`               |
|                      | Buscar usuarios por nombre             | GET                                                                 | {{url-search}}/users/`nombre`                     |
|                      | Buscar usuarios por email              | GET                                                                 | {{url-search}}/users/`email`                      |
|                      | Buscar una categoría por su ID         | GET                                                                 | {{url-search}}/categories/`id-Documento`          |
|                      | Buscar categorías por nombre           | GET                                                                 | {{url-search}}/categories/`nombre`                |
|                      | Buscar un producto por su ID           | GET                                                                 | {{url-search}}/products/`id-Documento`            |
|                      | Buscar productos por nombre            | GET                                                                 | {{url-search}}/products/`nombre`                  |
| **Folder**           | *Uploads*                              |
|                      | Subir un archivo                       | POST (Contiene un body de tipo file)                                | {{url-uploads}}                                   |
|                      | Actualizar en local un usuario         | PUT (Contiene un body de tipo file)                                 | {{url-uploads}}/local/users/`id-Document`         |
|                      | Actualizar en local un producto        | PUT (Contiene un body de tipo file)                                 | {{url-uploads}}/local/products/`id-Document`      |
|                      | Obtener la foto de un usuario          | GET                                                                 | {{url-uploads}}/users/`id-Document`               |
|                      | Obtener la foto de un producto         | GET                                                                 | {{url-uploads}}/products/`id-Document`            |
|                      | Actualizar en cloudinary un usuario    | PUT (Contiene un body de tipo file)                                 | {{url-uploads}}/cloudinary/users/`id-Document`    |
|                      | Actualizar en cloudinary un producto   | PUT (Contiene un body de tipo file)                                 | {{url-uploads}}/cloudinary/products/`id-Document` |
