const http = require('http');

const websocket = require('ws');
const { WSASERVICE_NOT_FOUND } = require('constants');

const server = http.createServer((req, res) => {
  res.end('Connected');
});

const websocketServer = new websocket.Server({ server });
websocketServer.on('headers', (headers, req) => {
  console.log(headers);
});

websocketServer.on('connection', (ws, req) => {
  ws.send('Welcome to our server');
});
server.listen(8000);
