require('dotenv').config()

const express = require('express')
const app = express()
const hbs = require('hbs')
const PORT = process.env.PORT


app.set('view engine', 'hbs')
hbs.registerPartials(__dirname + '/views/partials')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home', {
        nombre: 'David Ferrer',
        titulo: 'Curso de Node'
    })
})

app.get('/generic', (req, res) => {
    res.render('generic', {
        nombre: 'David Ferrer',
        titulo: 'Curso de Node'
    })
})

app.get('/elements', (req, res) => {
    res.render('elements', {
        nombre: 'David Ferrer',
        titulo: 'Curso de Node'
    })
})

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/404.html')
})

app.listen(PORT, () => {
    console.log(`Escuchando en http://localhost:${PORT}`);
})
