import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { EchoService } from 'ngx-laravel-echo';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

export interface notificationEvent {
  date: number,
  event: string,
  status: string,
  eventId: string,
  new: boolean,
  link?: string,
  metaData?:any,
  error?: string,
  data?: any
  docName?: string,
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
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {

    ServiceShare.AuthService.currentUser$.subscribe((user)=>{

      const token = ServiceShare.AuthService.getToken();
      this.echoService.echo.connector.options.auth.headers['Authorization'] = 'Bearer ' + token;
      if(user) {
        this.echoService.join(`task_manager:private-tasks.${user.id}`, 'public')
          .listen(`task_manager:private-tasks.${user.id}`, '.TaskCreatedEvent')
          .subscribe(data => {
            this.handleTaskUpdatesEvents(data)
          })

        this.echoService.join(`task_manager:private-tasks.${user.id}`, 'public')
          .listen(`task_manager:private-tasks.${user.id}`, '.TaskUpdateEvent')
          .subscribe(data => {
            this.handleTaskUpdatesEvents(data)
          })
      }
    })
    ServiceShare.shareSelf('NotificationsService', this)
  }

  getAllNotifications() {
    this.http.get(`${this.config.apiUrl}/event-dispatcher/tasks`).pipe(map((data: any[]) => {
      this.allNotifications
      let oldNotifictions = this.getOldNotificationsIds();

      let notificationsFromBackend: notificationEvent[] = []
      data.forEach(task => {
        let date = new Date(task.created_at).getTime();
        let event = task.type;
        let docName = this.ServiceShare.YdocService.articleData?.name;
        let status = task.status;
        let eventId = task.task_id;
        const data =  task.data?.data || null;
        let isNew = !oldNotifictions.includes(event.eventId)
        let notification: notificationEvent = {
          date, event, docName, status, eventId, new: isNew, data
        }
        if (task.type == 'pdf.export' && task.status == 'DONE') {
          notification.link = task.data.data ? task.data.data.url : task.data.url;
        }
        if (task.data?.error) {
          notification.error = task.data.error.slice(1, task.data.error.length - 1)
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
        docName: this.ServiceShare.YdocService.articleData.name,
        data: eventData.task.data?.data || null,
        date: date.getTime(),
        eventId: eventData.task.task_id,
        status: eventData.task.status,
        new: isNew
      }
      if (eventData.task.status == 'DONE') {
        let url = eventData.task.data.data.url;
        task.link = url;
      }else if(eventData.task.status == 'FAILED'){
        task.metaData = [eventData.task.data.error]
        task.link = 'open pdf render errors'
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
      if(event.link == 'open jats render errors'||event.link == 'open pdf render errors'){
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
