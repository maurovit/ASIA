import { Component, OnInit } from '@angular/core';
import { Bubbles } from "chat-bubble/component/Bubbles.js";
import { ViewEncapsulation } from '@angular/core';

import { SpeechRecognition} from '@ionic-native/speech-recognition/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'asia.page.html',
  styleUrls: ['asia.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AsiaPage implements OnInit 
{
  private textMessage;
  private vocalInput:boolean;
  private lastMessageOwner:string;

  private isSpeechRecognizerAvailable:boolean;
  private speechRecognizerOptions;

  constructor(private speechRecognizer: SpeechRecognition){
  }

  ngOnInit(){
    const chatWindow = new Bubbles(document.getElementById('chat'), "chatWindow");
    this.textMessage="";
    this.vocalInput=false;
    this.lastMessageOwner="asia";
    this.isSpeechRecognizerAvailable=false;
    //Check per l'attivazione di SpeechRecognition
    this.speechRecognizer.isRecognitionAvailable().then((available:boolean)=>{
      console.log("Speech Recognition Available:"+available);
      this.speechRecognizer.hasPermission().then((hasPermission:boolean)=>{
        console.log("Voice Recording Permission Status:"+hasPermission);
        if(available&&!hasPermission){
          this.speechRecognizer.requestPermission().then(()=>{
            console.log("Voice Recording Permission Granted");
            this.isSpeechRecognizerAvailable=true;
            this.speechRecognizerOptions={language:'it-IT',showPopup:false};
          },
            ()=>console.log("Voice Recording Permission Denied"));
        } else if(available&&hasPermission){
          this.isSpeechRecognizerAvailable=true;
          this.speechRecognizerOptions={language:'it-IT',showPopup:false};
        }
      });
    });
  }

  switchToVocal():void{
    this.vocalInput=true;
    if(this.isSpeechRecognizerAvailable){
      console.log("Start Speech Detection....");
      this.speechRecognizer.startListening(this.speechRecognizerOptions).subscribe(
        (matches: string[]) => console.log(matches),
        (onerror) => console.log('error:', onerror));
    }
  }

  switchToTextual():void{
    this.vocalInput=false;
    if(this.isSpeechRecognizerAvailable){
      this.speechRecognizer.stopListening();
      console.log("Speech Detection Stopped");
    }
  }

  sendMessage(){
    var send_btn=document.getElementById("send-btn-img");
    //Aggiunta dell'animazione al bottone
    send_btn.classList.add("animated");
    send_btn.classList.add("pulse");

    this.textMessage=this.textMessage.trim();
    if(this.textMessage!=''){
      var div_chat=document.getElementById("chat");
      var bubble_wrap= div_chat.firstChild;
      var messageElement= this.createMessageElement(this.textMessage);
      setTimeout(function(){
        bubble_wrap.appendChild(messageElement);
        //scroll
        div_chat.scrollTop = div_chat.scrollHeight;
      },100);
      //proprietario dell'ulltimo messaggio
      this.lastMessageOwner='user';
      this.textMessage="";
    }

    //Thread per la rimozione dell'animazione quando il messaggio
    //è stato inviato
    setTimeout(function(){
      send_btn.classList.remove("animated");
      send_btn.classList.remove("pulse");
    },1000);
  }

  createMessageElement(text:string){
    var msgContainer=document.createElement("div");
    console.log(this.lastMessageOwner)
    var firstReplyClass=this.lastMessageOwner==='asia'?"first-reply":"";
    msgContainer.setAttribute("class","message-container  reply-container "+firstReplyClass+" animated fadeIn");
    msgContainer.setAttribute("style","margin-right: 17px;")
    var bubble_reply=document.createElement("div");
    bubble_reply.setAttribute("class","bubble reply");
    var bubble_content=document.createElement("span");
    bubble_content.setAttribute("class","bubble-content");
    var text_container=document.createElement("span");
    text_container.setAttribute("class","bubble-button bubble-pick");
    text_container.innerText=text;

    bubble_content.appendChild(text_container);
    bubble_reply.appendChild(bubble_content);
    msgContainer.appendChild(bubble_reply);

    return msgContainer;
  }
}
