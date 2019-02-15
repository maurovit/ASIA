import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {NativeStorage} from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(public navCtrl: NavController, private router: Router,
    private storage: NativeStorage) { 
      /*
      if(storage.getItem("idUtente")!=null)
        this.router.navigate(['/tabs'])*/
  }

  ngOnInit() {
  }

  signIn() {
  	this.router.navigate(['login']);
  }

  goToRegister() {
    this.navCtrl.navigateRoot('/register');
  }
}
