var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

let allClients = [];

app.get('/', (req, res) => {
  res.send('server is running');
});

// Conecta um cliente ao servidor.
io.on("connection", (client) => {
  allClients.push(client);

  // Fica escutando o evento getText que devolve o texto corrente da url passada.
  client.on('getText', (url) => {
    console.log(url);

    // Emite para o cliente qualquer alteração que houver no firebase.
    client.emit('sendReactApp', 'Tomara que eu não tenha feito cagada.');
  });

  // ************************* Fecha o servidor *************************
  client.on('close', () => {
    console.log('user disconnected', client.id);
    var i = allClients.indexOf(client);
    allClients.splice(i, 1);
    client.disconnect();
  });

  client.on('disconnect', () => {
    console.log('user disconnected', client.id);
    var i = allClients.indexOf(client);
    allClients.splice(i, 1);
    client.disconnect();
  });

});

http.listen(3000, () => {
  console.log('listening on port 3000');
});