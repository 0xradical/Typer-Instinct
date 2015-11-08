/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/peerjs.d.ts" />

module Network {
  export class Manager {
    private static key = '3c8e8hl4a8xgvi';

    buffer = [];
    isHost = false;

    conn: PeerJs.DataConnection;
    peer: PeerJs.Peer;
    lastSentTimestamp: number;

    onReceive: (any) = () => {};
    onConnect: (any) = () => { };

    constructor() {
      this.peer = new Peer({
        key: Manager.key
      });

      this.peer.on('open', function(id) {
        console.log("[Network.Manager] Peer ID: " + id);
      });
    }

    client(hostKey) {
      this.conn = this.peer.connect(hostKey, {
        reliable: true
      });

      this.conn.on('data', this.onReceive);
    }

    host() {
      this.isHost = true;

      this.peer.on('connection', (conn) => {
        this.onConnect();
        this.conn.on('data', this.onReceive);
      });
    }

    appendAction(action: any) {
      this.buffer.push(action);
    }

    sendControls(gameState: any = null) {
      var msg = {
        controls: this.buffer,
        state: null
      }

      if(this.isHost && gameState != null) {
        // if host, include game state info
        msg.state = gameState;
      }

      this.sendData(msg);
      this.buffer.length = 0;
    }

    private sendData(data) {
      this.lastSentTimestamp = Date.now();
      this.conn.send(data);
    }
  }
}
