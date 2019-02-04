import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-community',
  templateUrl: 'community.page.html',
  styleUrls: ['community.page.scss']
})
export class CommunityPage{

  senderName:string;
  senderSurname:string;
  
  inMessage:Array<any>;
  allMessages:Map<string,any>;
  
  outMessage = { 
    owner:'', 
    date:null, 
    text:'' 
  };

  CHATS_COLLECTION:string='/chats';
  SENDER_ID:string;
  RECEIVER_ID:string;

  
  constructor(private db:AngularFirestore){
    this.senderName='Mauro';
    this.senderSurname='Vitale';
    this.SENDER_ID='mavit'
    this.RECEIVER_ID='operatore'
    this.allMessages=new Map<string,any>();
    this.listenMessage();
    this.sendMessage('Hello world')
  }

  sendMessage(text){
    this.outMessage.owner=this.senderName+' '+this.senderSurname;
    this.outMessage.date=new Date();
    this.outMessage.text=text;
    this.db.collection(this.CHATS_COLLECTION)
                      .doc(this.SENDER_ID)
                      .collection(this.RECEIVER_ID)
                      .add(this.outMessage);
  }

  listenMessage(){
    this.db.collection(this.CHATS_COLLECTION)
                      .doc(this.SENDER_ID)
                      .collection(this.RECEIVER_ID)
                      .snapshotChanges(['added'])
                      .subscribe(snapshot=>{
                        this.inMessage=snapshot;
                        for(let msg of this.inMessage){
                          var segments_index=msg.payload.doc._key.path.segments.length-1;
                          var document_key=msg.payload.doc._key.path.segments[segments_index];
                          if(!this.allMessages.has(document_key)){
                            this.allMessages.set(document_key,msg.payload.doc.data());
                            //this.allMessages.forEach((value:any,key:string)=>{
                            //  console.log("Key",key);
                            //  console.log("Value",value);
                            //})
                          }
                        }
                      })
  }
}