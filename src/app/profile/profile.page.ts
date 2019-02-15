import { Component } from '@angular/core';
//import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {

  //mainuser: AngularFirestoreDocument
	userPosts
	sub
	posts
	email: string
	profilePic: string


  constructor(/*private afs: AngularFirestore*/ private user: UserService, private router: Router, public navCtrl: NavController) {
    /*this.mainuser = afs.doc(`users/${user.getUID()}`)
    /this.sub = this.mainuser.valueChanges().subscribe(event => {
    this.posts = event.posts
    this.email = event.email
    this.profilePic = event.profilePic
    })*/
	}

  logout() {
    this.navCtrl.navigateRoot('/');
  }
}
