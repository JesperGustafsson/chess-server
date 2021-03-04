const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: true //"http://localhost:3000", //needed so that port ;3000 can connect to the server at ;4000
    },
});

var playerID = 1;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket) {
    socket.nickname = playerID; 
    playerID++;

    socket.on('disconnect', () => {
      playerID--;
    });

    socket.on('join room', (roomName) => {
      const clientsInRoom = io.sockets.adapter.rooms.get(roomName) 
      if (!clientsInRoom) { //room has no clients -> first player!
        socket.join(roomName);
        socket.emit('redirect waiting room', { player: 1 })
      } else if (clientsInRoom.size > 1) {
        console.log("room full")
        socket.emit('redirect room full')
      } else {
        socket.join(roomName);
        socket.emit('redirect waiting room', { player: 2 })
        io.to(roomName).emit('game start')
      }
      socket.on('game over loss', () => {
        socket.to(roomName).emit('game over win')
      });
  
      socket.on('game over draw', () => {
        socket.to(roomName).emit('game over draw')
      });
    })



    //Sets currentPlayer to next
    socket.on('next move', ({ currentPlayer, board, roomName }) => {
      currentPlayer == 1 ? currentPlayer = 2 : currentPlayer = 1;
      socket.to(roomName).emit('next move received', { newCurrentPlayer: currentPlayer, newBoard: board })
    });
});


http.listen(process.env.PORT || 4001, () => {
  console.log('listening on *:4001');
});