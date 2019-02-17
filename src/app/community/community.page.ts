import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community',
  templateUrl: 'community.page.html',
  styleUrls: ['community.page.scss']
})
export class CommunityPage 
{
  inMessage:Array<any>;
  mailsMap:Map<string,any>;
  emList:string[];
  
  EMERGENCY_ROOT='/notifications'
  OPERATOR_ID:string;

  constructor(private db:AngularFirestore,private storage:NativeStorage, private router:Router)
  {
    storage.getItem('email').then(data=>{
      this.OPERATOR_ID=data;
    });
    this.mailsMap=new Map<string,any>();
    this.emList=[];
    this.listenEmergencies();
  }

  listenEmergencies(){
    this.db.collection(this.EMERGENCY_ROOT)
                      .snapshotChanges(['added'])
                      .subscribe(snapshot=>{
                        this.inMessage=snapshot;
                        for(let msg of this.inMessage){
                          var segments_index=msg.payload.doc._key.path.segments.length-1;
                          var user_id=msg.payload.doc._key.path.segments[segments_index];
                          if(!this.mailsMap.has(user_id)){
                            this.mailsMap.set(user_id,null);
                            this.emList.push(user_id);
                            console.log(user_id);
                          }
                        }
                      });
  }

  openChat(id){
    this.router.navigate(['/chat/'+id]);
  }
}
