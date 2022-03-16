import { Injectable } from '@angular/core';
import { ServiceShare } from './service-share.service';

@Injectable({
  providedIn: 'root'
})
export class PmDialogSessionService {

  addedImages:any = {};
  deletedImages:any = {};
  hasDialogSession = false;

  constructor(private sharedService:ServiceShare) {
    this.sharedService.shareSelf('PmDialogSessionService',this)
  }

  createSession(){
    this.hasDialogSession = true;
    this.createMathImgSession();
  }

  endSession(save:boolean){
    if(save){

    }
    this.hasDialogSession = false;
  }

  inSession(){
    return this.hasDialogSession
  }

  createMathImgSession(){
    this.addedImages = [];
    this.deletedImages = [];
  }
}
