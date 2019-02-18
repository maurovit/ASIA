import { Component } from '@angular/core';
//import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import { IonicStorageModule } from '@ionic/storage';
import {HTTP} from '@ionic-native/http/ngx';
import {Camera , CameraOptions, PictureSourceType} from '@ionic-native/Camera/ngx';
import {FileTransfer, FileTransferObject, FileUploadOptions} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import {AsiaPage} from '../asia/asia.page';
 

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  private nominativo: string;
  private email: string;
  private descrizione: string;

  

  private urlImmagine:string;
  private urlBase:string = "http://192.168.1.79:8080/AsiaUtils/images/";

  constructor(private user: UserService, private router: Router,
     public navCtrl: NavController, private storage : NativeStorage,
     private http:HTTP, private toastController: ToastController,
     private cameraProfile:Camera, private fTProfile:FileTransfer, private fileProfile:File,
     private webviewProfile:WebView, private file:File, private localNotifications:LocalNotifications) {
       
      this.storage.getItem('email')
          .then(data => {
            this.email = data;
        }, error => {  
          this.email = "no email available";       
      });

      this.storage.getItem('nominativo')
          .then(data => {
            this.nominativo = data;
        }, error => {  
          this.nominativo = "";       
      });

      this.storage.getItem('descrizione')
          .then(data => {
            this.descrizione = data;
        }, error => {  
          this.descrizione = "";       
      });
    
      this.storage.getItem('url')
          .then(data => {
            this.urlImmagine = data;
        }, error => {  
          this.urlImmagine = "assets/img/asia_avatar.png"; 
      });
	}

  logout() {
    this.navCtrl.navigateRoot('/');
    //clear login history
    this.storage.clear();
  }

  async updateServer(){
    
    
    this.storage.setItem("descrizione",this.descrizione);
    this.storage.setItem("nominativo",this.nominativo);
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
  }

  takeProfilePicture() {
    var options: CameraOptions = {
        quality: 15,
        sourceType: this.cameraProfile.PictureSourceType.CAMERA,
        saveToPhotoAlbum: true,
        correctOrientation: true,
        destinationType: this.cameraProfile.DestinationType.FILE_URI,
        encodingType: this.cameraProfile.EncodingType.JPEG,
        mediaType: this.cameraProfile.MediaType.PICTURE
    };
    this.cameraProfile.getPicture(options).then((imageData) => {
            var currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
            var correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);     

            this.file.readAsDataURL(correctPath,currentName).then(
              file64 => {
                
                let fileWithoutExtension = ('' + file64 + '').replace(/^data:image\/(png|jpg);base64,/, '');
                
                this.urlImmagine = fileWithoutExtension;
                this.storage.setItem("url", this.urlImmagine);
              }).catch(err => {
              this.presentToast("errore nel formato immagine");
            });      
    })
}


}
