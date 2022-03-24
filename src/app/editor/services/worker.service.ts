import { Injectable } from '@angular/core';
import { ServiceShare } from './service-share.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  worker: Worker

  workerListener = (event: MessageEvent<any>) => {
    const imageData = event.data
    // Once the image is loaded, we'll want to do some extra cleanup
    let reader = new FileReader()
    let saveFunc = this.saveDataURL
    reader.addEventListener("load", function () {
      console.log('recived message from worker',this.result);
      //@ts-ignore
      saveFunc(imageData.imageURL,this.result)
    }, false);
    let dataURL = reader.readAsDataURL(imageData.blob);
  }



  constructor(private serviceShare: ServiceShare) {
    // init worker
    this.worker = new Worker('/task-processing-worker.js')
    this.serviceShare.shareSelf('WorkerService', this)

    this.worker.addEventListener('message',this.workerListener)

  }

  saveDataURL(url:string,dataurl:string){

  }

  logToWorker(text: string) {
    this.worker.postMessage(text)
  }

  convertImgInWorker(url: string) {
    this.worker.postMessage({ meta: { action: 'loadImgInDataURL' }, data: { url } })
  }
}
