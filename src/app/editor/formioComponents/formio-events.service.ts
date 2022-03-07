import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormioEventsService {

  figureData : any
  events:Subject<{event:string,data?:any}> = new Subject();

  constructor() {
    this.events.subscribe((event:any)=>{
      if(event.event == 'save-data-for-submit'){
        this.figureData = event.data
      }
    })
  }
}
