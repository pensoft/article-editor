import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AllnotificationsComponent } from '../allnotifications/allnotifications.component';
import { notificationEvent, NotificationsService } from './notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements AfterViewInit {

  showNotifications = false;
  lastNNotifications:notificationEvent[] = [];
  NeventsNoShow = 3;
  NumberofNewNotifications = 0;
  displayedColumns: string[] = ['status', 'event', 'date'];
  constructor(
    private serviceShare:ServiceShare,
    private changeDetection:ChangeDetectorRef,
    public dialog: MatDialog,
    ) { }

  ngAfterViewInit(): void {
    console.log(this.serviceShare);
    this.serviceShare.NotificationsService?.notificationsBehaviorSubject.subscribe((notifications:notificationEvent[])=>{
      this.NumberofNewNotifications = 0
      notifications.forEach((event)=>{if(event.new){this.NumberofNewNotifications++;}})
      let filteredNew = notifications.filter(event=>event.new);
      this.lastNNotifications = filteredNew.sort((a,b)=>b.date-a.date).slice(0,this.NeventsNoShow)
      this.changeDetection.detectChanges()
    })
    this.serviceShare.NotificationsService?.getAllNotifications()
  }

  openAllNotificationsDialog(){
    this.dialog.open(AllnotificationsComponent)
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

  getName(element) {
    return element.data?.article_title || element.event;
  }
}
