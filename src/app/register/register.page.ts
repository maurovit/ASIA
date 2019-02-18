import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'

//import { AngularFirestore } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { NavController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { HTTP } from '@ionic-native/http/ngx';
import { FileTransfer, FileTransferObject, FileUploadOptions } from'@ionic-native/file-transfer/ngx';
import { OperatorTabsPage } from '../operator-tabs/operator-tabs.page';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  email: string = "";
  password: string = "";
  cpassword: string = "";
  nominativo: string ="";
  descrizione: string="";

  constructor(
    public afAuth: AngularFireAuth,
		//public afstore: AngularFirestore,
		public navCtrl: NavController,
		public user: UserService,
		public alertController: AlertController,
		public router: Router,
		public toastController: ToastController,
		public loadingCtrl: LoadingController,
		private http: HTTP,
		private fT: FileTransfer,
		private storage : NativeStorage,
		
  	){
	//Controlla se l'utente ha gà effettuato il login
    //se si ridirige alla pagina iniziale
    this.storage.getItem('idUtente')
          .then(data => {
            this.router.navigate(['/tabs'],{ replaceUrl: true });
        }, error => {
            
    });
   }

  ngOnInit() {
	 
  }

  async presentAlert(title: string, content: string) {
		const alert = await this.alertController.create({
			header: title,
			message: content,
			buttons: ['OK']
		})

		await alert.present()
  }
  
  async register() {
		
		const { email, password, cpassword } = this
		if(password !== cpassword) {
			return console.error("Le password non corrispondono")
		}
		try {
			const res = await this.afAuth.auth.createUserWithEmailAndPassword(email, password)
			
		
			this.user.setUser({
				email,
				uid: res.user.uid
			})

			if(res){
				this.presentAlert('Successo', 'Sei registrato!')
				this.router.navigate(['/login'])
			}
		} catch(error) {
			console.dir(error)
		}
		
	}

	goToLogin() {
    this.navCtrl.navigateRoot('/login');
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
