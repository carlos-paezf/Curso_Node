const inquirer = require('inquirer')
require('colors')

const preguntas = [
    {
        type: 'list',
        name: 'opcion',
        message: '¿Que desea hacer?',
        choices: [
            {
                value: '1',
                name: `${'1.'.green} Crear Tarea`
            },
            {
                value: '2',
                name: `${'2.'.green} Listar Tarea`
            },
            {
                value: '3',
                name: `${'3.'.green} Listar Tareas Completadas`
            },
            {
                value: '4',
                name: `${'4.'.green} Listar Tareas Pendientes`
            },
            {
                value: '5',
                name: `${'5.'.green} Completar Tarea(s)`
            },
            {
                value: '6',
                name: `${'6.'.green} Eliminar Tarea`
            },
            {
                value: '0',
                name: `${'0.'.green} Salir\n`
            }
        ]
    }
]

const inquirerMenu = async () => {
    console.clear()
    console.log('=================================='.blue)
    console.log('Seleccione una opción'.underline.blue)
    console.log('==================================\n'.blue)

    const { opcion } = await inquirer.prompt(preguntas)

    return opcion
}


const inquirerPausa = async () => {
    const pausa = [
        {
            type: 'input',
            name: 'opcion',
            message: `Pulsa ${'ENTER'.cyan} para continuar`
        }
    ]
    console.log('')
    await inquirer.prompt(pausa)
}


const inquirerLeerInput = async (message) => {
    const question = [
        {
            type: 'input',
            name: 'desc',
            message,
            validate(value) {
                if (value.length === 0) {
                    return 'Por favor ingrese un valor'
                }
                return true
            }
        }
    ]

    const { desc } = await inquirer.prompt(question) 
    return desc
}


const inquirerListadoTareasBorrar = async (tareas = []) => {
    const choices = tareas.map((tarea, i) => {
        const idx = `${i+1}`.green
        return {
            value: tarea.id,
            name: `${idx}. ${tarea.desc}`
        }
    })

    choices.unshift({
        value: '0',
        name: '0.'.green + ' Cancelar'
    })

    const preguntas = [{
        type: 'list',
        name: 'id',
        message: 'Borrar',
        choices
    }]

    const { id } = await inquirer.prompt(preguntas)
    return id
}


const inquirerConfirmar = async (message) => {
    const question = [
        {
            type: 'confirm',
            name: 'ok',
            message
        }
    ]

    const { ok } = await inquirer.prompt(question)
    return ok
}


const inquirerMostrarListadoChacklist = async (tareas = []) => {
    const choices = tareas.map((tarea, i) => {
        const idx = `${i+1}`.green
        return {
            value: tarea.id,
            name: `${idx}. ${tarea.desc}`,
            checked: tarea.completadoEn ? true : false
        }
    })

    const pregunta = [{
        type: 'checkbox',
        name: 'ids',
        message: 'Selecciones',
        choices
    }]

    const { ids } = await inquirer.prompt(pregunta)
    return ids
}


module.exports = {
    inquirerMenu,
    inquirerPausa,
    inquirerLeerInput,
    inquirerListadoTareasBorrar,
    inquirerConfirmar,
    inquirerMostrarListadoChacklist
}