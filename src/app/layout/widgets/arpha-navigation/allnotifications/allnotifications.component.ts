import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  selector: 'app-allnotifications',
  templateUrl: './allnotifications.component.html',
  styleUrls: ['./allnotifications.component.scss']
})
export class AllnotificationsComponent implements AfterViewInit {
  displayedColumns: string[] = ['event', 'date',];
  allNotifications = []

  constructor(private serviceShare:ServiceShare) { }

  ngAfterViewInit(): void {
    this.serviceShare.NotificationsService.notificationsBehaviorSubject.subscribe((notifications:any[])=>{
      this.allNotifications = notifications.sort((a,b)=>b.date-a.date)
    })
    this.serviceShare.NotificationsService.getAllNotifications();
  }

  viewNotification(event){
    this.serviceShare.NotificationsService.viewNotification(event);
  }

}
