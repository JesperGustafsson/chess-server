const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http
  , {
  cors: {
      origin: true//["https://hungry-franklin-438ea6.netlify.app/", "http://localhost:3000"] //needed so that port ;3000 can connect to the server at ;4000
  },
});var playerID = 1;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket) {
    console.log(`a user ${playerID} connected`);
  //  socket.emit("io emit", { msg:`Welcome, player ${playerID}!`, newPlayerID:playerID });
   // playerID=playerID*-1;
    socket.nickname = playerID; 
    playerID++;
    socket.on("socket emit", () => {
        io.emit("io emit-two", "The server noticed that you clicked something!");
    });

    socket.on('disconnect', () => {
      console.log("someone disconnected.")
      playerID=playerID-1;
    });

    socket.on('join room', (roomName) => {
      const clientsInRoom = io.sockets.adapter.rooms.get(roomName) 
      if (!clientsInRoom) { //room has no clients -> first player!
         socket.emit("io emit", { msg:`Welcome, player 1!`, newPlayerID:1 });
      } else if (clientsInRoom.size > 1) {
        console.log("room is full!")
        console.log(clientsInRoom, clientsInRoom.size)
        
      } else {
        socket.emit("io emit", { msg:`Welcome, player2!`, newPlayerID:2 });

      }
      socket.join(roomName);
      console.log("someon joined a room!", roomName)

    })

    socket.on('send ping', (roomName) => {
      console.log("ping sent!")
      socket.broadcast.to(roomName).emit('ping received');
    })

    //Sets currentPlayer to next
    socket.on('next player', ({ currentPlayer, board, roomName }) => {

      console.log("next player!1", currentPlayer, roomName);
      currentPlayer == 1 ? currentPlayer = 2 : currentPlayer = 1;
      console.log("next player!2", currentPlayer);
     // console.log(board);
      socket.broadcast.to(roomName).emit('new player', { newCurrentPlayer: currentPlayer, newBoard: board })
    });
});




http.listen(process.env.PORT || 4000, () => {
  console.log('listening on *:4000');
});