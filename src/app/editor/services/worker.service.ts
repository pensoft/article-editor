import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ServiceShare } from './service-share.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  workerScript:any;
  notifySubject = new Subject()

  saveImageDataURL(data: any) {
    let reader = new FileReader()
    let saveFunc = this.saveDataURL
    reader.addEventListener("load", function () {
      //@ts-ignore
      saveFunc(data.imageURL, this.result)
    }, false);
    reader.readAsDataURL(data.blob);
  }

  processMessageResponse(data: any) {
    if (data.data && data.data.meta.action == 'loadImgAsDataURL') {
      this.saveImageDataURL(data)
    }else if (data.data && data.data.meta.action == 'loadAndReturnInSubject' ){

    }
  }

  workerListener = (event: MessageEvent<any>) => {
    this.processMessageResponse(event.data)
    return

  }

  responseSubject: Subject<any>

  constructor(private serviceShare: ServiceShare, private _http: HttpClient) {

/*     let workerStart = `var window = self;
    window.Node = function(){};
    Object.prototype.addEventListener = function(){};
    window.Node.prototype.contains=function(){};
    self.history = {};
    var document = {
      readyState: 'complete',
      cookie: '',
      querySelector: function () {},
      createElement: function () {
        return {
          pathname: '',
          setAttribute: function () {}
        };
      }
    };`;
    const workerRest = `self.addEventListener('message', function(e) {
      if(e.data){
        var allRequests = e.data.map(function(item) {
          return axios(item);
        });
        axios.all(allRequests)
        .then(axios.spread(function () {
          postMessage(JSON.stringify(arguments));
        }))
        .catch(function (error) {
          postMessage(JSON.stringify(error));
        });
      }
  });
  `;
    this.workerScript = window.URL.createObjectURL(new Blob([workerStart,
      document.querySelector('#workerPromiseAjax')!.textContent!, workerRest]));
    this.worker = new Worker(this.workerScript); */
    this.responseSubject = new Subject()
    this.serviceShare.shareSelf('WorkerService', this)
    //this.worker.addEventListener('message', this.workerListener)
  }

  saveDataURL = (url: string, dataurl: string) => {
    let dataURLObj = this.serviceShare.YdocService!.figuresMap!.get('ArticleFiguresDataURLS');
    dataURLObj[url] = dataurl;
    this.serviceShare.YdocService!.figuresMap!.set('ArticleFiguresDataURLS', dataURLObj);
  }

  logToWorker(text: string) {
    //this.worker.postMessage(text)
  }

  convertImgInWorker(url: string) {
    let dataURLObj = this.serviceShare.YdocService!.figuresMap!.get('ArticleFiguresDataURLS');
    //this.worker.postMessage({ meta: { action: 'loadImgAsDataURL' }, data: { url, environment: environment.production } })
    if (!dataURLObj[url] || dataURLObj[url] == 'data:' || dataURLObj[url] == '') {
    } else {
   }
  }

  convertImgAngNotifySubject(url:string){

  }
}
