const express = require('express');
const socketio = require('socket.io');
const app = express();

let namespaces = require('./data/namespaces');

app.use(express, express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer, {
  path: '/socket.io',
  serveClient: true,
});

namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on('connection', (socket) => {
    console.log(`${socket.id} has join ${namespace.endpoint}`);
  });
});

io.on('connection', (socket) => {
  socket.emit('messageFromServer', { data: 'Welcome to our server' });
  socket.on('messageToServer', (dataFromClient) => {
    console.log(dataFromClient);
  });
  socket.join('level1');
  io.of('/')
    .to('level1')
    .emit('joined', `${socket.id} Have joined the level 1 room`);
});
io.of('/admin').on('connection', (socket) => {
  console.log('Someone connected to admin namespace');
  io.of('/admin').emit('welcome', 'Welcome to admin channel!');
});

// Socket IO server -> Namespaces (localhost:9000/[namespace]) -> Romms are inside the namespace
// Namespaces are not shared with others
// Rooms are shared
// in each room people can chat
// The server can communicate across namespaces
// but on the client the socket needs to be in THAT namespace
// in order to get the events

// When joining to a room - it is visible to the server only the client dont know it is a room (it is the same to him - like namespace) only server knows that it is different rooms
