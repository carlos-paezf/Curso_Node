const fs = require('fs')
const colors = require('colors')


const crearArchivo = async (base = 1, listar = false, hasta = 10) => {
    if (listar) {
        console.log(colors.blue('================='));
        console.log(`Tabla del ${base}`.underline.blue);
        console.log(colors.blue('================='));
    }

    try {
        let salida = ''

        for (let i = 0; i <= hasta; i++) {
            salida += `${base} * ${i} = ${base * i}\n`
        }

        listar && console.log(salida.gray)

        fs.writeFileSync(`./salida/tabla-${base}.txt`, salida)
        return `tabla-${base}.txt`
    } catch (error) {
        throw error
    }
}


module.exports = {
    crearArchivo
}
