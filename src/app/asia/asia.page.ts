import { Component, OnInit, NgZone } from '@angular/core';
import { Bubbles } from "chat-bubble/component/Bubbles.js";
import { ViewEncapsulation } from '@angular/core';

import { SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { Platform } from '@ionic/angular'
import { send } from 'q';

declare var ApiAIPromises: any;

@Component({
  selector: 'app-home',
  templateUrl: 'asia.page.html',
  styleUrls: ['asia.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AsiaPage implements OnInit 
{

  private asiaMessage;

  private textMessage;
  private vocalInput:boolean;
  private lastMessageOwner:string;

  private isSpeechRecognizerAvailable:boolean;
  private speechRecognizerOptions;
  private lastPartialSentence:string;

  private PARTIAL_SENTENCE_ID="show-partial";
  private PARTIAL_SENTENCE_CONTAINER_ID="show-partial-container";

<<<<<<< HEAD
  constructor(public platform: Platform, private speechRecognizer: SpeechRecognition, private speaker:TextToSpeech,private ngZone:NgZone){
      platform.ready().then(() => {
        ApiAIPromises.init({
          clientAccessToken: "683c8c9cbe1a418280e759b457994b91"
        }).then(result => console.log(result));
      });

  }

  ask(question) {
    ApiAIPromises.requestText({
      query: question
    })
    .then(({result: {fulfillment: {speech}}}) => {
       this.ngZone.run(()=> {

        if(speech!=''){
          this.lastMessageOwner='asia';
          var div_chat=document.getElementById("chat");
          var bubble_wrap= div_chat.firstChild;
          var messageElement= this.createMessageElement(speech,false);
    
          this.ask(this.textMessage);
    
          setTimeout(function(){
            bubble_wrap.appendChild(messageElement);
            //scroll
            div_chat.scrollTop = div_chat.scrollHeight;
          },100);
          //proprietario dell'ulltimo messaggio

        }
         this.asiaSpeak(speech);
         this.asiaMessage = speech;
       });
    })
=======
  constructor(private speechRecognizer: SpeechRecognition, private speaker:TextToSpeech,private ngZone:NgZone){
    //To speak
    /*
    this.speaker.speak({
    text: 'Ciao, sono Asia! Sono qui per ascoltarti ed aiutarti.',
    locale: 'it-IT',
    rate: 1
   });
   */
>>>>>>> d0eb6d03595702cc759e48a2598bd05de0269c83
  }

  ngOnInit(){
    const chatWindow = new Bubbles(document.getElementById('chat'), "chatWindow");
    this.textMessage="";
    this.vocalInput=false;
    this.lastMessageOwner="asia";
    this.isSpeechRecognizerAvailable=false;
    this.lastPartialSentence=". . .";
    //Check permessi per l'attivazione di SpeechRecognition
    this.speechRecognizer.isRecognitionAvailable().then((available:boolean)=>{
      console.log("Speech Recognition Available:"+available);
      this.speechRecognizer.hasPermission().then((hasPermission:boolean)=>{
        console.log("Voice Recording Permission Status:"+hasPermission);
        if(available&&!hasPermission){
          this.speechRecognizer.requestPermission().then(()=>{
            console.log("Voice Recording Permission Granted");
            this.isSpeechRecognizerAvailable=true;
            this.speechRecognizerOptions={language:'it-IT',showPopup:false,showPartial:true};
          },
            ()=>console.log("Voice Recording Permission Denied"));
        } else if(available&&hasPermission){
          this.isSpeechRecognizerAvailable=true;
          this.speechRecognizerOptions={language:'it-IT',showPopup:false,showPartial:true};
        }
      });
    });
  }

  ngAfterViewInit(): void{
    this.asiaSpeak('Ciao, il mio nome è Asia!')
  }
  

  switchToVocal():void{
    this.vocalInput=true;
    this.createSpeech2TextBubble();
    if(this.isSpeechRecognizerAvailable){
      console.log("Start Speech Detection....");
      this.speechRecognizer.startListening(this.speechRecognizerOptions).subscribe(
        (matches: string[]) => {
          //Se la frase parziale ottenuta è uguale alla precedente
          //l'ascolto è terminato
          if(matches[0]===this.lastPartialSentence){
            //Necessario per entrare in una zona Angular
            //ed aggiornare il front-end da un thread come subscribe
            this.ngZone.run(()=>{
              console.log("NgZone running...");
              //Rimozione id dalla bubble di speech
              document.getElementById(this.PARTIAL_SENTENCE_CONTAINER_ID).removeAttribute("id");
              document.getElementById(this.PARTIAL_SENTENCE_ID).removeAttribute("id");
              //Passaggio alla modalità testuale ad ascolto finito
              this.switchToTextual();
            })
            console.log("Listening Ended");
          }else{
            //Modifica del testo parziale nella speech bubble
            var speechBubble=document.getElementById(this.PARTIAL_SENTENCE_ID);
            speechBubble.innerText=matches[0];
            this.lastPartialSentence=matches[0];
          }
        },
        (onerror) => console.log('Error:', onerror));
    }
  }

  switchToTextual():void{
    this.vocalInput=false;
    this.lastPartialSentence=". . .";
    //Se l'ascolto è stato interrotto viene rimossa
    //la speech bubble temporanea
    var speechBubbleContainer=document.getElementById(this.PARTIAL_SENTENCE_CONTAINER_ID);
    if(speechBubbleContainer!=null)
      speechBubbleContainer.remove();
    if(this.isSpeechRecognizerAvailable){
      this.speechRecognizer.stopListening();
      console.log("Speech Detection Stopped");
    }
  }

  sendMessage(){
    var send_btn=document.getElementById("send-btn-img");
    //Aggiunta dell'animazione al bottone
    if(send_btn!=null){
      send_btn.classList.add("animated");
      send_btn.classList.add("pulse");
    }

    this.textMessage=this.textMessage.trim();
    if(this.textMessage!=''){
      var div_chat=document.getElementById("chat");
      var bubble_wrap= div_chat.firstChild;
      var messageElement= this.createMessageElement(this.textMessage,false);

      //Domanda ad Asia
      this.ask(this.textMessage);

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
    if(send_btn!=null)
      setTimeout(function(){
        send_btn.classList.remove("animated");
        send_btn.classList.remove("pulse");
      },1000);

    
        
  }

  createSpeech2TextBubble(){
    var div_chat=document.getElementById("chat");
    var bubble_wrap= div_chat.firstChild;
    var messageElement=this.createMessageElement(this.lastPartialSentence,true);
    setTimeout(function(){
      bubble_wrap.appendChild(messageElement);
      div_chat.scrollTop = div_chat.scrollHeight;
    },100);
    this.lastMessageOwner='user';
    this.textMessage="";
  }

  createMessageElement(text:string,speech2Text:boolean){
    var msgContainer=document.createElement("div");
    //Check del proprieterio dell'ultimo messaggio
    var firstReplyClass=this.lastMessageOwner==='asia'?"first-reply":"";
    msgContainer.setAttribute("class","message-container  reply-container "+firstReplyClass+" animated fadeIn");
    msgContainer.setAttribute("style","margin-right: 17px;")
    var bubble_reply=document.createElement("div");
    bubble_reply.setAttribute("class","bubble reply");
    var bubble_content=document.createElement("span");
    bubble_content.setAttribute("class","bubble-content");
    var text_container=document.createElement("span");
    text_container.setAttribute("class","bubble-button bubble-pick");
    if(speech2Text){
      //ids per il controllo della speech bubble
      msgContainer.setAttribute("id",this.PARTIAL_SENTENCE_CONTAINER_ID);
      text_container.setAttribute("id",this.PARTIAL_SENTENCE_ID);
    }
    text_container.innerText=text;

    bubble_content.appendChild(text_container);
    bubble_reply.appendChild(bubble_content);
    msgContainer.appendChild(bubble_reply);

    return msgContainer;
  }

  asiaSpeak(message: string):void{
    this.speaker.speak({
      text: message,
      locale: 'it-IT',
      rate: 1
     });
  }
}
