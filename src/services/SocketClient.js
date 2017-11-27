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
      let socket = new WebSocket('ws://' + this.hostName + ':3000')
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
    SessionManager.updateStatus(answer)

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

  sendMessage (command) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.log('did not send message: socket not open')
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

  inviteUser (gameId, username) {
    return this.sendMessage({
      action: 'inviteUser',
      gameId,
      username
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
}

export let SocketClient = new SocketManager()
window.sc = SocketClient
