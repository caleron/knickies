import Cookies from 'js-cookie'
import { SocketClient } from './SocketClient'

class Manager {
  cookieName = 'SESSION'
  cookieLoaded = false
  token = ''
  /**
   * @type {{runningGames: [], closedGames: [], currentUser: string, users?: Map<string, string>}}
   */
  status = {runningGames: [], closedGames: [], currentUser: '', users: new Map()}

  checkLoggedIn () {
    if (!this.cookieLoaded) {
      // do this only once
      this.cookieLoaded = true

      let token = Cookies.get(this.cookieName)
      if (token && token.length > 10) {
        this.token = token
        // token cookie exists, retrieve the clients for the token
        return SocketClient.connect(null, null, this.token).then(() => {
          return true
        }).catch(() => {
          // reset the cookie to not attempt login again
          Cookies.remove(this.cookieName)
          return false
        })
      }
    }
    return Promise.resolve(this.token.length > 0)
  }

  updateStatus (answer) {
    this.status.runningGames = answer.runningGames
    this.status.closedGames = answer.closedGames
    this.status.currentUser = answer.currentUser

    if (answer.token) {
      this.token = answer.token
      Cookies.set(this.cookieName, this.token)
    }
    // map users to their lowercase
    this.status.users = new Map()
    for (let user of answer.users) {
      this.status.users.set(user.toLowerCase(), user)
    }
    for (let game of this.status.runningGames) {
      this.setSubtitle(game)

      for (let sheet of game.sheets) {
        if (sheet.nextUser.toLowerCase() === this.status.currentUser.toLowerCase()) {
          game.myTurn = true
          break
        }
      }
    }
    for (let game of this.status.closedGames) {
      this.setSubtitle(game)
    }
  }

  getGame (id) {
    id = Number(id)
    if (!this.status.runningGames || !this.status.closedGames) {
      console.log(`could not get game ${id}, games not loaded`)
      return
    }
    for (let game of this.status.runningGames) {
      if (game.id === id) {
        return game
      }
    }
    for (let game of this.status.closedGames) {
      if (game.id === id) {
        return game
      }
    }
  }

  getRunningGames () {
    return this.status.runningGames
  }

  getClosedGames () {
    return this.status.closedGames
  }

  setSubtitle (game) {
    let users = game.users.slice()
    let index = users.indexOf(game.creator)
    if (index !== -1) {
      // remove the creator from the string
      users.splice(index, 1)
    }
    let subtitle = 'mit&nbsp;<b>' + this.status.users.get(game.creator) + '</b>'
    let count = 0
    for (let user of users) {
      // max 3 entries
      if (count >= 3) {
        subtitle += ', ...'
        break
      }
      subtitle += ', ' + this.status.users.get(user)
      count++
    }
    game.subtitle = subtitle
  }
}

export let SessionManager = new Manager()
window.sm = SessionManager
window.onerror = window.alert
