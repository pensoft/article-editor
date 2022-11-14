import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DEFAULT_CONFIG } from '@angular/flex-layout';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { environment } from '@env';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
const EVENTSURL = environment.apiUrl + '/event-dispatcher'
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  notificationsBehaviorSubject = new ReplaySubject(1);

  dummyNotifications:any = [
    {event:'Dummy notification 1,',eventId:'event1',date:1667385763430},
    {event:'Dummy notification 2 second notification,',eventId:'event2',date:1667385764969},
    {event:'This is Dummy notification 3 if u click is will gust go as viewed.',eventId:'event3',date:1667385754969},
    {event:'Dummy notification 4.',eventId:'event4',date:1667385664969},
  ]

  getOldNotificationsIds():string[]{
    let oldNotifications = sessionStorage.getItem('oldevents');
    if(oldNotifications){
      return JSON.parse(oldNotifications)
    }else{
      return []
    }
  }

  setEventAsOld(eventid:string){
    let oldNotifications:any = sessionStorage.getItem('oldevents');
    let oldevents : string[]
    if(!oldNotifications){
      oldevents = [];
    }else{
      oldevents = JSON.parse(oldNotifications)
    }
    if(!oldevents.includes(eventid)){
      oldevents.push(eventid);
    }
    sessionStorage.setItem('oldevents',JSON.stringify(oldevents))
    setTimeout(()=>{
      this.getAllNotifications()
    },10)
  }

  constructor(
    private ServiceShare:ServiceShare,
    private http:HttpClient
    ) {
    ServiceShare.shareSelf('NotificationsService',this)
  }

  viewNotification(event){
    if(event.downloadlonk){
      this.http.get(event.downloadlonk,{
        responseType:'arraybuffer',
      }).subscribe((data)=>{
        var blob=new Blob([data], {type:"application/pdf"});
        const fileObjectURL = URL.createObjectURL(blob);
        window.open(fileObjectURL)
      })
    }
    let eventid = event.eventId;
    this.setEventAsOld(eventid);
  }

  getAllNotifications(){

    this.http.get(EVENTSURL+'/tasks').pipe(map((data)=>{
      data = this.dummyNotifications
      let oldNotifictions = this.getOldNotificationsIds();
      if(oldNotifictions.length>0){
        //@ts-ignore
        data.forEach((event)=>{
          if(oldNotifictions.includes(event.eventId)){
            event.new = false
          }else{
            event.new = true;
          }
        })
      }else{
        //@ts-ignore
        data.forEach((event)=>{
          event.new = true;
        })
      }
      this.dummyNotifications = data
      this.notificationsBehaviorSubject.next(data);
    })).subscribe()
  }

  newNotificationEvent(event:any){
    this.dummyNotifications.push(event);
    this.getAllNotifications()
  }
}
