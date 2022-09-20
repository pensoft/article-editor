import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import {environment} from '../environments/environment'
import { EnforcerService } from './casbin/services/enforcer.service';
import { AuthService } from './core/services/auth.service';
import { ProsemirrorEditorsService } from './editor/services/prosemirror-editors.service';
import { ServiceShare } from './editor/services/service-share.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  version = environment.VERSION;
  build_number = environment.BUILD_NUMBER;
  @ViewChild('globalSpinner', { read: ElementRef })globalSpinner?: ElementRef;

  constructor(private prosemirrorEditorsService:ProsemirrorEditorsService,
    private serviceShare:ServiceShare,
    private authService:AuthService,
    private enfprcer:EnforcerService
    ) {
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
    this.serviceShare.AuthService.getUserInfo().subscribe()
    this.prosemirrorEditorsService.setSpinner(this.globalSpinner.nativeElement)
  }
}
