var Network = {
  buffer: [],
  conn: null,
  isHost: false,
  lastSentTimestamp: null,
  peer: null,

  client: function(hostKey) {
    Network.conn = Network.peer.connect(hostKey, {reliable: true});
    Network.conn.on('data', Network.handleReceivedData);

    console.log('Connected to a new game!');
    // Game.init();
  },

  handleReceivedData: function(data) {
    console.log('Received data:')
    console.log(data)
    // magic here
  },

  host: function() {
    Network.isHost = true;

    Network.peer.on('connection', function(conn) {
      Network.conn = conn;
      Network.conn.on('data', Network.handleReceivedData);
      // Game.init();
    });

    console.log('Hosting game!');
  },

  init: function() {
    var peer = new Peer({key: '3c8e8hl4a8xgvi'});
    Network.peer = peer;

    peer.on('open', function(id) {
      console.log('My peer ID is: ' + id);
    });
  },

  appendAction: function(action) {
    Network.buffer.push(action)
  },

  _sendData: function(data) {
    // console.log('sending data', data);
    Network.lastSentTimestamp = Date.now();
    Network.conn.send(data);
  },

  sendControls: function(gameState) {
    var sendObj = {
      controls: Network.buffer
    };

    if(Network.isHost && gameState) {
      // if host, include game state information for sync
      sendObj.state = gameState;
    }

    Network._sendData(sendObj);
    Network.buffer.length = 0;
  }
};
