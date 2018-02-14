// import axios from 'axios';
import { Observable } from 'rxjs/Observable'
import FirebaseService from './firebase/firebase';

const fireUser = FirebaseService.database().ref().child('rotas');
const sep = '@@-@3';

class ApiFirebaseAcess {

  static getAll() {
    return Observable.create(obs => {
      fireUser.on('value', snap => {
        obs.next(snap.val());
      },(errorObject) => {
        obs.error(errorObject);
      });
    });
  }

  // Retorna todos os links de uma url, filhos direto da url.
  static getRotaLinks(url) {
    console.log('**** getRotaLinks ****', '\n\n');
    let linkPai = url.split('/').join(sep);
    let links = [];

    return new Promise((resolve, reject) => {
      fireUser.orderByKey().startAt(linkPai).on('value', snap => {
        if(snap.val() !== null) {
          Object.keys(snap.val()).forEach(el => {
            if(el.startsWith(linkPai)) {
              let listaLinks = el.split(linkPai);
              console.log(linkPai, listaLinks, listaLinks.length);
              if(listaLinks.length > 2)
                ;
              else {
                if(listaLinks[1].split(sep).length > 2 || listaLinks[1].length === 0)
                  ;
                else
                  links.push(url + listaLinks[1]);
              }
            }
          });
          if(links.length > 0)
            resolve(links);
          else
            resolve(false); 
          console.log(links);
        }

      },(errorObject) => {
        reject(null);
      });

    });
    
    console.log('\n', '**** END getRotaLinks ****', '\n');
  }

  // Retorna o texto que está na url passada.
  static getRotaTexto(url) {
    const rota = url.split('/').join(sep);
    return new Observable(obs => {
      fireUser.orderByKey().equalTo(rota).on('value', snap => {
        obs.next(snap.val());
      },(errorObject) => {
        obs.error(null);
      });
    });
  }

  // Adiciona uma senha na rota.
  static postRotaSenha(url, senha) {
      const rota = url.split('/').join(sep);
      
      return new Promise((resolve, reject) => {
        const fire = FirebaseService.database().ref().child(`rotas/${rota}/senha`);
          fire.set(senha, erro => {
            if(erro === false)
               reject(false);
            });
         resolve(true);
     });
  }

  // Posta um texto na url passada.
  static postRotaTexto(url, texto) {
    const rota = url.split('/').join(sep);
    return new Promise ((resolve, reject) => {
      const fire = FirebaseService.database().ref().child(`rotas/${rota}/texto`);
      fire.set(texto, erro => {
        if(erro === false)
          resolve(false);
      });
      resolve(true);
    });
  }

}// Fim da classe.

export default ApiFirebaseAcess;
