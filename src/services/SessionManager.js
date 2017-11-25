import Cookies from 'js-cookie'
import { SocketClient } from './SocketClient'

class Manager {
  cookieName = 'SESSION'
  cookieLoaded = false
  token = ''
  /**
   * @type {{runningGames: [], closedGames[]}}
   */
  status = {}

  checkLoggedIn () {
    if (!this.cookieLoaded) {
      // do this only once
      this.cookieLoaded = true

      let token = Cookies.get(this.cookieName)
      if (token && token.length > 10) {
        this.token = token
        // token cookie exists, retrieve the clients for the token
        return SocketClient.connect(null, null, this.token).then((response) => {
          this.token = response.token
          this.games = response.games
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

  updateGames (answer) {
    this.status = {
      runningGames: answer.runningGames,
      closedGames: answer.closedGames
    }
  }

  getGame (id) {
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
}

export let SessionManager = new Manager()
