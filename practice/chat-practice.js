const express = require('express');
const socketio = require('socket.io');
const app = express();

app.use(express, express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer, {
  path: '/socket.io',
  serveClient: true,
});
io.on('connection', (socket) => {
  socket.emit('messageFromServer', { data: 'Welcome to our server' });
  socket.on('messageToServer', (dataFromClient) => {
    console.log(dataFromClient);
  });
  socket.on('newMessageToServer', (msg) => {
    io.emit('messageToClients', { text: msg.text });
  });
});

setTimeout(() => {
  io.of('/admin').on(
    'connection',
    (socket) => {
      console.log('Someone connected to admin namespace');
      io.of('/admin').emit('welcome', 'Welcome to admin channel!');
    },
    2000
  );
});

// Socket IO server -> Namespaces (localhost:9000/[namespace]) -> Romms are inside the namespace
// Namespaces are not shared with others
// Rooms are shared
// in each room people can chat
// The server can communicate across namespaces
// but on the client the socket needs to be in THAT namespace
// in order to get the events
