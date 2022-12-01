import {Injectable} from '@angular/core';
import {ServiceShare} from '@app/editor/services/service-share.service';
import {GlobalObjContainer} from '../interfaces';
import {keyMatchFunc} from "casbin/lib/cjs/util";

@Injectable({
  providedIn: 'root'
})
export class CasbinGlobalObjectsService {

  constructor(private sharedService: ServiceShare) {
    this.sharedService.shareSelf('CasbinGlobalObjectsService', this)
  }

  ReferenceItem: GlobalObjContainer = {
    items: {},
    isOwner: (robj, ...args) => {
      // check if there is arg that maches with requested obj
      const matched = args.some((arg) => keyMatchFunc(robj, `${arg}`));

      if (!matched) return false;

      const reqObj = robj;
      const currUserId = this.sharedService.EnforcerService.userInfo.id;

      const reqObjData = reqObj.split('/');
      let objId = reqObjData[reqObjData.length - 1];
      let ref = this.ReferenceItem.items[objId];
      let refOwnerId = ref.user.id;
      return refOwnerId == currUserId
    }
  }

  addItemToGlobalContainer(glContainerKey: string, objId: string, obj: any) {
    this[glContainerKey].items[objId] = obj
  }
}
