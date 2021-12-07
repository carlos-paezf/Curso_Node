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


const getEmpleado = (id, callback) => {
    const empleado = empleados.find(e => e.id === id)
    if (empleado) {
        callback(null, empleado.nombre)
    } else {
        callback(`Empleado con id ${id} no existe`)
    }
}


const getSalario = (id, callback) => {
    const salario = salarios.find(s => s.id === id)?.salario
    if (salario) callback(null, salario)
    else callback(`Salario con id ${id} no encontrado`)
}


getEmpleado(id, (err, empleado) => {
    if (err) {
        console.log('Error:')
        return console.log(err)
    }
    console.log(empleado)

    getSalario(id, (error, salario) => {
        if (error) {
            console.log('Error: ');
            return console.log(error)
        }
        console.log(`El empleado ${empleado} tiene un salario de ${salario}`)
    })
})