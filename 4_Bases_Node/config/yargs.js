const argv = require('yargs')
    .options({
        'b': {
            alias: 'base',
            type: 'number',
            demandOption: true,
            description: 'Es la base de la tabla de multiplicar'
        },
        'l': {
            alias: 'listar',
            type: 'boolean',
            demandOption: false,
            default: false,
            description: 'Permite observar información adicional del método crearArchivo()'
        },
        'h': {
            alias: 'hasta',
            type: 'number',
            demandOption: false,
            default: 20,
            description: 'Multiplicar hasta n valor'
        }
    })
    .check((argv, options) => {
        if (isNaN(argv.b)) {
            throw 'La base debe ser un número'
        }
        if(isNaN(argv.h)) {
            throw 'El valor de hasta debe ser un número'
        }
        return true
    })
    .argv


module.exports = argv