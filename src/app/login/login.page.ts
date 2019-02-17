import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import{HTTP} from'@ionic-native/http/ngx';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	private urlBase:string = "http://192.168.1.79:8080/AsiaUtils/images/";
	serverUrl:string='http://192.168.1.79:8080/AsiaUtils/inizializzaOperatore'
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
		private storage: NativeStorage,
		private http: HTTP
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
	
	completeLogin(){
		this.login().then(()=>{
			this.http.post(this.serverUrl,{'email':this.email},{}).then(data => {
				var firstSplit = data.data.split("|");
				var name = firstSplit[0];
				var description = firstSplit[1];
				var url = firstSplit[2];
			
				this.storage.setItem("descrizione",description);
				this.storage.setItem("nominativo",name);
				if(url!=null && url!=undefined && url!=''){
					this.storage.setItem('url',this.urlBase+url);
				}
			}).catch(error => {

			})
		})
	}

  async login() {
		const { email, password } = this
		try {
			// kind of a hack. 
			const res = await this.afAuth.auth.signInWithEmailAndPassword(email, password)
			this.email = email;
			if(res.user) {
				this.user.setUser({
					email,
					uid: res.user.uid
				})
				this.storage.setItem("idUtente",res.user.uid);
				this.storage.setItem("email", email);	
			}
				this.router.navigate(['/tabs'])
		} catch(err) {
			console.dir(err)
			if(err.code === "auth/user-not-found") {
				console.log("User not found")
				this.presentToast("Utente non esistente");
			}
		}
	}

	async presentToast(text) {
    const toast = await this.toastCtrl.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
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
