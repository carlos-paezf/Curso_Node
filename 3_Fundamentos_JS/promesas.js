const empleados = [
    {
        id: 1,
        nombre: 'Carlos'
    },
    {
        id: 2,
        nombre: 'David'
    },
    {
        id: 3,
        nombre: 'Paez'
    }
]


const salarios = [
    {
        id: 1,
        salario: 1000
    },
    {
        id: 2,
        salario: 200
    },
]

const id = 3


const getEmpleado = (id) => {
    return new Promise((resolve, reject) => {
        const empleado = empleados.find(e => e.id === id)?.nombre
        empleado ? resolve(empleado) : reject(`No existe empleado con id ${id}`)
    })
}


const getSalario = (id) => {
    return new Promise((resolve, reject) => {
        const salario = salarios.find(s => s.id === id)
        salario ? resolve(salario.salario) : reject(`No hay salario para el id ${id}`)
    })
}


getEmpleado(id)
    .then(empleado => console.log(empleado))
    .catch(error => console.log(error))


getSalario(id)
    .then(salario => console.log(salario))
    .catch(error => console.log(error))


getEmpleado(id)
    .then(empleado => {
        getSalario(id)
            .then(salario => {
                console.log(`El empleado ${empleado} tiene un salario de ${salario}`)
            })
            .catch(error => console.log(error))
    })
    .catch(error => console.log(error))

let nombre

getEmpleado(id)
    .then(empleado => {
        nombre = empleado
        return getSalario(id)
    })
    .then(salario => console.log(`El empleado ${nombre} tiene un salario de ${salario}`))
    .catch(error => console.log(error))