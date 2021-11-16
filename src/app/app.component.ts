import { Component } from '@angular/core';
import {environment} from '../environments/environment'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  version = environment.VERSION;
  build_number = environment.BUILD_NUMBER;
  constructor() {
    navigator.serviceWorker.ready.then(function (registration) {
      //@ts-ignore
      return registration.sync.register('sendFormData')
    }).catch(function () {
      // system was unable to register for a sync,
      // this could be an OS-level restriction
      console.log('sync registration failed')
    });
  }
}
