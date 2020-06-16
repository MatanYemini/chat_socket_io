const socket = io('http://localhost:9000'); // the /namespace/endpoint
const socket2 = io('http://localhost:9000/admin'); // the /admin namespace

socket.on('connect', () => {
  console.log(socket.id);
});
socket2.on('connect', () => {
  console.log(socket2.id);
});

socket2.on('welcome', (msg) => {
  console.log(msg);
});

socket.on('messageFromServer', (dataFromServer) => {
  console.log(dataFromServer);
  socket.emit('messageToServer', { data: 'Data From Client!' });
});

document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  socket.emit('newMessageToServer', { text: newMessage });
});

socket.on('messageToClients', (msg) => {
  console.log(msg);
  document.querySelector('#messages').innerHTML += `<li>${msg.text}</li>`;
});
