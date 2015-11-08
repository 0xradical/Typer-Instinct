/// <reference path="../lib/typings/core-js.d.ts" />
/// <reference path="../lib/typings/peerjs.d.ts" />

interface Window {
    game: any;
}

module Network {
  const API_KEY = '3c8e8hl4a8xgvi';

  export class Manager {
    buffer = [];
    isHost = false;

    conn: PeerJs.DataConnection;
    peer: PeerJs.Peer;
    game: Game;
    lastSentTimestamp: number;

    constructor() {
      this.peer = new Peer({
        key: API_KEY
      });

      this.peer.on('open', function(id) {
        console.log("[Network.Manager] Peer ID: " + id);
      });
    }

    client(hostKey, callback) {
      this.conn = this.peer.connect(hostKey, {
        reliable: true
      });

      this.conn.on('data', this.onReceive.bind(this));
      callback();
    }

    host(callback) {
      this.isHost = true;

      this.peer.on('connection', (conn) => {
        this.conn = conn;
        this.conn.on('data', this.onReceive.bind(this));
        callback();
      });
    }

    onReceive(data: any) {
      if(!this.game) {
        console.log('NETWORK SEM GAME');
        this.game = window.game;
        // return;
      }
      console.log(data);
      let opponentState = data.opponentState;
      this.game.loadOpponentState(data.playerState);
    }

    appendAction(action: any) {
      this.buffer.push(action);
    }

    sendState(playerState: any, globalState: any = null) {
      var msg = {
        controls: this.buffer,
        playerState: playerState,
        globalState: ''
      }

      if(this.isHost && globalState != null) {
        // if host, include game state info
        msg.globalState = globalState;
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
