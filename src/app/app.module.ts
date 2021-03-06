import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { Keyboard } from '@ionic-native/keyboard/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { File } from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';

import { HttpClientModule } from '@angular/common/http';
 
import { Camera } from '@ionic-native/Camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
 
import { NativeStorage} from '@ionic-native/native-storage/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { FileTransfer } from'@ionic-native/file-transfer/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { AngularFireAuthModule } from '@angular/fire/auth'
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { HttpModule } from '@angular/http';
import { Base64 } from '@ionic-native/base64/ngx';



@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(),
    AppRoutingModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebase),
    IonicStorageModule.forRoot(),
    AngularFireAuthModule,
    HttpModule
    ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Keyboard,
    SpeechRecognition,
    TextToSpeech,
    AngularFirestore,
    HTTP,
    File,
    Camera,
    WebView,
    FilePath,
    NativeStorage,
    FileTransfer,
    FileChooser,
    LocalNotifications,
    UserService,
    AuthService,
    Base64
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
