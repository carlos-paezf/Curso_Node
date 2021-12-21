const createMessage = (from, message) => {
    return {
        from,
        message, 
        date: new Date().getTime()
    }
}


module.exports = {
    createMessage
}