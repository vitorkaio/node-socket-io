// import axios from 'axios';
import { Observable } from 'rxjs/Observable'
import FirebaseService from './firebase/firebase';

const fireUser = FirebaseService.database().ref().child('rotas');

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

  static getRotaTexto(url) {
    const rota = url.split('/').join('-');
    return new Observable(obs => {
      fireUser.orderByKey().equalTo(rota).on('value', snap => {
        obs.next(snap.val());
      },(errorObject) => {
        obs.error(null);
      });
    });
  }

  static postRotaTexto(url, texto) {
    console.log(url)
    const rota = url.split('/').join('-');
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