import { Injectable } from '@angular/core';
import { FiguresControllerService } from './figures-controller.service';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { YdocService } from './ydoc.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceShare {

  ProsemirrorEditorsService?:ProsemirrorEditorsService
  YdocService?:YdocService
  FiguresControllerService?:FiguresControllerService

  constructor() { 

  }

  shareSelf(serviceName:string,serviceInstance:any){
    //@ts-ignore
    this[serviceName] = serviceInstance
  }
}
