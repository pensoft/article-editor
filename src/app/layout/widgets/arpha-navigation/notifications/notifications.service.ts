import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { environment } from '@env';
import { uuidv4 } from 'lib0/random';
import { EchoService } from 'ngx-laravel-echo';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
const EVENTSURL = environment.apiUrl + '/event-dispatcher'

export interface notificationEvent {
  date: number, event: string, status: string, eventId: string, new: boolean, link?: string ,metaData?:any
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  notificationsBehaviorSubject = new ReplaySubject<notificationEvent[]>();

  localNotifications: notificationEvent[] = []
  allNotifications: notificationEvent[] = []

  getOldNotificationsIds(): string[] {
    let oldNotifications = sessionStorage.getItem('oldevents');
    if (oldNotifications) {
    return JSON.parse(oldNotifications)
    } else {
      return []
    }
  }

  addLocalNotification(event:notificationEvent){
    this.localNotifications.push(event);
    this.passNotifications();
  }

  setEventAsOld(eventid: string) {
    let oldNotifications: any = sessionStorage.getItem('oldevents');
    let oldevents: string[]
    if (!oldNotifications) {
      oldevents = [];
    } else {
      oldevents = JSON.parse(oldNotifications)
    }
    if (!oldevents.includes(eventid)) {
      oldevents.push(eventid);
    }
    sessionStorage.setItem('oldevents', JSON.stringify(oldevents))
    setTimeout(() => {
      this.passNotifications()
    }, 10)
  }

  constructor(
    private ServiceShare: ServiceShare,
    private http: HttpClient,
    private readonly echoService: EchoService,
  ) {
    this.echoService.join('task_manager:tasks', 'public')
      .listen('task_manager:tasks', '.TaskCreatedEvent')
      .subscribe(data => { this.handleTaskUpdatesEvents(data) })

    this.echoService.join('task_manager:tasks', 'public')
      .listen('task_manager:tasks', '.TaskUpdateEvent')
      .subscribe(data => { this.handleTaskUpdatesEvents(data) })

    ServiceShare.shareSelf('NotificationsService', this)
  }

  getAllNotifications() {
    this.http.get(EVENTSURL + '/tasks').pipe(map((data: any[]) => {
      this.allNotifications
      let oldNotifictions = this.getOldNotificationsIds();

      let notificationsFromBackend: notificationEvent[] = []
      data.forEach(task => {
        let date = new Date(task.created_at).getTime();
        let event = task.type;
        let status = task.status;
        let eventId = task.task_id;
        let isNew = !oldNotifictions.includes(event.eventId)
        let notification: notificationEvent = {
          date, event, status, eventId, new: isNew
        }
        if (task.type == 'pdf.export' && task.status == 'DONE') {
          notification.link = task.data.data.url
        }
        notificationsFromBackend.push(notification)
      })
      this.allNotifications = notificationsFromBackend
      this.passNotifications();
    })).subscribe()
  }

  handleTaskUpdatesEvents(eventData) {
    if (eventData.task.type == "pdf.export") {
      let date = new Date(eventData.task.created_at);
      let isNew = !this.getOldNotificationsIds().includes(eventData.task.task_id)
      let task: notificationEvent = {
        event: eventData.task.type,
        date: date.getTime(),
        eventId: eventData.task.task_id,
        status: eventData.task.status,
        new: isNew
      }
      if (eventData.task.status == 'DONE') {
        let url = eventData.task.data.data.url;
        task.link = url;
      }
      if (this.allNotifications.findIndex((n) => n.eventId == task.eventId)!=-1) {
        this.updateEventData(task)
      } else {
        this.newNotificationEvent(task)
      }
    }
  }
  viewNotification(event: notificationEvent) {
    if (event.link) {
      if(event.link == 'open jats render errors'){
        this.ServiceShare.openJatsErrorsDialog(event.metaData);
      }else{
        window.open(event.link)
      }
      /* this.http.get(event.downloadlink,{
        responseType:'arraybuffer',
      }).subscribe((data)=>{
        var blob=new Blob([data], {type:"application/pdf"});
        const fileObjectURL = URL.createObjectURL(blob);
      }) */
    }
    let eventid = event.eventId;
    this.setEventAsOld(eventid);
  }

  passNotifications() {
    let oldNotifications = this.getOldNotificationsIds()
    this.allNotifications.forEach((notification) => {
      if (oldNotifications.includes(notification.eventId)) {
        notification.new = false;
      } else {
        notification.new = true;
      }
    })
    this.localNotifications.forEach((notification) => {
      if (oldNotifications.includes(notification.eventId)) {
        notification.new = false;
      } else {
        notification.new = true;
      }
    })
    let allNotificationArr = [...this.allNotifications,...this.localNotifications];
    this.notificationsBehaviorSubject.next(allNotificationArr);
  }

  updateEventData(event: notificationEvent) {
    this.allNotifications = this.allNotifications.map((task) => {
      if (task.eventId == event.eventId) {
        return event
      }
      return task
    })
    this.passNotifications();
  }

  newNotificationEvent(event: notificationEvent) {
    this.allNotifications.push(event);
    this.passNotifications();
  }
}
