require('colors')


const mostrarMenu = () => {
    return new Promise(resolve => {
        console.clear()
        console.log('=================================='.blue)
        console.log('Seleccione una opción'.underline.blue)
        console.log('==================================\n'.blue)

        console.log(`${'1.'.green} Crear Tarea`)
        console.log(`${'2.'.green} Listar Tarea`)
        console.log(`${'3.'.green} Listar Tareas Completadas`)
        console.log(`${'4.'.green} Listar Tareas Pendientes`)
        console.log(`${'5.'.green} Completar Tarea(s)`)
        console.log(`${'6.'.green} Eliminar Tarea`)
        console.log(`${'0.'.green} Salir\n`)

        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })

        readline.question('Seleccione una opción: ', (opt) => {
            readline.close()
            resolve(opt)
        })
    })
}


const pausa = () => {
    return new Promise(resolve => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })

        readline.question(`\nPresionse ${'ENTER'.cyan} para continuar\n`, (opt) => {
            readline.close()
            resolve()
        })
    })
}



module.exports = {
    mostrarMenu,
    pausa
}
