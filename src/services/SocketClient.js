/**
 * Created by Patrick on 04.06.2017.
 */
import { SessionManager } from './SessionManager'

class SocketManager {
  /**
   * @type {WebSocket}
   */
  socket
  // timestamp in ms
  lastConnectTime = 0
  error = false
  connected = false
  requestId = 0
  /**
   * @type {Array<{resolve: function, reject: function}>}
   */
  promises = []

  constructor () {
    // if (document.location.hostname === 'localhost') {
    //  this.hostName = '192.168.1.103'
    // } else {
    this.hostName = document.location.hostname
    this.protocol = document.location.protocol === 'https:' ? 'wss' : 'ws'
    this.port = document.location.port === '' ? '' : ':3000'
    // this.hostName = '192.168.178.126'
    // }
  }

  /**
   *
   * @param username
   * @param password
   * @param token
   * @param register
   * @returns {Promise}
   */
  connect (username, password, token, register) {
    console.log('trying to connect')
    if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {
      // if socket already open, its good
      console.log('socket already open')
      return Promise.resolve()
    }
    this.connected = false
    this.loading = true
    this.lastConnectTime = Date.now()

    return new Promise((resolve, reject) => {
      let socket = new WebSocket(this.protocol + '://' + this.hostName + this.port)
      socket.onopen = () => {
        console.log('open')
        this.connected = true
        this.loading = false
        this.sendMessage({
          action: register ? 'register' : 'login',
          username,
          password,
          token
        }).then((response) => {
          resolve(response)
        }).catch(response => {
          reject(response)
        })
      }
      socket.onmessage = SocketManager.onMessage
      socket.onclose = () => {
        this.connected = false
        console.log('socket closed')
        reject()
        // retry to connect if logged in max every 10s
        setTimeout(() => {
          console.log('trying to reconnect')
          SessionManager.checkLoggedIn().then(loggedIn => {
            if (loggedIn) {
              SessionManager.retryLogin()
            }
          })
        }, Math.max(this.lastConnectTime + 1000 * 10 - Date.now(), 1000))
      }
      socket.onerror = (e) => {
        console.log(e)
        reject()
      }
      this.socket = socket
    })
  }

  static onMessage (e) {
    let answer = JSON.parse(e.data)
    console.log('received message', answer)
    if (!answer.error) {
      SessionManager.updateStatus(answer)
    }

    // fulfill the corresponding promise if a request id is set
    if (answer.requestId !== undefined && SocketClient.promises.length > answer.requestId) {
      let promise = SocketClient.promises[answer.requestId]
      if (answer.error) {
        promise.reject(answer)
      } else {
        promise.resolve(answer)
      }
      // delete the entry afterwards
      delete SocketClient.promises[answer.requestId]
    } else if (answer.requestId !== undefined) {
      console.log(`could not assign request ${answer.requestId} to a promise`)
    }
  }

  sendMessage (command, isRetry = false) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.log('did not send message: socket not open')
      if (!isRetry) {
        SessionManager.retryLogin().then(value => {
          if (!value) {
            return
          }
          this.sendMessage(command, true)
        })
      } else {
        window.alert('Keine Verbindung :(')
      }
      return
    }
    command.requestId = this.requestId++
    let msg = JSON.stringify(command)
    console.log('sending message', command)
    this.socket.send(msg)

    // create a new promise and add it to the array of functions
    return new Promise((resolve, reject) => {
      this.promises[command.requestId] = {resolve, reject}
    })
  }

  createGame (name, sheetCount, textCount, users) {
    let payload = {
      action: 'createGame',
      newGame: {
        sheetCount,
        name,
        users,
        textCount
      }
    }
    return this.sendMessage(payload)
  }

  inviteUsers (gameId, users) {
    return this.sendMessage({
      action: 'inviteUser',
      gameId,
      users
    })
  }

  addText (gameId, sheetNumber, text) {
    return this.sendMessage({
      action: 'addText',
      gameId,
      sheetNumber,
      text
    })
  }

  registerUser (username, password) {
    return this.connect(username, password, null, true)
  }

  setGameName (gameId, name) {
    return this.sendMessage({
      action: 'setGameName',
      name,
      gameId
    })
  }

  excludeUser (gameId, username) {
    return this.sendMessage({
      action: 'excludeUser',
      gameId,
      username
    })
  }
}

export let SocketClient = new SocketManager()
window.sc = SocketClient
