var nombre_var = 'Carlos'


if (true) {
    nombre_var = 'David'

    let nombre_let = 'Car-Da'
    nombre_let = 'Paez'
    console.log(nombre_let)     //* Paez

    const nombre_const = 'Ferrer'
    nombre_const = 'Ferreira'   //! Assignment to constant variable
    console.log(nombre_const)   //* Ferrer
}

console.log(nombre_var)     //* David
console.log(nombre_let)     //! nombre_let is not defined
console.log(nombre_const)   //! nombre_const is not define