import ApiFirebaseAcess from './services/apiFirebaseAcess';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const allClients = [];
let rotaAutal = null;
let subs = null;

app.get('/', (req, res) => {
  res.send('server is running');
});

// Conecta um cliente ao servidor.
io.on("connection", (client) => {
  allClients.push(client);

  // Fica escutando o evento que devolve uma lista de links da pasta.
  client.on('getLinks', (url) => {
    let obs = {
      next: (data) => {
        if(data !== false)
          client.emit('getReactLinks', data);
        else
          client.emit('getReactLinks', false);
      },
      error: (err) => {
        client.emit('getReactLinks', err);
      }
    }
    ApiFirebaseAcess.getRotaLinks(url).subscribe(obs);
  });

  // Fica escutando o evento getText que devolve o texto corrente da url passada.
  client.on('getText', (url) => {
    let obs = {
      next: (data) => {
        console.log(data);
        // Emite para o cliente qualquer alteração que houver no firebase.
        if(data !== null)
          client.emit('getReactApp', data);
        else
          client.emit('getReactApp', false);
      },
      error: (err) => {
        client.emit('getReactApp', err);
      }
    }
    verificaRota(url);
    console.log(url);

    rotaAutal = url;
    subs = ApiFirebaseAcess.getRotaTexto(url).subscribe(obs);
  });

  // Insere um texto em uma rota.
  client.on('postText', (url, msg) => {
    console.log(url, 'msg: ' + msg);
    ApiFirebaseAcess.postRotaTexto(url, msg).then(data => {
      console.log(data);
      client.emit(data);
    }).catch(err => {
      client.emit(false);
    });
  });

  // ************************* Fecha o servidor *************************
  client.on('close', () => {
    console.log('user disconnected', client.id);
    const i = allClients.indexOf(client);
    allClients.splice(i, 1);
    client.disconnect();
  });

  client.on('disconnect', () => {
    console.log('user disconnected', client.id);
    const i = allClients.indexOf(client);
    allClients.splice(i, 1);
    client.disconnect();
  });

});

http.listen(3001, () => {
  console.log('listening on port 3001');
});

// Função que verifica se a rota mudou, caso sim desisncreva.
const verificaRota = (newUrl) => {
  if(rotaAutal !== null && newUrl !== rotaAutal) {
    try {
      subs.unsubscribe();
    } catch (error) {
      ;
    }
  }
}