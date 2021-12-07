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


const getInfoUsuario = async (id) => {
    try {
        const empleado = await getEmpleado(id)
        const salario = await getSalario(id)
        
        return `El salario del empleado ${empleado} es de ${salario}`
    } catch (error) {
        throw error
    }
}

getInfoUsuario(id)
    .then(msg => console.log(msg))
    .catch(error => console.log(error))