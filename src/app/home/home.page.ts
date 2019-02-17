import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {ToastController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(public navCtrl: NavController, private router: Router,
    private storage: NativeStorage, private toastController: ToastController) { 
      //Controlla se l'utente ha gà effettuato il login
    //se si ridirige alla pagina iniziale
    this.storage.getItem('idUtente')
    .then(data => {
      //bloccare lahistory con replace url
      this.router.navigate(['/tabs'],{ replaceUrl: true }) 
    }, error => {
    });
  }

  ngOnInit() {
    
  }

  signIn() {
  	this.router.navigate(['login']);
  }

  goToRegister() {
    this.navCtrl.navigateRoot('/register');
  }

  
  async presentToast(text) {
    const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
  }
}
