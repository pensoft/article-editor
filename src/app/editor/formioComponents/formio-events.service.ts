import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormioEventsService {

  events:Subject<{event:string,data?:any}> = new Subject();
  constructor() { }
}
