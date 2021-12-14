# Sección 11: Google Sign In - Frontend y Backend

Aquí cubriremos varios temas como:

- Generar API Key de Google
- Generar API Secret
- Usar librerías de Google para la validación de tokens
- Tips importantes en PostMan
- Despliegues a Heroku
- Uso del Google SignIn en el Front-End
- Crear usuarios personalizados en base a respuestas de Google

## Aclaraciones Iniciales y Client API

Esta sección es la continuación de la anterior, por lo que se copiara la versión del proyecto de la versión anterior. Para volver a instalar los paquetes usamos `npm install` o `npm i`. Para levantar el servidor en local usamos el comando `nodemon app`. Seguimos usando MongoDB Compass y las configuraciones en Postman o Thunder, solo que hay algunas pequeñas modificaciones:

| Sección              | Valor                                                               | Nombre                                             | Ruta                                        |
| -------------------- | ------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| **Enviroment (ENV)** | Producción - RESTServer Node MongoDB                                |
|                      |                                                                     | {{url-users}}                                      | http://localhost:8080/api/users             |
|                      |                                                                     | {{url-auth}}                                       | http://localhost:8080/api/auth              |
| **Collections**      | Users - RESTServer Node MongoDB                                     |
|                      | GET                                                                 | Obtener usuarios de manera paginada - Café MongoDB | {{url-users}}?limit=`n`&from=`n`            |
|                      | POST (Contiene un body)                                             | Crear un usuario - Cafe MongoDB                    | {{url-users}}                               |
|                      | PUT (Contiene un body)                                              | Actualizar un usuario - Café MongoDB               | {{url-users}}/`id-Documento`                |
|                      | DELETE (Se debe pasar el token por el header, solo admin)           | Eliminación TOTAL de un usuario - Café MongoDB     | {{url-users}}/total-delete/`id-Documento`   |
|                      | DELETE (Se debe pasar el token por el header, roles personalizados) | Eliminación PARCIAL de un usuario - Café MongoDB   | {{url-users}}/partial-delete/`id-Documento` |
| **Collections**      | Auth - RESTServer Node MongoDB                                      |
|                      | POST (Contiene un body)                                             | Login - Café MongoDB                               | {{url-auth}}/login                          |

## Generar API key y API Secret de Google

Vamos a [Sign In With Google](https://developers.google.com/identity/gsi/web/guides/overview) y en la sección de *Configuración* y seguimos el enlace que nos lleva a la consola de las API de Google. Creamos un nuevo proyecto y lo seleccionamos. Procedemos a configurar la pantalla de consentimiento y guardamos de acuerdo a la información requerida.

Continuamos en la sección de Credenciales, en donde crearemos una de tipo ID de cliente de OAuth, seleccionamos el tipo de aplicación y el nombre del cliente. En los origenes autorizados de JavaScript añadimos la URI `http://localhost` y `http://localhost:8080` y le damos a Crear. Esto nos va a generar el Client ID y el Client Secret, los cuales añadimos a las variables de entorno de nuestro proyecto.

## Usuario de Google - Frontend

Dentro de la documentación de Sign In with Google, en la sección de Mostrar el botón Iniciar sesión con Google, hay un código HTML que nos permite tener el botón de inicio de sesión por defecto de Google, dicho código lo copiamos y lo pegamos en nuestra página del directorio public. Luego buscamos la sección de Manejar respuestas de credenciales con funciones de JavaScript, y copiamos ese código y lo reemplazamos en algunas partes al que tenemos en el index.html. Por el momento tendremos lo siguiente en nuestra página:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Sign In</title>
</head>
<body>

    <h1>Google Sign In</h1>
    <hr>

    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <div id="g_id_onload"
        data-client_id="YOUR_GOOGLE_CLIENT_ID"
        data-auto_prompt="false"
        data-callback="handleCredentialResponse">
    </div>
    <div class="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left">
    </div>

    <script>
        function handleCredentialResponse(response) {
            // Google Token
            console.log(response.credentials)
        }
    </script>

</body>
</html>
```

## Ruta para manejar autenticación con Google

Creamos una nueva ruta el archivo de `auth.routes.js`:

```js
router.post('/google', [
    check('id_token', 'El id_token de Google es necesario').not().isEmpty(),
    validateFields
], googleSignIn)
```

Y el controlador será el siguiente:

```js
const googleSignIn = async (req, res = response) => {
    const { id_token } = req.body

    res.json({
        msg: 'Google Sign In Ok',
        id_token
    })
}
```

Ahora, para capturar el token que nos entrega Google en el frontend debemos hacer uso de fetch y así enviarlo a nuestro backend. En la función que tenemos en el archivo `index.html`, vamos a escribir lo siguiente:

```js
function handleCredentialResponse(response) {

    const body = { id_token: response.credential}

    fetch('http://localhost:8080/api/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(res => console.log(res))
        .catch(console.warn)
}
```

## Validar Token de Google - Backend

Volvemos a la documentación de Sign In with Google y nos vamos al apartado de Verifique el token de ID de Google en el lado del servidor, y buscamos la sección de Using a Google API Client Library. Copiamos el comando para la instalación de la librería que se nos presenta allí, y lo ejecutamos: `npm install google-auth-library --save`

Creamos un archivo llamado `helpers/google-verify.js` y copiamos el código que nos ofrece la documentación. Hacemos una modificaciones y nos debería quedar así:

```js
require('dotenv').config()
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID

const client = new OAuth2Client(CLIENT_ID);


async function googleVerify(token = '') {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });

    const { name, picture, email } = ticket.getPayload()

    return {
        name, 
        image: picture, 
        email
    }
}


