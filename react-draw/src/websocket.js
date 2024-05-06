export let send

export const startWebsocketConnection = ({endpoint, uuid}) => {
  const host = process.env.NODE_ENV === 'production' ? window.location.host : 'localhost:8080'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new window.WebSocket(`${protocol}//${host}/${endpoint}`) || {}
  
  ws.onopen = () => {
    console.log(`ws connection [${endpoint}] opened `)
    if (uuid) {
      send(JSON.stringify({uuid: uuid}))
    }
  }

  ws.onclose = (e) => {
    console.log(`ws connection [${endpoint}]' closed, ${e.code}, ${e.reason}`)
  }
  
  ws.onerror = (e) => {
    console.log(`ws connection [${endpoint}]' error, ${e.code}, ${e.reason}`)
  }

  ws.onmessage = (e) => {
    //console.log(`ws message [${endpoint}] received: `, e.data);
    onMessageCallback && onMessageCallback(e.data)
  }

  send = ws.send.bind(ws)
  
}

let onMessageCallback
export const registerOnMessageCallback = (fn) => {
  onMessageCallback = fn
}
