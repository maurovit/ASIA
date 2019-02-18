import { Component } from '@angular/core';
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
  CONTACTS_FILE:string='chat-contacts-final.json';

  LAST_MESSAGES_COLLECTION:string='/last_messages';
  LAST_MESSAGES_DOCUMENT:string="last_sended";

  SERVER_URL='http://ec2-3-87-190-68.compute-1.amazonaws.com:8080/AsiaUtils/inizializzaOperatore';

  constructor(private db:AngularFirestore,private file:File,private router:Router,private storage:NativeStorage,private http:HTTP,private notification:LocalNotifications){
    //Recupero id utente
    storage.getItem('email').then(data=>{
      this.USER_ID=data;
      console.log("ID",this.USER_ID);
      this.contactsMap=new Map<string,any>();
      this.contacts=[];

      file.checkFile(file.dataDirectory,this.CONTACTS_FILE)
        .then(exists=>{
          console.log("File already exist:",exists);
          this.readContactsFile();
        })
        .catch(error=>{
          return this.file.createFile(this.file.dataDirectory,this.CONTACTS_FILE,false)
                                     .then(entry=>{
                                      console.log('File '+this.CONTACTS_FILE+' created');
                                       this.readContactsFile();
                                      })
                                     .catch(error=>{
                                       console.log("FILE CREATION ERROR",error)
                                      });
        });
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
                        console.log("snapshot",snapshot)
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
                              var url=this.SERVER_URL+'images/'+firstSplit[2];
                              console.log("name",name);
                              console.log("description",description);
                              console.log("url",url);

                              this.contacts.push({id:operator_id,name:name,description:description,photo_url:url,hasNewMessage:true});
                              this.writeContactsToFile();
                              //Generazione della notifica
                              this.notification.schedule({
                                title: 'Eiò!',
                                text: 'Hai un nuovo messaggio da '+this.getOperatorName(operator_id),
                                trigger: {at: new Date(new Date().getTime())},
                                led: 'FFFFFF',
                                icon : 'assets/img/asia_avatar.png' //url
                              });
                            });

                            console.log("Ascoltando nuovi messaggi da "+operator_id);
                            this.listenForNewMessages(operator_id);
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
                        this.setHasNewMessages(operator_id,!newValues.isRead);
                        console.log("Salvando i cambiamenti");
                        this.writeContactsToFile();
                        //Generazione della notifica locale
                        if(!newValues.isRead){
                          this.notification.schedule({
                            title: 'Ehi!',
                            text: 'Sembra che tu abbia dei messaggi non letti',
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
  }

  getOperatorName(id:string){
    for(let c of this.contacts){
      if(c.id==id){
        return c.name;
      }
    }
  }

  readContactsFile(){
    this.file.readAsText(this.file.dataDirectory,this.CONTACTS_FILE)
                        .then(content=>{
                          if(content!=''){
                            console.log("Leggo i contatti");
                            let savedContacts=JSON.parse(content);
                            //this.contacts=savedContacts;
                            for(let sc of savedContacts){
                              this.contactsMap.set(sc.id,null);
                              console.log("Aggiunto "+sc.id+" alla mappa");
                              this.http.post(this.SERVER_URL,{'email':sc.id},{}).then(data=>{
                                var firstSplit=data.data.split("|");
                                var name=firstSplit[0];
                                var description=firstSplit[1];
                                var url=this.SERVER_URL+'images/'+firstSplit[2];

                                //Aggiunta contatto alla lista
                                this.contacts.push({id:sc.id,name:name,description:description,photo_url:url,hasNewMessage:sc.hasNewMessage});
                              })
                            }
                          }
                          //Ascolto delle chat
                          this.listenChats();

                          //Ascolto nuovi messaggi operatori
                          for(let c of this.contacts){
                            console.log("Ascoltando nuovi messaggi da "+c.id);
                            this.listenForNewMessages(c.id);
                          }
                        })
                        .catch(error=>{
                          console.log("READ ERROR",error);
                          return null;
                        })
  }

  writeContactsToFile(){
    this.file.writeFile(this.file.dataDirectory,this.CONTACTS_FILE,JSON.stringify(this.contacts),{append:false,replace:true})
                        .then(result=>{
                          console.log(result);
                        })
                        .catch(error=>{
                          console.log(error);
                          return null;
                        })
  }

  openChat(id){
    console.log("id passato",id);
    for(let c of this.contacts){
      if(c.id===id){
        c.hasNewMessage=false;
        break;
      }
    }
    this.writeContactsToFile();
    this.db.collection(this.LAST_MESSAGES_COLLECTION)
                      .doc(this.USER_ID)
                      .collection(id)
                      .doc(this.LAST_MESSAGES_DOCUMENT)
                      .update({isRead:true});

    this.router.navigate(['/chat/'+id]);
  }
}