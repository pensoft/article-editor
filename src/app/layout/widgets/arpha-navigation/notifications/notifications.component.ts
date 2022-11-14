import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { NotificationsService } from './notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements AfterViewInit {

  showNotifications = false;
  lastNNotifications:any = [];
  NeventsNoShow = 3;
  NumberofNewNotifications = 0;
  constructor(
    private serviceShare:ServiceShare,
    private router:Router
    ) { }

  ngAfterViewInit(): void {
    this.serviceShare.NotificationsService.notificationsBehaviorSubject.subscribe((notifications:any[])=>{
      this.NumberofNewNotifications = 0
      notifications.forEach((event)=>{if(event.new){this.NumberofNewNotifications++;}})
      this.lastNNotifications = notifications.sort((a,b)=>b.date-a.date).slice(0,this.NeventsNoShow)
    })
    this.serviceShare.NotificationsService.getAllNotifications();
  }

  openAllNotificationsPage(){
    this.router.navigate(['all-notifications']);
    this.close()
  }

  count = 0;
  close(){
    if(this.showNotifications && this.count>0){
      this.count = -1;
      this.showNotifications = !this.showNotifications
    }
    this.count++;
  }

  viewNotification(event){
    this.close()
    this.serviceShare.NotificationsService.viewNotification(event)
  }

  showhideNotifications(){
    this.showNotifications = !this.showNotifications
  }

}
