import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { File } from '@ionic-native/file/ngx';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

interface Contact{
  id:string;
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
  CONTACTS_FILE:string='contacts.json';

  constructor(private db:AngularFirestore,private file:File,private router:Router,private storage:NativeStorage){

    storage.getItem('email').then(data=>{console.log("mail",data)});
    
    file.checkFile(file.dataDirectory,this.CONTACTS_FILE)
        .then(exists=>{
          console.log("File already exist:",exists);
        })
        .catch(error=>{
          console.log('File '+this.CONTACTS_FILE+' created');
          return this.file.createFile(this.file.dataDirectory,this.CONTACTS_FILE,false)
                                     .then(entry=>{console.log(entry)})
                                     .catch(error=>{console.log(error)});
        });
    this.USER_ID='mavit'
    this.contactsMap=new Map<string,any>();
    this.contacts=[];
    this.readContactsFile();
    this.listenChats();
  }

  listenChats(){
    this.db.collection(this.USER_ID)
                      .snapshotChanges(['added'])
                      .subscribe(snapshot=>{
                        this.inMessage=snapshot;
                        console.log(snapshot)
                        for(let msg of this.inMessage){
                          var segments_index=msg.payload.doc._key.path.segments.length-1;
                          var operator_id=msg.payload.doc._key.path.segments[segments_index];
                          if(!this.contactsMap.has(operator_id)){
                            this.contactsMap.set(operator_id,msg.payload.doc.data());
                            this.contacts.push({id:operator_id,hasNewMessage:true});
                            this.writeContactsToFile();
                          }
                        }
                      })
  }

  listenMessages(){
    console.log(JSON.stringify)
    for(let contact of this.contacts){
      this.db.collection(this.USER_ID)
                        .doc(contact.id)
                        .collection(this.MESSAGES_ID)
                        .snapshotChanges(['added'])
                        .subscribe(snapshot=>{
                          console.log(snapshot)
                        });
    }
  }

  readContactsFile(){
    this.file.readAsText(this.file.dataDirectory,this.CONTACTS_FILE)
                        .then(content=>{
                          if(content!=''){
                            let savedContacts=JSON.parse(content);
                            this.contacts=savedContacts;
                            for(let sc of savedContacts){
                              this.contactsMap.set(sc.id,null);
                            }
                          }
                        })
                        .catch(error=>{
                          console.log(error);
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
    for(let c of this.contacts){
      if(c.id===id){
        c.hasNewMessage=false;
        break;
      }
    }
    this.writeContactsToFile();
    this.router.navigate(['/chat/'+id]);
  }
}