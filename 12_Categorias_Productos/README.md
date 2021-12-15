# Sección 12: Categorías y Productos

Aquí cubriremos varios temas como:

- Tareas
- CRUD de categorías y productos
- Relaciones
- Populate
- Búsquedas
- Despliegues a producción

## Aclaraciones del proyecto

Vamos a utilizar el proyecto de las últimas secciones, y en especial la última versión de la sección anterior. Instalamos los paquetes con `npm install` o `npm i`. Levantamos el servidor con `nodemon app`. De la sección anterior tuvimos con endpoint resultantes para nuestro client server los siguientes (la explicación de los body y los header que se envian, se muestran en la documentación de las secciones anteriores):

| Sección              | Nombre                               | Método                                                              | Ruta                                        |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------- |
| **Enviroment (ENV)** | Producción - RESTServer Node MongoDB |
|                      | {{url-users}}                        |                                                                     | http://localhost:8080/api/users             |
|                      | {{url-auth}}                         |                                                                     | http://localhost:8080/api/auth              |
| **Collections**      | Café RESTServer Node MongoDB         |
| **Folder**           | Auth                                 |
|                      | Login                                | POST (Contiene un body)                                             | {{url-auth}}/login                          |
|                      | Google Sign In                       | POST (Contiende un body)                                            | {{url-auth}}/google                         |
| **Folder**           | Users                                |
|                      | Obtener usuarios de manera paginada  | GET                                                                 | {{url-users}}?limit=`n`&from=`n`            |
|                      | Crear un usuario                     | POST (Contiene un body)                                             | {{url-users}}                               |
|                      | Actualizar un usuario                | PUT (Contiene un body)                                              | {{url-users}}/`id-Documento`                |
|                      | Eliminación TOTAL de un usuario      | DELETE (Se debe pasar el token por el header, solo admin)           | {{url-users}}/total-delete/`id-Documento`   |
|                      | Eliminación PARCIAL de un usuario    | DELETE (Se debe pasar el token por el header, roles personalizados) | {{url-users}}/partial-delete/`id-Documento` |

