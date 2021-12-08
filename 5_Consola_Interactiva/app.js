require('colors')

const { mostrarMenu, pausa } = require('./helpers/mensajes')

const main = async () => {
    console.clear()

    let opt = '0'
    do {
        opt = await mostrarMenu()
        console.log({opt})
        opt !== '0' && await pausa()
    } while (opt !== '0')
}

main()
