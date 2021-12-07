require('colors')

const { crearArchivo } = require('./helpers/multiplicar')
const argv = require('./config/yargs')


console.clear()

argv.l && console.log(process.argv)
argv.l && console.log(argv)


// const [, , arg3 = 'base=1'] = process.argv
// const [, base = 1] = arg3.split('=')


// console.log(base)

const base = argv.b
const listar = argv.l
const hasta = argv.h

crearArchivo(base, listar, hasta)
    .then(nombreArchivo => console.log(nombreArchivo.rainbow, 'creado'.green))
    .catch(error => console.log(error.red))
