require('colors')
require('dotenv').config()

const { inquirerMenu, inquirerPausa, inquirerLeerInput, inquirerListadoLugares } = require("./helpers/inquirer")
const Busquedas = require('./models/busquedas')


const main = async () => {
    let busqueda = new Busquedas()
    let opt = 0

    do {
        opt = await inquirerMenu()

        switch (opt) {
            case 1: 
                const termino = await inquirerLeerInput('Ciudad: ')
                const lugares = await busqueda.ciudad(termino)
                const id = await inquirerListadoLugares(lugares)
                const lugarSeleccionado  = lugares.find(l => l.id === id)
                if (id === 0) continue

                busqueda.agregarHistorial(lugarSeleccionado.nombre)
                
                const clima = await busqueda.clima(lugarSeleccionado.lat, lugarSeleccionado.lng)
                
                console.clear()
                console.log(`\nInformación de la ciudad\n`.green)
                console.log(`Ciudad: ${lugarSeleccionado.nombre.blue}`)
                console.log(`Latitud: ${lugarSeleccionado.lat}`)
                console.log(`Longitud: ${lugarSeleccionado.lng}`)
                console.log(`Temperatura: ${clima.temp}`)
                console.log(`Temp. Minima: ${clima.min}`)
                console.log(`Temp. Máxima: ${clima.max}`)
                console.log(`El clima está: ${clima.desc.italic.magenta}`)
            break;
            case 2: 
                busqueda.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+1}.`.green
                    console.log(`${idx} ${lugar}`)
                })
            break;
            default: break;
        }

        opt !== 0 && await inquirerPausa()
    } while (opt !== 0);
}


main()