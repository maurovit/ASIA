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

  private asiaMessage:string;

  private textMessage;
  private vocalInput:boolean;
  private lastMessageOwner:string;

  private isSpeechRecognizerAvailable:boolean;
  private speechRecognizerOptions;
  private lastPartialSentence:string;

  private PARTIAL_SENTENCE_ID="show-partial";
  private PARTIAL_SENTENCE_CONTAINER_ID="show-partial-container";

  
  CHARS_SINGLE_LINE=37;
  FONT_SIZE=12;
  LINE_HEIGHT=20;

  constructor(public platform: Platform, private speechRecognizer: SpeechRecognition, private speaker:TextToSpeech,private ngZone:NgZone){
      platform.ready().then(() => {
        ApiAIPromises.init({
          clientAccessToken: "0789d5a8570149b1a121d840a89436ea"
        }).then(result => console.log(result));
      });

  }


 AsiaSpeaksThroughSecretCommands(message: string):boolean{
    //Dentro questo metodo devono essere gestiti tutti i secretCommands
    //Per adesso può andare un secret command per volta
    var preCommandMessage = ''
    var commandMessage = ''
    var postCommandMessage = ''
    if(message.includes('<slower>') && message.includes('</slower>')){
      //convenzione: il secretCommand si riferisce alla string che segue il secret command
       var alteredMessage = message.split('<slower>');
       preCommandMessage = alteredMessage[0];
       commandMessage = alteredMessage[1].split('</slower>')[0];
       postCommandMessage = alteredMessage[1].split('</slower>')[1];

        this.speaker.speak({
          text: preCommandMessage,
          locale: 'it-IT',
          rate: 1
         }).then(() => this.speaker.speak({
          text: commandMessage,
          locale: 'it-IT',
          rate: 0.83
         })).then(()=>this.speaker.speak({
          text: postCommandMessage,
          locale: 'it-IT',
          rate: 1
         }))     
       return true;
    }else if(message.includes('<eng>') && message.includes('</eng>')){
      //convenzione: il secretCommand si riferisce alla string che segue il secret command
      var alteredMessage = message.split('<eng>');
      preCommandMessage = alteredMessage[0];
      commandMessage = alteredMessage[1].split('</eng>')[0];
      postCommandMessage = alteredMessage[1].split('</eng>')[1];

       this.speaker.speak({
         text: preCommandMessage,
         locale: 'it-IT',
         rate: 1
        }).then(() => this.speaker.speak({
         text: commandMessage,
         locale: 'en-GB',
         rate: 0.9
        })).then(()=>this.speaker.speak({
         text: postCommandMessage,
         locale: 'it-IT',
         rate: 1
        }))     
      return true;
    }else
      return false;
    //qui andrebbere else if per tutte le altre condizioni

  }


  ask(question) {
    ApiAIPromises.requestText({
      query: question
    })
    .then(({result: {fulfillment: {speech}}}) => {
       this.ngZone.run(()=> {
        var textSpeech = '';
        var audioSpeech = '';
        //valutare se utilizzare questa variabile
        var isSplitted = false;
        if(speech!=''){
          //Quando la risposta di Asia divisa in parlato e testo
          var splitted = speech.split("|"); 
          if(splitted.length == 2){
            audioSpeech = splitted[0];
            textSpeech = splitted[1];
          }else{
            audioSpeech = speech;
            textSpeech = speech;
          }
          var div_chat=document.getElementById("chat");
          var bubble_wrap= div_chat.firstChild;
          var messageElement= this.createMessageElement(textSpeech,false,'asia');
          setTimeout(function(){
            bubble_wrap.appendChild(messageElement);
            //scroll
            div_chat.scrollTop = div_chat.scrollHeight;
          },100);
          //proprietario dell'ulltimo messaggio
          this.lastMessageOwner='asia';
        }

        if(!this.AsiaSpeaksThroughSecretCommands(audioSpeech))
          this.asiaSpeaksDefault(audioSpeech);
        this.asiaMessage = textSpeech;
       });
    })
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
    this.asiaSpeaksDefault('Ciao, il mio nome è Asia!')
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
            this.ask(matches[0]);
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
      var messageElement= this.createMessageElement(this.textMessage,false,'user');

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
    var messageElement=this.createMessageElement(this.lastPartialSentence,true,'user');
    setTimeout(function(){
      bubble_wrap.appendChild(messageElement);
      div_chat.scrollTop = div_chat.scrollHeight;
    },100);
    this.lastMessageOwner='user';
    this.textMessage="";
  }

  createMessageElement(text:string,speech2Text:boolean,owner:string){
    var initRow=document.createElement("ion-row");
    var msgContainer=document.createElement("div");

    if(owner=='user'){
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

    } else if(owner=='asia'){
      msgContainer.setAttribute("class","message-container");
      var ionGrid=document.createElement("ion-grid");
      var ionRow=document.createElement("ion-row");
      var avatarCol=document.createElement("ion-col");
      avatarCol.setAttribute("size","2");
      var ionAvatar=document.createElement("ion-avatar");
      ionAvatar.setAttribute("class","responsive-img");
      var imgAvatar=document.createElement("img");
      imgAvatar.setAttribute("src","assets/img/asia_avatar.png");

      ionAvatar.appendChild(imgAvatar);
      if(this.lastMessageOwner==='user')
        avatarCol.appendChild(ionAvatar);
      
      var msgCol=document.createElement("ion-col");
      var height=this.getChatBubbleHeight(text);
      msgCol.setAttribute("size","10");
      msgCol.setAttribute("style","padding-left: 5px;height:"+(height+20)+"px;");
      var asiaMsgDiv=document.createElement("div");
      var firstReplyClass=this.lastMessageOwner==='user'?"first-asia-message":"";
      asiaMsgDiv.setAttribute("class","bubble say "+firstReplyClass);
      var asiaMsgSpan=document.createElement("span");
      asiaMsgSpan.setAttribute("class","bubble-content");
      asiaMsgSpan.innerText=text;

      asiaMsgDiv.appendChild(asiaMsgSpan);
      msgCol.appendChild(asiaMsgDiv);

      ionRow.appendChild(avatarCol);
      ionRow.appendChild(msgCol);
      ionGrid.appendChild(ionRow);
      msgContainer.appendChild(ionGrid);
    }
    ionRow.appendChild(msgContainer);
    return ionRow;
  }

  asiaSpeaksDefault(message: string):void{
    this.speaker.speak({
      text: message,
      locale: 'it-IT',
      rate: 0.95
     });
  }

  getChatBubbleHeight(text:string){
    console.log("LENGTH "+text.length)
    var rows=Math.ceil(text.length/this.CHARS_SINGLE_LINE);
    console.log("ROWS "+rows)
    var dim=(rows*this.FONT_SIZE)+(rows*(this.LINE_HEIGHT/2));
    return dim;
  }
}
