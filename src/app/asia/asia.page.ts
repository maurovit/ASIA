import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

import { SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { NavController, Platform, AlertController} from '@ionic/angular';
import { File} from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import { ActionSheetController, ToastController, LoadingController } from '@ionic/angular';
import { FileTransfer, FileTransferObject, FileUploadOptions } from'@ionic-native/file-transfer/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { Router } from '@angular/router';
import { v } from '@angular/core/src/render3';
import { Base64 } from '@ionic-native/base64/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { NativeStorage } from '@ionic-native/native-storage/ngx';


declare var ApiAIPromises: any;

@Component({
  selector: 'app-home',
  templateUrl: 'asia.page.html',
  styleUrls: ['asia.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AsiaPage implements OnInit 
{

  public asiaFirstString: string = 'Ciao, il mio nome è Asia 😄';
  //Le frasi che Asia usa per contattare periodicamente l'utente
  AsiaEntranceSentences : string[] = ['E un po che non ti sento, che mi racconti?',
   'Hey ti stavo pensando e cosi ti ho contattato, come va?', 'Ti va di fare due chiacchiere con me?'];
  private buttonIcon:string = "volume-off";


  private warningLevel: number;

  private asiaMessage:string;

  private textMessage;
  private vocalInput:boolean = false;
  private lastMessageOwner:string;

  private isSpeechRecognizerAvailable:boolean;
  private speechRecognizerOptions;
  private lastPartialSentence:string;

  private PARTIAL_SENTENCE_ID="show-partial";

  private asiaSpeaks=false;

  USER_MAIL:string;
  NOTIFICATIONS_ID='/notifications';

  constructor(public platform: Platform, private speechRecognizer: SpeechRecognition,
     private speaker:TextToSpeech, private ngZone:NgZone,
     public navCtrl: NavController,private file:File, private http : HTTP, private alertController: AlertController,
     private camera: Camera, private webview: WebView, private actionSheetController: ActionSheetController,
     private toastController: ToastController, private plt: Platform, private loadingController: LoadingController,
     private ref: ChangeDetectorRef, private fP: FilePath, private fT: FileTransfer,
     public localNotifications: LocalNotifications, private router:Router, private b64:Base64, 
     private storage:NativeStorage,private db:AngularFirestore
     ){

      storage.getItem('email').then(data=>{
        this.USER_MAIL=data;
      })

      platform.ready().then(() => {
        ApiAIPromises.init({
          clientAccessToken: "0789d5a8570149b1a121d840a89436ea"
        }).then(result => console.log(result));
      });   
      //Si inizializza il warning level   
      this.warningLevel = 0;

      this.platform.pause.subscribe(()=>{
        this.storage.getItem('notificationPermission')
          .then(data => {
                //Si calcola l'indice della frase di Asia
            let random_number = Math.random() * 2;
            var index = Math.floor(random_number);
            this.asiaFirstString = this.AsiaEntranceSentences[index];
            this.localNotifications.schedule({
            title: 'Asia dice',
            text: this.AsiaEntranceSentences[index],
            trigger: {at: new Date(new Date().getTime() + 10000)},
            //trigger: { every: { minute: 34 }},
            led: 'FFFFFF',
            sound: this.platform.is('android')? 'file://sound.mp3': 'file://beep.caf',
            icon : 'assets/img/asia_avatar.png' //url
            });
            }, error => {  
           
             });
        
       
      });

      this.platform.resume.subscribe(()=>{
        this.localNotifications.cancel(this.localNotifications.getIds);
      });

      this.localNotifications.on('click').subscribe(()=>{
        this.localNotifications.cancel(this.localNotifications.getIds);
      })

  }

  changeSpeakerSettings(){
    if(this.buttonIcon == "volume-off"){
      this.buttonIcon = "volume-high";
      this.asiaSpeaks = true;
    }else{
      this.buttonIcon = "volume-off";
      this.asiaSpeaks = false;
    }
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }
 
  async presentToast(text) {
    const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
  }

 
takePicture() {
    var options: CameraOptions = {
        quality: 50,
        sourceType: this.camera.PictureSourceType.CAMERA,
        saveToPhotoAlbum: true,
        correctOrientation: true,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType:this.camera.EncodingType.JPEG,
        mediaType:this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(options).then(imagePath => {
            var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
            var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
            //lettura img in base64 e aggiunta alla chat
            this.b64.encodeFile(imagePath).then((base64File:string)=>{
              console.log(base64File);
              var imgElement=this.createImageBubble(base64File)
              var div_chat=document.getElementById("asia-chat");
              setTimeout(function(){
                window.location.hash="";
                div_chat.appendChild(imgElement);
                //scroll
                window.location.hash="#focusable"
                },100);
            this.lastMessageOwner='user';
            })
            
    })
}

createFileName() {
  var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
  return newFileName;
}

copyFileToLocalDir(namePath, currentName, newFileName) {
  this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      let filePath = this.file.dataDirectory + newFileName;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
          name: newFileName,
          path: resPath,
          filePath: filePath
      };

      this.uploadImageData(newEntry);
  }, error => {
      this.presentToast('Error while storing file.');  
  });
}

async uploadImageData(entry) {
  var imgEntry = entry;
  
  var keyAPIAsia = '';
  const uriBase = 'http://ec2-3-87-190-68.compute-1.amazonaws.com:8080/AsiaUtils/PictureEmotionDetection';
  
  const fileTransfer: FileTransferObject = this.fT.create();
  fileTransfer.upload(imgEntry.filePath, uriBase, {}).then((data) => {
  var speech = '';
  if(data.response == "Angry")
    speech = 'Cosè quella faccia? qualcuno ti ha fatto arrabbiare? | Cosa è quella faccia? Qualcuno ti ha fatto arrabbiare? 😟';
  else if(data.response == "Contempt" )
    speech = 'Che bello! Sei contento | Che bello, sei contento 😄';
  else if(data.response == "Disgust")
    speech = 'Sembri disgustato, spero non sia per qualcosa che ho fatto | Sembri disgustato, spero non sia per qualcosa che ho fatto 😅';
  else if(data.response == "Fear" )
    speech = 'Sembri impaurito, non mi fare preoccupare. Contatto qualcuno? | Sembri impaurito, non mi fare preoccupare. Contatto qualcuno?';
  else if(data.response == "Happiness" )
    speech = 'Ah, finalmente vedo una persona felice | Ah, finalmente vedo una persona felice 😄';
  else if(data.response == "Neutral" )
    speech = 'Troppo neutrale. Fammi un bel sorriso | Troppo neutrale, fammi un bel sorriso! 😄';
  else if(data.response == "Sadness" )
    speech = "Cosa c'è che non va? Sembri triste. Tutto bene? ";
  else if(data.response == "Surprise" )
    speech = "Cosè, la mia intelligenza ti sorprende? | Cos'è? La mia intelligenza ti sorprende?😏";
  else  
    speech = "Non riesco ad accedere alla zona cognitiva del mio cervello! Hai attivato la connessione ad internet?"
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
        var div_chat=document.getElementById("asia-chat");
        var messageElement= this.createMessageElement(textSpeech,false,'asia');
        setTimeout(function(){
          window.location.hash="";
          div_chat.appendChild(messageElement);
          //scroll
          window.location.hash="#focusable"
        },100);
        //proprietario dell'ulltimo messaggio
        this.lastMessageOwner='asia';
      }
      
        if(!this.AsiaSpeaksThroughSecretCommands(audioSpeech)){
          if(this.asiaSpeaks){
            this.asiaSpeaksDefault(audioSpeech);
          }
        }
      this.asiaMessage = textSpeech;
     });
    
 }, (err) => {
  var speech = "Non riesco ad accedere alla zona cognitiva del mio cervello! Hai attivato la connessione ad internet?"
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
      var div_chat=document.getElementById("asia-chat");
      var messageElement= this.createMessageElement(textSpeech,false,'asia');
      setTimeout(function(){
        window.location.hash="";
        div_chat.appendChild(messageElement);
        //scroll
        window.location.hash="#focusable"
      },100);
      //proprietario dell'ulltimo messaggio
      this.lastMessageOwner='asia';
    }
    if(!this.AsiaSpeaksThroughSecretCommands(audioSpeech)){
          if(this.asiaSpeaks){
            this.asiaSpeaksDefault(audioSpeech);
          }
        }
    this.asiaMessage = textSpeech;
   });

    })  
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

       if(this.asiaSpeaks){
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
        }
       return true;
    }else if(message.includes('<eng>') && message.includes('</eng>')){
      //convenzione: il secretCommand si riferisce alla string che segue il secret command
      var alteredMessage = message.split('<eng>');
      preCommandMessage = alteredMessage[0];
      commandMessage = alteredMessage[1].split('</eng>')[0];
      postCommandMessage = alteredMessage[1].split('</eng>')[1];

      if(this.asiaSpeaks){
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
        }   
      return true;
    }else if(message.includes('<critical>') && message.includes('</critical>')){
      //convenzione: il secretCommand si riferisce alla string che segue il secret command
      var alteredMessage = message.split('<critical>');
      preCommandMessage = alteredMessage[0];
      commandMessage = alteredMessage[1].split('</critical>')[0];
      postCommandMessage = alteredMessage[1].split('</critical>')[1];
      if(this.asiaSpeaks){
        this.speaker.speak({
          text: preCommandMessage,
          locale: 'it-IT',
          rate: 1
          }).then(()=>{
            this.speaker.speak({
              text: postCommandMessage,
              locale: 'it-IT',
              rate: 1
          })})
        }
      this.warningLevel = 0;
      this.presentToast("Livello critico");
      //AZZERA WRNING LEVEL E CONTATTA OPERATORE
      this.db.collection(this.NOTIFICATIONS_ID)
                              .doc(this.USER_MAIL)
                              .set({});
     
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
          var div_chat=document.getElementById("asia-chat");
          var messageElement= this.createMessageElement(textSpeech,false,'asia');
          setTimeout(function(){
            window.location.hash="";
            div_chat.appendChild(messageElement);
            //scroll
            window.location.hash="#focusable"
          },100);
          //proprietario dell'ulltimo messaggio
          this.lastMessageOwner='asia';
        }

        if(!this.AsiaSpeaksThroughSecretCommands(audioSpeech)){
          if(this.asiaSpeaks){
            this.asiaSpeaksDefault(audioSpeech);
          }
        }

        this.asiaMessage = textSpeech;
       });
    })
  }

  ngOnInit(){
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
    if(this.asiaSpeaks)
      this.asiaSpeaksDefault('Ciao, il mio nome è Asia!');  
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
    var speechBubbleContainer=document.getElementById(this.PARTIAL_SENTENCE_ID);
    if(speechBubbleContainer!=null)
      speechBubbleContainer.remove();
    if(this.isSpeechRecognizerAvailable){
      this.speechRecognizer.stopListening();
      console.log("Speech Detection Stopped");
    }
  }

  async TextSentimentAnalysis(messaggio){
      var msg = messaggio;
      var APIAsiaKey = '';
      var url = "http://ec2-3-87-190-68.compute-1.amazonaws.com:8080/AsiaUtils/TextSentimentAnalysis";

      this.http.post(url, {
        "body" : msg
      }, {
        'Content-Type': 'application/json'
      }).then(data => {
        //Controllo per decide se incrementare il warningLevel
        var value = data.data;
        
        if(value < 0.4){
          this.warningLevel++;
          this.presentToast("DEMO: warning level aumentato");
        }
        if(this.warningLevel == 8){
          this.db.collection(this.NOTIFICATIONS_ID)
                              .doc(this.USER_MAIL)
                              .set({});
        }
        })
      .catch(error => {
          console.log(JSON.stringify(error));
      })
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
      var div_chat=document.getElementById("asia-chat");
      var messageElement= this.createMessageElement(this.textMessage,false,'user');

      //metodoAsincronoPerIlSentimentAnalysis
      this.TextSentimentAnalysis(this.textMessage);
      //Domanda ad Asia
      this.ask(this.textMessage);

      setTimeout(function(){
        window.location.hash="";
        div_chat.appendChild(messageElement);
        //scroll
        window.location.hash="#focusable"
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
    var div_chat=document.getElementById("asia-chat");
    var messageElement=this.createMessageElement(this.lastPartialSentence,true,'user');
    setTimeout(function(){
        window.location.hash="";
        div_chat.appendChild(messageElement);
        //scroll
        window.location.hash="#focusable"
    },100);
    this.lastMessageOwner='user';
    this.textMessage="";
  }

  createMessageElement(text:string,speech2Text:boolean,owner:string){
    var msgContainer=document.createElement("div");
    var lastMessage=document.getElementById("focusable");
    if(lastMessage!=null)
      lastMessage.removeAttribute("id");

    if(owner=='user'){
      //Check del proprieterio dell'ultimo messaggio
      var firstReplyClass=this.lastMessageOwner==='asia'?"first":"last";
      msgContainer.setAttribute("class","bubble recipient "+firstReplyClass+" animated fadeIn");
      msgContainer.setAttribute("style","margin-right:5px;");
      msgContainer.setAttribute("id","focusable");
      msgContainer.innerText=text;
      if(speech2Text){
        //id per il controllo della speech bubble
        msgContainer.setAttribute("id",this.PARTIAL_SENTENCE_ID);
      }
    } else if(owner=='asia'){
      var firstReplyClass=this.lastMessageOwner==='user'?"first":"last";
      msgContainer.setAttribute("class","bubble sender "+firstReplyClass+" animated fadeIn");
      msgContainer.setAttribute("style","margin-left:5px;");  
      msgContainer.setAttribute("id","focusable");
      msgContainer.innerText=text;
    }

    return msgContainer;
  }

  createImageBubble(path:any){
    var msgContainer=document.createElement("div");
    var lastMessage=document.getElementById("focusable");
    if(lastMessage!=null)
      lastMessage.removeAttribute("id");
    var firstReplyClass=this.lastMessageOwner==='asia'?"first":"last";
    msgContainer.setAttribute("class","bubble recipient "+firstReplyClass+" animated fadeIn");
    msgContainer.setAttribute("style","margin-left: 5px;padding: 0;overflow: hidden;");
    msgContainer.setAttribute("id","focusable");
    var img=document.createElement("img");
    img.setAttribute("src",path);
    img.setAttribute("style","display:block;");
    msgContainer.appendChild(img);
    
    return msgContainer;
  }

  asiaSpeaksDefault(message: string):void{
    this.speaker.speak({
      text: message,
      locale: 'it-IT',
      rate: 0.95
     });
  }
}
