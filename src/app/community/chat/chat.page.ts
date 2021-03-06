import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ViewEncapsulation } from '@angular/core';

interface Message
{
  id:string;
  owner:string;
  date:Date;
  text:string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChatPage {
  textMessage:string;
  lastMessageOwner:string;
  
  inMessage:Array<any>;
  messagesMap:Map<string,any>;
  orderedMessages:Message[];

  USER_ID:string;
  OPERATOR_ID:string;
  MESSAGES_ID:string='messages';

  LAST_MESSAGES_COLLECTION:string='/last_messages';
  LAST_MESSAGES_DOCUMENT:string="last_sended";

  subscription;

  constructor(private db:AngularFirestore,private route:ActivatedRoute, private router:Router,private storage:NativeStorage){

    this.storage.getItem('email').then(data=>{
      this.USER_ID=data;
      this.OPERATOR_ID=this.route.snapshot.paramMap.get("operator_id");
      this.lastMessageOwner=this.OPERATOR_ID;
      this.textMessage='';
    
      this.messagesMap=new Map<string,any>();
      this.orderedMessages=[];
      this.listenMessage();
    })
  }

  sendMessage(){
    this.textMessage=this.textMessage.trim();
    if(this.textMessage!=''){
      let outMessage={
        owner:this.USER_ID,
        date:new Date(),
        text:this.textMessage
      };
      this.db.collection('/'+this.USER_ID)
                        .doc(this.OPERATOR_ID)
                        .collection(this.MESSAGES_ID)
                        .add(outMessage)
                        .then(ref=>{console.log(ref)});
      this.textMessage='';
    }
  }

  listenMessage(){
    //ordina i valori per il campo date
    this.subscription=this.db.collection('/'+this.USER_ID)
                      .doc(this.OPERATOR_ID)
                      .collection(this.MESSAGES_ID,ref=>ref.orderBy('date'))
                      .snapshotChanges(['added'])
                      .subscribe(snapshot=>{
                        this.inMessage=snapshot;
                        for(let msg of this.inMessage){
                          //Recupero della chiave
                          var segments_index=msg.payload.doc._key.path.segments.length-1;
                          var document_key=msg.payload.doc._key.path.segments[segments_index];
                          //Se è un messaggio non visto in precedenza, viene aggiunto
                          //alla mappa ed alla chat
                          if(!this.messagesMap.has(document_key)){
                            //Aggiunta id messaggio alla mappa
                            this.messagesMap.set(document_key,msg.payload.doc.data());
                            console.log("Nuovo messaggio",msg.payload.doc.data().text,msg.payload.doc.data().date.toDate())
                            let newMessage:Message;
                            newMessage={
                              id:document_key,
                              owner:msg.payload.doc.data().owner,
                              date:msg.payload.doc.data().date.toDate(),
                              text:msg.payload.doc.data().text
                            };
                            this.orderedMessages.push(newMessage);
                            //Aggiunta bubble alla chat
                            var section_chat=document.getElementById("operator-chat");
                            var msgBubble=this.createMessageElement(newMessage.text,newMessage.owner);
                            window.location.hash='';
                            section_chat.appendChild(msgBubble);
                            window.location.hash='#focusable';
                            this.lastMessageOwner=newMessage.owner;

                            //Segnalazione lettura messaggio
                            if(newMessage.owner==this.OPERATOR_ID){
                              this.db.collection(this.LAST_MESSAGES_COLLECTION)
                                                .doc(this.USER_ID)
                                                .collection(this.OPERATOR_ID)
                                                .doc(this.LAST_MESSAGES_DOCUMENT)
                                                .update({isRead:true});
                            }
                          }
                        }
                      });
  }

  addBubble(){
    var send_btn=document.getElementById("send-btn-img");
    //Aggiunta dell'animazione al bottone
    if(send_btn!=null){
      send_btn.classList.add("animated");
      send_btn.classList.add("pulse");
    }

    this.textMessage=this.textMessage.trim();
    if(this.textMessage!=''){
      var section_chat=document.getElementById("operator-chat");
      var messageElement= this.createMessageElement(this.textMessage,this.USER_ID);

      setTimeout(function(){
        window.location.hash="";
        section_chat.appendChild(messageElement);
        //scroll
        window.location.hash="#focusable"
      },100);
      //proprietario dell'ulltimo messaggio
      this.lastMessageOwner=this.USER_ID;
    }

    //Thread per la rimozione dell'animazione quando il messaggio
    //è stato inviato
    if(send_btn!=null)
      setTimeout(function(){
        send_btn.classList.remove("animated");
        send_btn.classList.remove("pulse");
      },1000);

      this.sendMessage();
      this.textMessage="";
  }

  createMessageElement(text:string,owner:string){
    var msgContainer=document.createElement("div");
    var lastMessage=document.getElementById("focusable");
    if(lastMessage!=null)
      lastMessage.removeAttribute("id");

    if(owner==this.USER_ID){
      //Check del proprieterio dell'ultimo messaggio
      var firstReplyClass=this.lastMessageOwner===this.OPERATOR_ID?"first":"last";
      msgContainer.setAttribute("class","bubble recipient "+firstReplyClass+" animated fadeIn");
      msgContainer.setAttribute("style","margin-right:5px;");
      msgContainer.setAttribute("id","focusable");
      msgContainer.innerText=text;
    } else if(owner==this.OPERATOR_ID){
      var firstReplyClass=this.lastMessageOwner===this.USER_ID?"first":"last";
      msgContainer.setAttribute("class","bubble sender "+firstReplyClass+" animated fadeIn");
      msgContainer.setAttribute("style","margin-left:5px;");  
      msgContainer.setAttribute("id","focusable");
      msgContainer.innerText=text;
    }

    return msgContainer;
  }

  goBack(){
    this.subscription.unsubscribe();
    this.router.navigate(["/tabs"]);
  }
}