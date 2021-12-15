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
|                      | POST (Contiende un body)                                            | Google Sign In - Café MongoDB                      | {{url-auth}}/google                         |

## CRUD y rutas de Categorías


