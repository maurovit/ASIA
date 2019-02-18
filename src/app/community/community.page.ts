import { Component, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { File } from '@ionic-native/file/ngx';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

interface Contact{
  id:string;
  name:string;
  description:string;
  photo_url:string;
  hasNewMessage:boolean;
}

@Component({
  selector: 'app-community',
  templateUrl: 'community.page.html',
  styleUrls: ['community.page.scss']
})
export class CommunityPage{
  
  inMessage:Array<any>;
  contactsMap:Map<string,any>;
  contacts:Contact[];

  USER_ID:string;
  MESSAGES_ID:string='messages';

  LAST_MESSAGES_COLLECTION:string='/last_messages';
  LAST_MESSAGES_DOCUMENT:string="last_sended";

  SERVER_URL='http://ec2-3-87-190-68.compute-1.amazonaws.com:8080/AsiaUtils/inizializzaOperatore';

  constructor(private db:AngularFirestore,private file:File,private router:Router,private storage:NativeStorage,private http:HTTP,private notification:LocalNotifications){
    //Recupero id utente
    storage.getItem('email').then(data=>{
      this.USER_ID=data;
      this.contactsMap=new Map<string,any>();
      this.contacts=[];
      this.listenChats();
    }).catch(err=>{
      console.log("IONIC NATIVE STORAGE ERROR",err);
      return;
    });
  }

  listenChats(){
    this.db.collection(this.USER_ID)
                      .stateChanges()
                      .subscribe(snapshot=>{
                        this.inMessage=snapshot;
                        for(let msg of this.inMessage){
                          var segments_index=msg.payload.doc._key.path.segments.length-1;
                          var operator_id=msg.payload.doc._key.path.segments[segments_index];
                          if(!this.contactsMap.has(operator_id)){
                            this.contactsMap.set(operator_id,msg.payload.doc.data());
                            //Recupero dei dati dal server
                            this.http.post(this.SERVER_URL,{'email':operator_id},{}).then(data=>{
                              var firstSplit=data.data.split("|");
                              var name=firstSplit[0];
                              var description=firstSplit[1];
                              var id=firstSplit[2];
                              this.contacts.push({id:id,name:name,description:description,photo_url:'',hasNewMessage:false});
                              //Ascolto nuovi messaggi
                              console.log("Ascoltando nuovi messaggi da "+id);
                              this.listenForNewMessages(id);
                            });
                          }
                        }
                      })
  }

  listenForNewMessages(operator_id){
    this.db.collection(this.LAST_MESSAGES_COLLECTION)
                      .doc(this.USER_ID)
                      .collection(operator_id)
                      .doc(this.LAST_MESSAGES_DOCUMENT)
                      .valueChanges()
                      .subscribe(changes=>{
                        var newValues=JSON.parse(JSON.stringify(changes));
                        console.log("Cambiamento in "+operator_id,newValues);
                        console.log(operator_id,""+(!newValues.isRead));
                        this.setHasNewMessages(operator_id,!newValues.isRead);
                        //Generazione della notifica locale
                        if(!newValues.isRead){
                          this.notification.schedule({
                            title: 'Ehi!',
                            text: 'Hai un nuovo messaggio da '+this.getOperatorName(operator_id),
                            trigger: {at: new Date(new Date().getTime())},
                            led: 'FFFFFF',
                            icon : 'assets/img/asia_avatar.png' //url
                          })
                        }
                      })
  }

  setHasNewMessages(id:string,hnm:boolean){
    for(let c of this.contacts){
      if(c.id==id){
        c.hasNewMessage=hnm;
        break;
      }
    }

    console.log("NEW CONTACTS",this.contacts)
  }

  getOperatorName(id:string){
    for(let c of this.contacts){
      if(c.id==id){
        return c.name;
      }
    }
  }


  openChat(id){
    for(let c of this.contacts){
      if(c.id===id){
        c.hasNewMessage=false;
        break;
      }
    }
    //Segnalazione lettura messaggio
    this.db.collection(this.LAST_MESSAGES_COLLECTION)
                      .doc(this.USER_ID)
                      .collection(id)
                      .doc(this.LAST_MESSAGES_DOCUMENT)
                      .update({isRead:true});
    //Navigazione presso chat
    this.router.navigate(['/chat/'+id]);
  }
}