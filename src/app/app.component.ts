import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public content: Object = {
    "type": "doc",
    "content": []
};

  constructor() {
    navigator.serviceWorker.ready.then(function(swRegistration) {
        //@ts-ignore
        return swRegistration.sync.register('fetch-news', {
            minInterval: 1
        });
    });
  }
  ngOnInit(): void {
  }
    
}
