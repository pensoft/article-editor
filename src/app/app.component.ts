import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment'
import { CasbinGlobalObjectsService } from './casbin/services/casbin-global-objects.service';
import { EnforcerService } from './casbin/services/enforcer.service';
import { AuthService } from './core/services/auth.service';
import { ProsemirrorEditorsService } from './editor/services/prosemirror-editors.service';
import { ServiceShare } from './editor/services/service-share.service';
import { NotificationsService } from './layout/widgets/arpha-navigation/notifications/notifications.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  version = environment.VERSION;
  build_number = environment.BUILD_NUMBER;
  @ViewChild('globalSpinner', { read: ElementRef })globalSpinner?: ElementRef;

  constructor(
    private prosemirrorEditorsService:ProsemirrorEditorsService,
    private serviceShare:ServiceShare,
    private authService:AuthService,
    private enforcer:EnforcerService,
    private NotificationsService:NotificationsService,
    private casbinGlobalObjectService:CasbinGlobalObjectsService,
    private router: Router,
    ) {
      //loadMathConfig()
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
    /*this.serviceShare.AuthService.getUserInfo().subscribe({
      next:(data)=>{

      },
      error:(err)=>{
        localStorage.removeItem('token')
        this.router.navigate(['login']);
        console.error(err);
      }
    })*/
    this.prosemirrorEditorsService.setSpinner(this.globalSpinner.nativeElement)
  }
}
