class Users {
    constructor() {
        this.users = []
    }

    get allUsersOnline() {
        return this.users
    }

    getUserByID(id) {
        return this.users.filter(user => user.id === id)[0]
    }

    getUsersByRoom(room) {
        return this.users.filter(user => user.room === room)
    }

    connectUser(id, name, room) {
        this.users.push({ id, name, room })
        return this.users
    }

    disconnectUser(id) {
        const userDisconnect = this.getUserByID(id)
        this.users = this.users.filter(user => user.id !== id)
        return userDisconnect
    }
}


module.exports = Users