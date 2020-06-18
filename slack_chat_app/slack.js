const express = require('express');
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');
// console.log(namespaces[0]);
app.use(express.static(__dirname + '/public'));
const expressServer = app.listen(9000);
const io = socketio(expressServer);

// io.on = io.of('/').on = io.sockets.on
// io.emit = io.of('/').emit = io.sockets.emit
io.on('connection', (socket) => {
  // console.log(socket.handshake)
  // build an array to send back with the img and endpoing for each NS
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  // console.log(nsData)
  // sned the nsData back to the client. We need to use socket, NOT io, because we want it to
  // go to just this client.
  socket.emit('nsList', nsData);
});

// loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {
  // const thisNs = io.of(namespace.endpoint)
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    const username = nsSocket.handshake.query.username;
    // a socket has connected to one of our chatgroup namespaces.
    // send that ns gorup info back
    nsSocket.emit('nsRoomLoad', namespace.rooms);
    nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {
      // deal with history... once we have it
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(namespace, roomToLeave);
      nsSocket.join(roomToJoin);
      io.of(namespace.endpoint)
        .in(roomToJoin)
        .clients((error, clients) => {
          numberOfUsersCallback(clients.length);
        });
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomToJoin;
      });
      nsSocket.emit('historyCatchUp', nsRoom.history);
      updateUsersInRoom(namespace, roomToJoin);
    });
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
        avatar: 'https://via.placeholder.com/30',
      };
      // Send this message to ALL the sockets that are in the room that THIS socket is in.
      // how can we find out what rooms THIS socket is in?
      // console.log(nsSocket.rooms)
      // the user will be in the 2nd room in the object list
      // this is because the socket ALWAYS joins its own room on connection
      // get the keys
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      // we need to find the Room object for this room
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomTitle;
      });
      nsRoom.addMessage(fullMsg);
      io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);
    });
  });
});

function updateUsersInRoom(namespace, roomToJoin) {
  // Send back the number of users in this room to ALL sockets connected to this room
  io.of(namespace.endpoint)
    .in(roomToJoin)
    .clients((error, clients) => {
      io.of(namespace.endpoint)
        .in(roomToJoin)
        .emit('updateMembers', clients.length);
    });
}
// Socket IO server -> Namespaces (localhost:9000/[namespace]) -> Romms are inside the namespace
// Namespaces are not shared with others
// Rooms are shared
// in each room people can chat
// The server can communicate across namespaces
// but on the client the socket needs to be in THAT namespace
// in order to get the events

// When joining to a room - it is visible to the server only the client dont know it is a room (it is the same to him - like namespace) only server knows that it is different rooms
