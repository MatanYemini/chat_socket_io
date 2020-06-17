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

io.on('connection', (socket) => {
  // build an array to send back with img and endpoint for each NS
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  // send namespace data back to the client, we need to use socket, NOT io, because we want it to go
  // just to this client
  socket.emit('nsList', nsData);
});

namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    console.log(`${nsSocket.id} has join ${namespace.endpoint}`);
    // someone connected to our chatgroups namespace
    nsSocket.emit('nsRoomLoad', namespaces[0].rooms);
    nsSocket.on('joinRoom', (roomToJoin, usersNumberCallBack) => {
      nsSocket.join(roomToJoin);
      // A callback when someone is entered
      //Deal with history
      io.of('/wiki')
        .in(roomToJoin)
        .clients((error, clients) => {
          console.log(clients);
          usersNumberCallBack(clients.length);
        });
    });
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: 'rbunch',
        avatar: 'https://via.placeholder.com/30',
      };
      console.log(msg);
      // Send the message to All the sockets that are in the room that this Socket is in.
      // how we can find what rooms THIS socket is in?
      // The user will be in the 2nd room in the object list (this first is the namespace)
      // This is because the socket ALWAYS joins its own room on connection
      const roomTitle = Object.keys(nsSocket.rooms);
      io.of('/wiki').to(roomTitle).emit('messageToClients', fullMsg);
    });
  });
});

// Socket IO server -> Namespaces (localhost:9000/[namespace]) -> Romms are inside the namespace
// Namespaces are not shared with others
// Rooms are shared
// in each room people can chat
// The server can communicate across namespaces
// but on the client the socket needs to be in THAT namespace
// in order to get the events

// When joining to a room - it is visible to the server only the client dont know it is a room (it is the same to him - like namespace) only server knows that it is different rooms