La documentación entregada por Postman, la cual publique desde la misma aplicación, la podemos observar en la siguiente dirección: [POSTMAN Documentation, Curso Node - Café RESTServer](https://documenter.getpostman.com/view/8438809/UVR7L8dz). Esta documentación nos permite hacer cambio entre el entorno de desarrollo y el producción mientras automaticamente cambia sus variables de entorno, además de que nos permite observar las maneras de manipular nuestro Server desde distintos lenguajes de desarrollo.

## CRUD y rutas de Categorías

Vamos a crear una ruta para acceder a las categorías. Lo primero es crear el archivo de rutas `routes/categories.routes.js`, luego ir a la clase Server y usar el middleware para llamar dichas rutas.

```js
class Server {
    constructor() {
        ...
        this.categoriesPath = '/api/categories'
        ...
    }
    ...
    routes() {
        ...
        this.app.use(this.categoriesPath, require('../routes/categories.routes'))
    }
}
```

Otra manera de crear las rutas en el constructor, es mediante un objeto, de la siguiente manera:

```js
class Server {
    constructor() {
        ...
        this.paths = {
            auth: '/api/auth',
            users: '/api/users',
            categories: '/api/categories'
        }
    }
    ... 
    routes() {
        this.app.use(this.paths.auth, require('../routes/auth.routes'))
        this.app.use(this.paths.users, require('../routes/user.routes'))
        this.app.use(this.paths.categories, require('../routes/categories.routes'))
    }
}
```

También vamos a crear un archivo para los controladores llamado `controllers/categories.controller.js`

Dentro de Postman o de Thunder vamos a crear una nueva variable de entorno llamada `url-categories` y que su valor sea `http://localhost:8080/api/categories`. También creamos un nuevo folder dentro de la colección de RESTServer Node MongoDB llamado Categories.

Seguimos definiendo que rutas va a tener Categoría, queremos las siguientes:

- Obtener todas las categorías paginados desde y hasta
- Obtener una categoría en especifico por su id
- Crear una categoría, solo los users con token valido lo pueden llevar a cabo
- Actualizar una categoría por su id, solo los users con token valido lo pueden llevar a cabo
- Borrar una categoría, solo el admin lo puede hacer.

```js
router.get('/', [], categoriesGet)
router.get('/:id', [], categoryGetByID)
router.post('/', [], categoryPost)
router.put('/:id', [], categoryPutByID)
router.delete('/:id', [], categoryDeleteByID)
```

## Modelo Categorías

Vamos a crear el modelo para las categorias dentro de nuestra base de datos. Dentro del archivo `models/category.js` tenemos esta estructura:

```js
const { Schema, model } = require('mongoose')


const CategorySchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatoria'],
        unique: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectID,
        ref: 'User',
        required: true
    }
})


module.exports = model('Category', CategorySchema)
```

Aquí cabe resaltar que necesitamos una referencia al usuario que creo la categoría, por lo cual tenemos el campo user, con tipo ObjectID, y que su referencia apunta al modelo `User`, si, el mismo nombre del modelo que tenemos en nuestro archivos.

Vamos a crear un archivo llamado `models/index.js`, en que haremos las exportaciones "globales" de los modelos:

```js
const User = require('./user')
const Role = require('./role')
const Category = require('./category')
const Server = require('./server')


module.exports = {
    User,
    Role,
    Category,
    Server
}
```

## Crear una categoría

Dentro de la ruta de POST debemos llamar el middleware para validar el JWT.

```js
const { validateJWT } = require('../middleware')

router.post('/', [
    validateJWT
], categoryPost)
```

Hacemos la petición de login, y tomamos el JWT que se nos genera y lo pasamos al header de la petición para crear un producto.

Nuevamente dentro de nuestra ruta, hacemos las validaciones para los campos que se deben ingresar por el body, en este caso solo es el nombre de la categoría.

```js
router.post('/', [
    validateJWT,
    check('name', 'El nombre de la categoría es requerido').not().isEmpty(),
    validateFields
], categoryPost)
```

El controlador de esta ruta toma el nombre que se ingresa por el body de la petición y lo transforma a mayusculas. Posteriormente busca dentro de la base de datos si hay alguna colección de categorias que tenga ese mismo nombre, si encuentra una, nos dice que ya existe una categoría con ese nombre. En caso contrario tomamos el nombre y lo agrupamos con el identificador del usuario que está autenticado mediante el JWT y que está almacenado en el header del request. Luego instancia la clase Category y guarda la data.

```js
const categoryPost = async (req, res = response) => {
    const name = req.body.name.toUpperCase()
    const categoryDB = await Category.findOne({ name })

    try {
        if (categoryDB) return res.status(401).json({ msg: `La categoría ${categoryDB.name} ya existe` })

        const data = {
            name,
            user: req.userAuth._id
        }

        const category = new Category(data)
        category.save()

        res.status(201).json({
            msg: 'Category POST',
            category
        })
    } catch (error) {
        console.log(`Error: `.red)
        throw new Error(error)
    }
}
```

## CRUD de Categorías

### Consultar todas las categorías

Para obtener toda las lista de categorias, usamos la misma lógica que se empleo para los usuarios, la diferencia en este caso es el uso de **Populate**. Ya que tenemos una referencia a un usuario, podemos extraer la información del mismo dentro de la consulta. Primero encontramos todas las categorías que tengan un status valido, sacamos el nombre y el id de la referencia del usuario y limitamos el número de búsquedas a los parámetros ingresados por la query, o los establecidos por nosotros mismos.

```js
const categoriesGet = async (req, res = response) => {
    const { limit = 5, from = 0 } = req.query
    const query = { status: true }

    const [ total, categories ] = await Promise.all([
        Category.countDocuments(query),
        Category.find(query)
            .populate({
                path: 'user',
                select: 'name'
            })
            .skip(Number(from))
            .limit(Number(limit))
    ])

    res.json({
        total,
        categories,
        from,
        limit
    })
}
```

Cuando hacemos la consulta podemos obtener esto:

```json
{
    "total": 2,
    "categories": [
        {
            "_id": "61b916911d34c6b8a9f31aaf",
            "name": "DULCES",
            "status": true,
            "user": {
                "name": "Administrador",
                "uid": "61b8cb5dbd881844147d2c78"
            },
            "__v": 0
        },
        {
            "_id": "61b917f875a6c50144ad00d2",
            "name": "POSTRES",
            "status": true,
            "user": {
                "name": "Administrador",
                "uid": "61b8cb5dbd881844147d2c78"
            },
            "__v": 0
        }
    ],
    "from": 0,
    "limit": 5
}
```

### Buscar una categoría por ID

Para buscar una categoría mediante su id vamos a crear un helper para primero verificar que su id sea valido.

```js
const categoryExistsByID = async (id) => {
    const categoryExists = await Category.findById(id)
    if (!categoryExists) throw new Error(`La categoría con id ${id} no está registrada en la base de datos`)
}
```

La ruta para consultar la categoría por id quedaría de la siguiente manera:

```js
router.get('/:id', [
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    validateFields
], categoryGetByID)
```

El controlador tendría la siguiente lógica:

```js
const categoryGetByID = async (req, res = response) => {
    const { id } = req.params
    const query = { status: true }

    const category = await Category.findById(id)
        .populate({
            path: 'user',
            select: 'name'
        })

    if (!category || !category.status) return res.status(401).json({ msg: "Ingrese el id de una categoría valida" })

    res.json({
        category
    })
}
```

Al hacer la consulta obtenemos lo siguiente:

```json
{
    "category": {
        "_id": "61b917f875a6c50144ad00d2",
        "name": "POSTRES",
        "status": true,
        "user": {
            "name": "Administrador",
            "uid": "61b8cb5dbd881844147d2c78"
        },
        "__v": 0
    }
}
```

### Actualizar una categoría

Para actualizar una categoría debemos tener un JWT, validar que sea Administrador o vendedor en su role, verificar que id exista en la colección de categorias y validar que si se ingresa un valor para modificar.

```js
router.put('/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    check('name', 'El nombre de la categoría es requerido').not().isEmpty(),
    validateFields
], categoryPutByID)
```

El controlador se encarga de encontrar el documento en la colección y modificar el campo que se pasa por medio del body de la request. Se debe controlar que campos queremos que se puedan actualizar y como. Por ejemplo el nombre se pasara a mayusculas y el usuario se modificara por el usuario que está haciendo la actualización.

```js
const categoryPutByID = async (req, res = response) => {
    const { id } = req.params
    data.name = data.name.toUpperCase()
    data.user = req.userAuth._id

    const category = await Category.findByIdAndUpdate(id, data, { new: true })
        .populate({
            path: 'user',
            select: 'name email'
        })

    res.json({
        id,
        category
    })
}
```

### Eliminar una categoría

Tengo 2 maneras de eliminar una categoría, una es eliminar en definitiva y la otra es actualizar su status. En ambas se debe tener un token, pero los roles de una y otra cambian o son más flexibles.

```js
router.delete('/total-delete/:id', [
    validateJWT,
    validateAdminRole,
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    validateFields
], categoryTotalDeleteByID)

router.delete('/partial-delete/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(categoryExistsByID),
    validateFields
], categoryPartialDeleteByID)
```

Los controladores serían los siguientes:

```js
const categoryTotalDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const category = await Category.findByIdAndDelete(id)
        .populate({
            path: 'user',
            select: 'name email'
        })
    const userAuth = req.userAuth

    res.json({
        category,
        userAuth
    })
}


const categoryPartialDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const category = await Category.findByIdAndUpdate(id, { status: false })
        .populate({
            path: 'user',
            select: 'name email'
        })
    const userAuth = req.userAuth

    res.json({
        category,
        userAuth
    })
}
```

Dentro del helper para validar si existe el id dentro de la colección, añadí una validación en caso de que el status ya esté en falso:

```js
const categoryExistsByID = async (id) => {
    ...
    if (!categoryExists.status) throw new Error(`La categoría con id ${id} está suspendida en la base de datos`)
}
```

### Ocultar datos del modelo

Sobrescribimos el método `.toJson()` del modelo Category, con el fin de solo pasar en la respuesta algunos datos.

```js
CategorySchema.methods.toJSON = function() {
    const { __v, status, _id, ...category} = this.toObject()
    category.id_category = _id
    return category
}
```

## Modelo de Producto y rutas

Vamos a crear un nuevo path en el Server para los productos. Luego creamos un archivo llamado `models/product.js` y lo añadimos al indice de los modelos:

```js
class Server {
    constructor() {
        ...
        this.paths = {
            ...
            products: '/api/products'
        }
    }
    ...
    routes() {
        ...
        this.app.use(this.paths.products, require('../routes/products.routes'))
    }
}
```

El modelo tiene una referencia hacia el usuario que lo crea y hacia la categoría a la que pertenece.

```js
const { Schema, model } = require('mongoose')

const ProductSchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
        unique: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectID,
        ref: 'User',
        required: true
    },
    unitPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: Schema.Types.ObjectID,
        ref: 'Category',
        required: [true, 'La categoría del producto es requerida']
    },
    description: {
        type: String
    },
    available: {
        type: Boolean,
        default: true
    }
})

ProductSchema.methods.toJson = function() {
    const { __v, _id, ...product } = this.toObject()
    product.id_product = _id
    return product
}

module.exports = model('Product', ProductSchema)
```

Añadimos la exportación en el `model/index.js`:

```js
...
const Product = require('./product')
...

module.exports ={
    ...,
    Product,
    ...
}
```

También añadimos una variable de entorno en los client server llamada `{{url-products}}` y su valor será `http://localhost:8080/api/products`. Dentro de nuestra colección de RESTServer Node MongoDB añadimos un nuevo folder llamado Products.

Creamos el archivo para las rutas (`routes/products.routes.js`) y para el controlador (`controllers/products.controller.js`), y para ello tomamos como base el controlador y rutas de Categorias. Además de los cambios obvios como la referencia al modelo correcto y demás, debemos tener en cuenta que se debe validar que el id de la categoría exista y sea correcto, de lo contrario no podra subir ni actualizar un producto. La solución es añadir un middleware en la ruta para validar el campo de categoria:

```js
router.post('/', [
    validateJWT,
    check('name', 'El nombre del producto es requerido').not().isEmpty(),
    check('category', 'El id de la categoria no es un id de mongo valido').isMongoId(),
    check('category').custom(categoryExistsByID),
    validateFields
], productPost)

router.put('/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    check('category', 'El id de la categoria no es un id de mongo valido').isMongoId(),
    check('category').custom(categoryExistsByID),
    validateFields
], productPutByID)
```

Por lo demás, esto sería lo realizado:

Rutas para los productos:

```js
const { Router } = require('express')
const { check } = require('express-validator')

const { productsGet, productGetByID, productPost, productPutByID, productTotalDeleteByID, productPartialDeleteByID } = require('../controllers/products.controller')
const { productExistsByID, categoryExistsByID } = require('../helpers/db-validators')
const { validateJWT, validateFields, hasRole, validateAdminRole } = require('../middleware')

const router = Router()


router.get('/', productsGet)

router.get('/:id', [
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    validateFields
], productGetByID)

router.post('/', [
    validateJWT,
    check('name', 'El nombre del producto es requerido').not().isEmpty(),
    check('category', 'El id de la categoria no es un id de mongo valido').isMongoId(),
    check('category').custom(categoryExistsByID),
    validateFields
], productPost)

router.put('/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    check('name', 'El nombre del producto es requerido').not().isEmpty(),
    check('category', 'El id de la categoria no es un id de mongo valido').isMongoId(),
    check('category').custom(categoryExistsByID),
    validateFields
], productPutByID)

router.delete('/total-delete/:id', [
    validateJWT,
    validateAdminRole,
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    validateFields
], productTotalDeleteByID)

router.delete('/partial-delete/:id', [
    validateJWT,
    hasRole('ADMIN_ROLE', 'SALES_ROLE'),
    check('id', 'No es un id de mongo valido').isMongoId(),
    check('id').custom(productExistsByID),
    validateFields
], productPartialDeleteByID)


module.exports = router
```

Controlador para los productos:

```js
require('colors')
const { response } = require("express")

const { Product, Category } = require('../models')


const productsGet = async (req, res = response) => {
    const { limit = 5, from = 0 } = req.query
    const query = { status: true }

    const [total, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query)
            .populate({
                path: 'user',
                select: 'name'
            })
            .populate('category', 'name')
            .skip(Number(from))
            .limit(Number(limit))
    ])

    res.json({
        total,
        products,
        from,
        limit
    })
}


const productGetByID = async (req, res = response) => {
    const { id } = req.params

    const product = await Product.findById(id)
        .populate({
            path: 'user',
            select: 'name'
        })
        .populate('category', 'name')

    res.json({
        product
    })
}


const productPost = async (req, res = response) => {
    const name = req.body.name.toUpperCase()
    const { status, user, ...rest } = req.body
    
    const productDB = await Product.findOne({ name })

    try {
        if (productDB) return res.status(401).json({ msg: `El producto ${productDB.name} ya existe` })

        const data = {
            name,
            rest,
            user: req.userAuth._id
        }

        const product = new Product(data)
        product.save()

        res.status(201).json({
            msg: 'product POST',
            product
        })
    } catch (error) {
        console.log(`Error: `.red)
        throw new Error(error)
    }
}


const productPutByID = async (req, res = response) => {
    const { id } = req.params
    const { status, user, ...data } = req.body

    if (data.name) data.name = data.name.toUpperCase()
    data.user = req.userAuth._id

    const product = await Product.findByIdAndUpdate(id, data, { new: true })
        .populate({
            path: 'user',
            select: 'name email'
        })
        .populate('category', 'name')

    res.json({
        id,
        product
    })
}


const productTotalDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const product = await Product.findByIdAndDelete(id)
        .populate({
            path: 'user',
            select: 'name email'
        })
        .populate('category', 'name')
    const userAuth = req.userAuth

    res.json({
        product,
        userAuth
    })
}


const productPartialDeleteByID = async (req, res = response) => {
    const { id } = req.params

    const product = await Product.findByIdAndUpdate(id, { status: false })
        .populate({
            path: 'user',
            select: 'name email'
        })
        .populate('category', 'name')
    const userAuth = req.userAuth

    res.json({
        product,
        userAuth
    })
}


module.exports = {
    productsGet,
    productGetByID,
    productPost,
    productPutByID,
    productTotalDeleteByID,
    productPartialDeleteByID
}
```

Helper para validar la existencia o status del producto:

```js
const productExistsByID = async (id) => {
    const productExists = await Product.findById(id)
    if (!productExists) throw new Error(`El producto con id ${id} no está registrada en la base de datos`)
    if (!productExists.status) throw new Error(`El producto con id ${id} está suspendida en la base de datos`)
}
```

## Ruta para realizar búsquedas

Vamos a crear una ruta (`routes/search.routes.js`) y un controlador (`controllers/search.controller.js`) para Buscar o Search. Luego, en la clase de Server añadimos un nuevo path:

```js
class Server {
    constructor() {
        ...
        this.paths = {
            ...
            search: '/api/search'
        }
    }
    ...
    routes() {
        ...
        this.app.use(this.paths.search, require('../routes/search.routes'))
    }
}
```

La ruta de Search tiene la peculiaridad de que recibe una colección y un término de búsqueda, por ello nuestra ruta queda de la siguiente manera:

```js
router.get('/:collection/:term', search)
```

## Búsquedas en Base de Datos

Primero vamos a definir las colecciones que están disponibles para hacer las búsqueda:

```js
const allowedCollections = [
    'users',
    'roles',
    'categories',
    'products'
]
```

Dentro del controllador debemos recibir los 2 parámetros de búsqueda que definimos. Hacemos el analisis de si la coleccion ingresada está dentro de las colecciones que permitimos buscar. Luego procedemos mediante un Switch a comparar los valores ingresados en la colección y a darles una lógica determinada. En caso de que la colección ingresada pase la validación de las permitidas y entre en nuestro control y no tenga ninguna logica, entonces retornamos un Error 500 que es del lado del servidor.

Por ejemplo tenemos que la colección ingresada es de Usuarios, debemos llamar un método para hacer su respectiva búsqueda.

```js
const search = (req, res = response) => {
    const { collection, term } = req.params

    if (!allowedCollections.includes(collection)) return res.status(400).json({ msg: `Las colecciones permitidas son ${allowedCollections}` })

    switch (collection) {
        case 'users': searchUsers(term, res); break;
        case 'categories': break;
        case 'products': break;
        default: res.status(500).json({ msg: 'Búsqueda no controlada' }); break;
    }
    re.json({
        msg: 'Buscar',
        collection,
        term
    })
}
```

El método para buscar a los usuarios puede buscar por el id, el correo o por el nombre de los mismos. Una vez busque en la base de datos, entonces retorna un arreglo con los resultados, y en caso de no encontrar nada retorna un arreglo vacio. Para saber si el termino ingresado es un id o un nombre o un correo, creamos una variable que almacene el boleano de la respuesta de `ObjectId.isValid()` que nos ofrece Mongoose. En caso de ser un id valido de MongoDB, va a buscar al usuario que tenga ese id.

```js
const { ObjectId } = require('mongoose').Types


const searchUsers = async (term = '', res = response) => {
    const isMongoId = ObjectId.isValid(term)
    if (isMongoId) {
        const user = await User.findById(term)
        res.json({
            results: user ? [ user ] : [] 
        })
    }
}
```

## Buscar por otros argumentos

En caso de que al buscar el usuario, el termino ingresado no sea un id, debemos tomar en consideración de que se trata de un nombre o un correo. Lo primero que vamos a hacer es crear una expresión regular que convierta el termino de búsqueda en un insensitive case, lo cual nos permite que se haga match con resultados en minusculas, mayusculas o tan solo con una parte de un string en la base de datos.

Luego ejecutamos 2 promesas al mismo tiempo para obtener tanto el total, como los usuarios que tengan las siguientes condiciones: Por medio de `$or` logramos que la búsqueda traiga los resultados que hagan match en el nombre o en el correo, pero en ambos casos por medio de `$and`, el estatus del resultado debe ser true.

```js
const searchUsers = async (term = '', res = response) => {
    ...
    const regex = new RegExp(term, 'i')

    const [total, users] = await Promise.all([
        User.count({
            $or: [{ name: regex }, { email: regex }],
            $and: [{ status: true }]
        }),
        User.find({
            $or: [{ name: regex }, { email: regex }],
            $and: [{ status: true }]
        })
    ])
    
    return res.json({
        total,
        results: users
    })
}
```

## Buscar en otras colecciones

Para buscar las categorías validamos si el termino ingresado es un id o si es un nombre, así que la base del método es similar al de buscar usuarios, solo que vamos a añadir el `populate()` en el campo del usuario.

```js
const searchCategories = (term = '', res = response) => {
    const isMongoId = ObjectId.isValid(term)
    if (isMongoId) {
        const category = await Category.findById(term).populate({
            path: 'user',
            select: 'name email'
        })
        return res.json({
            results: category ? [category] : []
        })
    }

    const regex = new RegExp(term, 'i')

    const [total, categories] = await Promise.all([
        Category.count({ name: regex, status: true }),
        Category.find({ name: regex, status: true }).populate({
            path: 'user',
            select: 'name email'
        })
    ])

    return res.json({
        total,
        results: categories
    })
}
```

En el caso de buscar productos tomamos la misma base del método para buscar categorías y le añadimos el `populate()` para el campo de la categoría.

```js
const searchProducts = (term = '', res = response) => {
    const isMongoId = ObjectId.isValid(term)
    if (isMongoId) {
        const product = await Product.findById(term).populate('user', 'name').populate('category', 'name')
        return res.json({
            results: product ? [product] : []
        })
    }

    const regex = new RegExp(term, 'i')

    const [total, products] = await Promise.all([
        Product.count({ name: regex, status: true }),
        Product.find({ name: regex, status: true }).populate('user', 'name').populate('category', 'name')
    ])

    return res.json({
        total,
        results: products
    })
}
```

Finalmente nuestro controlador de la búsquedas quedaría de la siguiente manera:

```js
const search = (req, res = response) => {
    const { collection, term } = req.params

    if (!allowedCollections.includes(collection)) return res.status(400).json({ msg: `Las colecciones permitidas son ${allowedCollections}` })

    switch (collection) {
        case 'users': searchUsers(term, res); break;
        case 'categories': searchCategories(term, res); break;
        case 'products': searchProducts(term, res); break;
        default: res.status(500).json({ msg: 'Búsqueda no controlada' }); break;
    }
    re.json({
        msg: 'Buscar',
        collection,
        term
    })
}
```

## Desplegar en Heroku

Agregamos todos los cambios al commit y lo enviamos a la rama de Heroku `git push heroku main`.
