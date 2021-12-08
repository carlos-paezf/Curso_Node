require('colors')

const { mostrarMenu, pausa } = require('./helpers/mensajes')

const main = async () => {
    console.clear()
    mostrarMenu()
    pausa()
}

main()
