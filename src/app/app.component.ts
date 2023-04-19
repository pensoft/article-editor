import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ProsemirrorEditorsService } from './editor/services/prosemirror-editors.service';
import { NotificationsService } from './layout/widgets/arpha-navigation/notifications/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('globalSpinner', { read: ElementRef }) globalSpinner?: ElementRef;

  constructor(
    // TODO: find a way to initialize the service in other way
    private NotificationsService: NotificationsService,
    private prosemirrorEditorsService:ProsemirrorEditorsService,
    ) {
      //loadMathConfig()
      if(navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(function (registration) {
          //@ts-ignore
          return registration.sync.register('sendFormData')
        }).catch(function () {
          // system was unable to register for a sync,
          // this could be an OS-level restriction
          console.error('sync registration failed')
        });
      }
    
  }
  ngAfterViewInit(): void {
    this.prosemirrorEditorsService.setSpinner(this.globalSpinner.nativeElement)
  }
}
