import { Injectable } from '@angular/core';
import { ServiceShare } from './service-share.service';

@Injectable({
  providedIn: 'root'
})
export class PmDialogSessionService {

  addedImages: any = {};
  deletedImages: string[] = [];
  hasDialogSession = false;

  addedImagesSubSession: any = {};
  deletedImagesSubSession: string[] = [];
  hasDialogSubSession = false;

  constructor(private sharedService: ServiceShare) {
    this.sharedService.shareSelf('PmDialogSessionService', this)
  }

  createSession() {
    this.hasDialogSession = true;
    this.createMathImgSession();
  }

  createSubsession() {
    this.hasDialogSubSession = true;
    this.createMathImgSubSession();
  }

  endSubsession(save: boolean) {
    if (save) {
      Object.keys(this.addedImagesSubSession).forEach((key) => {
        this.addedImages[key] = this.addedImagesSubSession[key]
      })
      this.deletedImagesSubSession.forEach((key) => {
        this.deletedImages.push(key)
      })
    }
    this.hasDialogSubSession = false;
  }

  addElement(id: string, dataURL: string) {
    let session = this.inSession();
    if (session == 'subsession') {
      this.addedImagesSubSession[id] = dataURL;
    } else if (session == 'session') {
      this.addedImages[id] = dataURL
    }
  }

  removeElement(id: string) {
    let session = this.inSession();
    if (session == 'subsession') {
      this.deletedImagesSubSession.push(id)
    } else if (session == 'session') {
      this.deletedImages.push(id)
    }
  }

  endSession(save: boolean) {
    if (save) {
      let mathMap = this.sharedService.YdocService?.mathMap;
      let mathObj = mathMap?.get('dataURLObj')
      Object.keys(this.addedImages).forEach((math_id)=>{
        mathObj[math_id] = this.addedImages[math_id];
      })
      this.deletedImages.forEach((math_id)=>{
        if(mathObj[math_id]){
          mathObj[math_id] = undefined;
        }
      })
      mathMap?.set('dataURLObj',mathObj)
    }
    this.hasDialogSession = false;
  }

  inSession() {
    return this.hasDialogSession ? this.hasDialogSubSession ? 'subsession' : 'session' : 'nosession'
  }

  createMathImgSession() {
    this.addedImages = {};
    this.deletedImages = [];
  }

  createMathImgSubSession() {
    this.addedImagesSubSession = {};
    this.deletedImagesSubSession = [];
  }
}
