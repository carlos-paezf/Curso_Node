const deadpool = {
    nombre: 'Wade',
    apellido: 'Wilson',
    poder: 'Regeneración',
    getNombre() {
        return `${this.nombre}, ${this.apellido}, ${this.poder}`
    }
}

console.log(deadpool.getNombre())


// const nombre = deadpool.nombre
// const apellido = deadpool.apellido
// const poder = deadpool.poder

const { nombre, apellido, poder } = deadpool
console.log(nombre, apellido, poder)


const imprimirHeroe1 = (heroe) => {
    const { nombre, apellido, poder, edad = 0 } = heroe
    console.log(nombre, apellido, poder, edad)
}
imprimirHeroe1(deadpool)


const imprimirHeroe2 = ({ nombre, apellido, poder, edad = 0 }) => {
    nombre = 'David'
    console.log(nombre, apellido, poder, edad)
}
imprimirHeroe2(deadpool)



const heroes = ['Deadpool', 'Spyderman', 'Superman', 'Batman']

// const h0 = heroes[0]
// const h3 = heroes[3]

const [h0, , , h3] = heroes

console.log(h0, h3);