import ApiFirebaseAcess from './services/apiFirebaseAcess';

const app = require('express')();
const http = require('http').createServer(app);
// const http = require('http').Server(app);
const io = require('socket.io')(http, { origins: '*:*'});

/* setup cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});*/

http.listen(3000, () => {
  console.log('listening on port 3000');
});

const allClients = [];
let rotaAutal = null;
let subs = null;
let arqs = null;

app.get('/', (req, res) => {
  res.send('server is running');
});

// Conecta um cliente ao servidor.
io.on("connection", (client) => {
  allClients.push(client);

  // Fica escutando o evento que devolve uma lista de links da pasta.
  client.on('getLinks', (url) => {
    ApiFirebaseAcess.getRotaLinks(url).then(res => {
        if(res !== false)
          client.emit('getReactLinks', res);
        else
          client.emit('getReactLinks', false);
    }).catch(err => {
        client.emit('getReactLinks', err);
    });
  });

  // Fica escutando o evento getText que devolve o texto corrente da url passada.
  client.on('getText', (url) => {
    let obs = {
      next: (data) => {
        // console.log(data);
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
    // console.log('server,js - 51', url);

    rotaAutal = url;
    subs = ApiFirebaseAcess.getRotaTexto(url).subscribe(obs);
  });

  // Insere um texto em uma rota.
  client.on('postText', (url, msg) => {
    ApiFirebaseAcess.postRotaTexto(url, msg).then(data => {
      // console.log(data);
      client.emit(data);
    }).catch(err => {
      client.emit(false);
    });
  });

  // Insere uma senha na rota.
  client.on('postSenha', (url, senha) => {
    ApiFirebaseAcess.postRotaSenha(url, senha).then(data => {
        // console.log('postSenha', data);
        client.emit('postReactSenha', data);
    }).catch(err => {
      // console.log('postSenha', err);
      client.emit('postReactSenha', err);
    });
  
  });

  var files = {}, 
    struct = { 
        name: null, 
        type: null, 
        size: 0, 
        data: [], 
        slice: 0, 
    };

  // Faz upload de um arquivo.
  client.on("uploadArquivo", (url, data) => {
    // console.log(url, data);
    ApiFirebaseAcess.uploadArquivo(url, JSON.parse(data)).then(res => {
      client.emit("uploadArquivoReact", res);
    }).catch(err => {
      client.emit("uploadArquivoReact", err);
    });

  });

  // Deleta um arquivo.
  client.on("deletaArquivo", (url, nomeArquivo) => {
    // console.log("DELETE", nomeArquivo);
    ApiFirebaseAcess.deletaArquivo(url, nomeArquivo).then(res => {
      client.emit("deletaArquivoReact", res);
    }).catch(err => {
      client.emit("deletaArquivoReact", err);
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

// Função que verifica se a rota mudou, caso sim desisncreva.
const verificaRota = (newUrl) => {
  if(rotaAutal !== null && newUrl !== rotaAutal) {
    try {
      subs.unsubscribe();
      arqs.unsubscribe();
    } catch (error) {
      ;
    }
  }
}
