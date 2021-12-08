require('colors')

const { guardarDB, leerDB } = require('./helpers/adminArchivo')
const { inquirerMenu, inquirerPausa, inquirerLeerInput, inquirerListadoTareasBorrar, inquirerConfirmar, inquirerMostrarListadoChacklist } = require('./helpers/inquirer')
const Tareas = require('./models/tareas')


const main = async () => {
    let opt = '0'

    const tareas = new Tareas()

    const tareasDB = leerDB()

    if (tareasDB) {
        tareas.cargarTareasFromArray(tareasDB)
    }

    do {
        opt = await inquirerMenu()

        switch (opt) {
            case '1':
                const desc = await inquirerLeerInput('Descripción:')
                tareas.crearTarea(desc)
                console.log(desc)
                break;

            case '2': tareas.listadoCompleto(); break;

            case '3': tareas.listarPendienteCompletadas(); break;

            case '4': tareas.listarPendienteCompletadas(false); break;

            case '5':
                const ids = await inquirerMostrarListadoChacklist(tareas.listadoArr)
                tareas.toggleCompletadas(ids)
                break;

            case '6':
                const id = await inquirerListadoTareasBorrar(tareas.listadoArr)
                if (id !== '0') {
                    const ok = await inquirerConfirmar('¿Estás seguro de eliminar la tarea?')
                    if (ok) {
                        tareas.borrarTarea(id)
                        console.log('Tarea Eliminada correctamente'.gray)
                    } else {
                        console.log('Acción cancelada'.gray)
                    }
                } else {
                    console.log('Acción cancelada'.gray)
                }
                break;

            default:
                break;
        }
        guardarDB(tareas.listadoArr)

        // console.log({opt})
        opt !== '0' && await inquirerPausa()
    } while (opt !== '0')
}


main()
