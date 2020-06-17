function joinRoom(roomName) {
  // send this roomName to the server!
  nsSocket.emit('joinRoom', roomName, (newNumberMembers) => {
    // a callback that updates the room member total when we have joined
    document.querySelector(
      '.curr-room-num-users'
    ).innerHTML = `${newNumberMembers} <span class="glyphicon glyphicon-user"></span>`;
  });
}
