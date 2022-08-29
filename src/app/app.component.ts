import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import {environment} from '../environments/environment'
import { ProsemirrorEditorsService } from './editor/services/prosemirror-editors.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  version = environment.VERSION;
  build_number = environment.BUILD_NUMBER;
  @ViewChild('globalSpinner', { read: ElementRef })globalSpinner?: ElementRef;

  constructor(private prosemirrorEditorsService:ProsemirrorEditorsService) {
    navigator.serviceWorker.ready.then(function (registration) {
      //@ts-ignore
      return registration.sync.register('sendFormData')
    }).catch(function () {
      // system was unable to register for a sync,
      // this could be an OS-level restriction
      console.error('sync registration failed')
    });
  }
  ngAfterViewInit(): void {
    this.prosemirrorEditorsService.setSpinner(this.globalSpinner.nativeElement)
  }
}