module.exports = {
    googleVerify
}
```

En nuestro controlador de Google vamos a tener la siguiente logica:

```js
const googleSignIn = async (req, res = response) => {
    const { id_token } = req.body

    try {
        const { name, image, email } = await googleVerify(id_token)

        res.json({
            msg: 'Google Sign In, Ok',
            id_token
        })
    } catch (error) {
        console.log('Error: '.red, error)
        res.status(400).json({ msg: 'El token no se pudo verificar' })
    }
}
```

## Creando un usuario personalizado con las credenciales de Google

Una vez tengamos el toquen del usuario que ingresa con Google, debemos evaluar si ya está registrado en nuestra base de datos con el email que acaba de ingresar, si es un usuario nuevo, se crea con una data por defecto en algunos campos. También se verifica si el usuario no ha sido inhabilitado en nuestra base de datos.

```js
const googleSignIn = async (req, res = response) => {
    ...
    try {
        const { name, image, email } = await googleVerify(id_token)

        let user = await User.findOne({ email })
        if (!user) {
            const data = {
                name,
                email,
                password: 'En espera de cambios',
                image,
                role: 'USER_ROlE',
                google: true
            }
            user = new User(data)
            await user.save()
        }

        if (!user.status) return res.status(401).json({ msg: 'Usuario bloqueado, habla con el administrador' })

        const token = await generateJWT(user.id)

        res.json({
            ...,
            user,
            token
        })
    } catch (error) {
        console.log('Error: '.red, error)
        res.status(400).json({ msg: 'El token no se pudo verificar' })
    }
}
```

## Logout - Google Identity

Dentro de `index.html` creamos un botón para salirnos de la cuenta de Google:

```html
<button id="google_signout">Google SignOut</button>
```

Y dentro de los scripts le damos funcionalidad cuando se le da click. Lo primero que va a hacer es desactivar el auto selector de la cuenta, y remover de las cuentas del google el item guardado en el local storage con el correo de ingreso, luego limpia el local storage y recarga la aplicación:

```html
<script>
    function handleCredentialResponse(response) {
        ...
        fetch('http://localhost:8080/api/auth/google', {
            ...
        })
            .then(...)
            .then(res => {
                ...
                localStorage.setItem('email', res.user.email)
            })
            .catch(...)
        }

    const button = document.getElementById('google_signout')
    button.onclick = () => {
        google.accounts.id.disableAutoSelect()
        google.accounts.id.revoke(localStorage.getItem('email'), done => {
            localStorage.clear()
            location.reload()
        })
    } 
</script>
```

## Publicar en Heroku - Google Sign In

Nuevamente se deben subir las nuevas variables de entorno en Heroku, guardamos los cambios y enviamos el commit.

## Pro Tip: Generar la documentación automática de nuestros servicios

Dentro de Postman podemos ir a las colecciones y en las opciones de las mismas, seleccionar View Documentation y modificar lo que necesitemos. Una vez publicado, podemos acceder a la documentación y observar como se mira en los entornos de producción y desarrollo y como se haría la petición en otros lenguajes.
