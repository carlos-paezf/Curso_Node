const fs = require('fs')
const axios = require('axios')


class Busquedas {
    historial = []
    path = './db/database.json'

    constructor() {
        this.leerDB()
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 25,
            'language': 'es'
        }
    }

    async ciudad(lugar = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            })
            const { data } = await instance.get()
            return data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))
        } catch (error) {
            return []
        }
    }

    get paramsOpenWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async clima(lat = '', lon = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {lat, lon, ...this.paramsOpenWeather}
            })
            const res = await instance.get()
            const { weather, main } = res.data
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (error) {
            return ''
        }
    }

    agregarHistorial(lugar = '') {
        if (this.historial.includes(lugar.toLowerCase())) return
        this.historial = this.historial.splice(0, 10)
        this.historial.unshift(lugar.toLowerCase())
        this.guardarDB()
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync(this.path, JSON.stringify(payload))
    }

    get historialCapitalizado() {
        return this.historial.map(h => {
            let palabras = h.split(' ')
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1))
            return palabras.join(' ')
        })
    }

    leerDB() {
        if (!fs.existsSync(this.path)) return
        const info = fs.readFileSync(this.path, { encoding: 'utf-8' })
        const data = JSON.parse(info)
        this.historial = data.historial
    }
}

module.exports = Busquedas