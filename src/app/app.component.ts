import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    navigator.serviceWorker.ready.then(function (registration) {
      return registration.sync.register('sendFormData')
    }).catch(function () {
      // system was unable to register for a sync,
      // this could be an OS-level restriction
      console.log('sync registration failed')
    });
  }
}
