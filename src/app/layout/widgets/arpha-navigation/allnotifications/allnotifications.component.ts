import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  selector: 'app-allnotifications',
  templateUrl: './allnotifications.component.html',
  styleUrls: ['./allnotifications.component.scss']
})
export class AllnotificationsComponent implements AfterViewInit {
  displayedColumns: string[] = ['status','event','document','date',];
  allNotifications = []

  constructor(
    private serviceShare:ServiceShare,
    private changeDetection:ChangeDetectorRef,
    private dialogRef: MatDialogRef<AllnotificationsComponent>,
    ) { }

  ngAfterViewInit(): void {
    this.serviceShare.NotificationsService.notificationsBehaviorSubject.subscribe((notifications:any[])=>{
      this.allNotifications = notifications.sort((a,b)=>b.date-a.date);
      this.changeDetection.detectChanges()

    })
    this.serviceShare.NotificationsService.getAllNotifications();
  }

  viewNotification(event){
    this.serviceShare.NotificationsService.viewNotification(event);
  }

  closeDialog() {
    this.dialogRef.close()
  }

  getName(element) {
    return element.data?.article_title || element.docName;
  }

  getEvent(element) {
    return element.event;
  }
}
