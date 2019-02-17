import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import {NativeStorage} from '@ionic-native/native-storage/ngx';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = ""
  password: string = ""
  
  constructor(
	  public afAuth: AngularFireAuth,
	  public user: UserService,
	  public navCtrl: NavController,
	  public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
		public router: Router,
		private storage: NativeStorage
	) { 
		//Controlla se l'utente ha gà effettuato il login
    //se si ridirige alla pagina iniziale
    this.storage.getItem('idUtente')
          .then(data => {
            this.router.navigate(['/tabs',{ replaceUrl: true }]);
        }, error => {         
    });
	}

  ngOnInit() {
		
  }

  async login() {
		const { email, password } = this
		try {
			// kind of a hack. 
			const res = await this.afAuth.auth.signInWithEmailAndPassword(email, password)
			
			if(res.user) {
				this.user.setUser({
					email,
					uid: res.user.uid
				})
				this.storage.setItem("idUtente",res.user.uid);
				this.storage.setItem("email",res.user.email);
				this.router.navigate(['/tabs'])
			}
		
		} catch(err) {
			console.dir(err)
			if(err.code === "auth/user-not-found") {
				console.log("User not found")
			}
		}
	}

	async forgotPass() {
		const alert = await this.alertCtrl.create({
		  header: 'Password dimenticata?',
		  message: 'Inserisci la tua mail per il recupero.',
		  inputs: [
			{
			  name: 'email',
			  type: 'email',
			  placeholder: 'Email'
			}
		  ],
		  buttons: [
			{
			  text: 'Cancella',
			  role: 'cancella',
			  cssClass: 'secondary',
			  handler: () => {
				console.log('Conferma Cancella');
			  }
			}, {
			  text: 'Conferma',
			  handler: async () => {
				const loader = await this.loadingCtrl.create({
				  duration: 2000
				});
	
				loader.present();
				loader.onWillDismiss().then(async l => {
				  const toast = await this.toastCtrl.create({
					showCloseButton: true,
					message: 'Email inviata con successo.',
					duration: 3000,
					position: 'bottom'
				  });
	
				  toast.present();
				});
			  }
			}
		  ]
		});
	
		await alert.present();
	  }

	returnHome() {
		this.navCtrl.navigateRoot('/home');
		}
	

}
