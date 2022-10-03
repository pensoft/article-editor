import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { GlobalObjContainer } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CasbinGlobalObjectsService {

  constructor(private sharedService:ServiceShare) {
    this.sharedService.shareSelf('CasbinGlobalObjectsService',this)
  }

  referenceClass:GlobalObjContainer = {
    items:{},
    isOwner(reqObj,subId){
      const reqObjData = reqObj.split('/');
      let objId = reqObjData[reqObjData.length-1];
      let ref = this.items[objId];
      let refOwnerId = ref.user.id;
      console.log('isOwenr',objId,refOwnerId == subId);
      return refOwnerId == subId
    }
  }

  addItemToGlobalContainer(glContainerKey:string,objId:string,obj:any){
    this[glContainerKey].items[objId] = obj
  }
}
