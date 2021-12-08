const Tarea = require("./tarea")

/**
 * _listado: {
 *      '83bea8d9-a087-49c5-bba8-e1a21b1fb8df': {
 *          id: '83bea8d9-a087-49c5-bba8-e1a21b1fb8df',
 *          desc: 'Ganarle a Thanos',
 *          completadoEn: null
 *      }
 * }
 */
class Tareas {
    _listado = {}

    get listadoArr() {
        const listado = []
        Object.keys(this._listado).forEach(key => {
            const tarea = this._listado[key]
            listado.push(tarea)
        })
        return listado
    }

    constructor() {
        this._listado = {}
    }

    crearTarea(desc = '') {
        const tarea = new Tarea(desc)
        this._listado[tarea.id] = tarea
    }

    cargarTareasFromArray(tareas = []) {
        tareas.map(tarea => {
            this._listado[tarea.id] = tarea
        })
    }

    listadoCompleto() {
        console.log('')
        this.listadoArr.map((d, i) => {
            console.log(`${`${i + 1}`.green}. ${d.desc} :: ${d.completadoEn ? 'Completado'.green : 'Pendiente'.red}`)
        })
    }

    listarPendienteCompletadas(completadas = true) {
        let contador = 1
        console.log('')

        this.listadoArr.map(tarea => {
            const { desc, completadoEn } = tarea
            const estado = completadoEn ? 'Completado'.green : 'Pendiente'.red
            if (completadas) {
                if (completadoEn) {
                    console.log(`${(contador + '.').green} ${desc} :: ${estado} ${completadoEn}`)
                    contador += 1
                }
            } else {
                if (!completadoEn) {
                    console.log(`${(contador + '.').green} ${desc} :: ${estado}`)
                    contador += 1
                }
            }
        })
    }


    borrarTarea(id = '') {
        if (this._listado[id]) {
            delete this._listado[id]
        }
    }


    toggleCompletadas(ids = []){
        ids.forEach(id => {
            const tarea = this._listado[id]
            if (!tarea.completadoEn) {
                tarea.completadoEn = new Date().toISOString()
            }
        })

        this.listadoArr.forEach(tarea => {
            if (!ids.includes(tarea.id)) {
                this._listado[tarea.id].completadoEn = null
            }
        })
    }
}


module.exports = Tareas