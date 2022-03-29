import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ServiceShare } from './service-share.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  worker: Worker

  saveImageDataURL(data:any){
    let reader = new FileReader()
    let saveFunc = this.saveDataURL
    reader.addEventListener("load", function () {
      //@ts-ignore
      saveFunc(data.imageURL,this.result)
    }, false);
    reader.readAsDataURL(data.blob);
  }

  processMessageResponse(data:any){
    console.log(data);
    if(data.data&&data.data.meta.action == 'loadImgAsDataURL'){
      this.saveImageDataURL(data)
    }
  }

  workerListener = (event: MessageEvent<any>) => {
    this.processMessageResponse(event.data)
    return

  }

  responseSubject:Subject<any>

  constructor(private serviceShare: ServiceShare) {
    this.responseSubject = new Subject()
    this.worker = new Worker('/task-processing-worker.js')
    this.serviceShare.shareSelf('WorkerService', this)
    this.worker.addEventListener('message',this.workerListener)
  }

  saveDataURL = (url:string,dataurl:string)=>{
    console.log(url,dataurl);
    let dataURLObj = this.serviceShare.YdocService!.figuresMap!.get('ArticleFiguresDataURLS');
    dataURLObj[url] = dataurl;
    this.serviceShare.YdocService!.figuresMap!.set('ArticleFiguresDataURLS',dataURLObj);
  }

  logToWorker(text: string) {
    this.worker.postMessage(text)
  }

  convertImgInWorker(url: string) {
    let dataURLObj = this.serviceShare.YdocService!.figuresMap!.get('ArticleFiguresDataURLS');
    if(!dataURLObj[url]){
      this.worker.postMessage({ meta: { action: 'loadImgAsDataURL' }, data: { url } })
    }else{
      console.log(dataURLObj);
    }
  }
}
