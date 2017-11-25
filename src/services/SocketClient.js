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
    if (document.location.hostname === 'localhost') {
      this.hostName = '192.168.1.103'
    } else {
      this.hostName = document.location.hostname
    }
  }

  connect (username, password, token) {
    if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {
      return
    }
    this.connected = false
    this.loading = true
    this.lastConnectTime = Date.now()

    return new Promise((resolve, reject) => {
      let socket = new WebSocket('ws://' + this.hostName + ':4733')
      socket.onopen = () => {
        console.log('open')
        this.connected = true
        this.loading = false
        this.sendMessage({
          action: 'login',
          username,
          password,
          token
        }).then((response) => {
          resolve(response)
        })
      }
      socket.onmessage = this.onMessage
      socket.onclose = () => {
        this.connected = false
        reject()
      }
      socket.onerror = (e) => {
        console.log(e)
        reject()
      }
      this.socket = socket
    })
  }

  onMessage (e) {
    let answer = JSON.parse(e.data)
    console.log(answer)
    SessionManager.updateGames(answer)

    // fulfill the corresponding promise if a request id is set
    if (answer.requestId && this.promises[answer.requestId]) {
      this.promises[answer.requestId].resolve(answer)
      // delete the entry afterwards
      delete this.promises[answer.requestId]
    }
  }

  sendMessage (command) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.log('did not send message: socket not open')
      return
    }
    command.requestId = this.requestId++
    console.log(command)
    let msg = JSON.stringify(command)
    console.log('sending ' + msg)
    this.socket.send(msg)

    // create a new promise and add it to the array of functions
    return new Promise((resolve, reject) => {
      this.promises[command.requestId] = {resolve, reject}
    })
  }

  createGame (name, sheetCount, users) {
    return this.sendMessage({
      action: 'createGame',
      sheetCount,
      name,
      users
    })
  }

  inviteUser (gameId, name) {
    return this.sendMessage({
      action: 'inviteUser',
      gameId,
      name
    })
  }

  addText (gameId, sheetId, text) {
    return this.sendMessage({
      action: 'addText',
      gameId,
      sheetId,
      text
    })
  }
}

export let SocketClient = new SocketManager()
