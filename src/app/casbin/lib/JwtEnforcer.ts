import { HttpClient } from "@angular/common/http";
import { ServiceShare } from "@app/editor/services/service-share.service";
import { Model, newEnforcer } from "casbin";
import { resolve } from "dns";
import { from, Observable } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { ACL } from "../interfaces";
import { asyncLog, logMatching, matchAction } from "../models/matchers";
import JwtAdapter from "./JwtAdapter";
import { AuthService } from "@core/services/auth.service";

export default class JwtEnforcer {
  casbin: any | null;
  acls: ACL[];
  sub: string = 'asd';
  serviceShare: ServiceShare
  authService;

  constructor(acls: ACL[], serviceShare: ServiceShare, authService: AuthService) {
    this.authService = authService;
    this.casbin = null;
    this.serviceShare = serviceShare
    if (!acls) {
      throw new Error("CTOR: JWT ACLS are required!");
    }

    this.acls = acls;
  }

  isOwner = (requestObj: string, policyObj: string, reqsub: string, ctx: any) => {
    if (ctx && ctx.uuid) {
      if (policyObj.includes('/references/items')) {
        let ref = this.serviceShare.globalObj[ctx.uuid];
        let refOwnerId = ref.user.id;
        return refOwnerId == reqsub
      }
    }
    return false;
  }

  ownershipFuncs = {
    'isOwner': this.isOwner
  }

  handleOwnershipFunctions = (funcname: string, requestObj: string, policyObj: string, reqsub: string, ctx: any) => {
    return this.ownershipFuncs[funcname](requestObj, policyObj, reqsub, ctx);
  }

  checkForOwnershipFuntions(policiObj: string): any | undefined {
    if (policiObj.includes('isOwner')) {
      return 'isOwner'
    }
    return
  }

  checkFnsIfAny = (reqsub: string,/* request */key1: string,/* policy */key2: string,/* ctx */ctx: any) => {
    let funcPolicy: string
    let actualObjReq = key1
    let actualObjPol
    if (key2.includes('(')) {
      let dataPolicy = key2.split('(');
      funcPolicy = dataPolicy[0];
      let obj = dataPolicy[1].replace(')', '')
      actualObjPol = obj
    } else {
      return false;
    }

    const pos: number = actualObjPol.indexOf('*');

    let anyOwnershipFunction = funcPolicy ? this.checkForOwnershipFuntions(funcPolicy) : undefined
    if (anyOwnershipFunction && actualObjReq.slice(0, pos) == actualObjPol.slice(0, pos)) {
      let isOwner = this.handleOwnershipFunctions(anyOwnershipFunction, key1, key2, reqsub, ctx);
      return isOwner
    } else {
      return false;
    }
  }

  hasPermission = (robj: string, pobj: string, ctx: any) => {
    const re = new RegExp(/\(|\)/gi);
    const midstring = pobj.split(re);
    if (midstring.length > 1) {
      if (midstring[0] && ctx) {
        let ref = this.serviceShare.globalObj[ctx.uuid];
        let refOwnerId = ref.user.id;
        if (refOwnerId === this.authService.currentUserValue.id) {
          return midstring[1];
        }
      }
      return null;
    }
    return pobj;

    /* const re = new RegExp(/::|\(|\)/gi);
    const policyObjData = pobj.split(re);
    if(policyObjData.length < 3) return pobj;
    if(!ctx) throw 'no context for obj passed'
    if(!this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]]) {throw 'no such obj class found' }
    if(!this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]][policyObjData[1]]) {throw 'no such function in class found'}
    const currUserId = this.serviceShare.EnforcerService.userInfo.id;
    return this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]][policyObjData[1]](robj,currUserId)
    if(this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]][policyObjData[1]](robj,currUserId)){
      return policyObjData[2]
    }else{
      return null
    }*/

    //test Global service objects

    /* const re = new RegExp(/\(|\)/gi);
    const midstring = pobj.split(re);
    if (midstring.length > 1) {
      if (midstring[0] && ctx) {
        const policyObjData = ['referenceClass', 'isOwner', 'asdasd'];
        if (policyObjData.length < 3) return pobj;
        if (!ctx) throw 'no context for obj passed'
        if (!this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]]) { throw 'no such obj class found' }
        if (!this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]][policyObjData[1]]) { throw 'no such function in class found' }
        const currUserId = this.serviceShare.EnforcerService.userInfo.id;
        if(this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]][policyObjData[1]](robj,currUserId)){
          return midstring[1]
        }else{
          return null
        }
      }
      return null;
    }
    return pobj; */

  }

  setup(model: Model) {
    return from(newEnforcer(model, new JwtAdapter(this.acls))).pipe(
      concatMap((casbin) => {
        this.casbin = casbin;
        this.casbin.addFunction("matchAction", matchAction);
        this.casbin.addFunction('asyncLog', asyncLog);
        this.casbin.addFunction('checkFnsIfAny', this.checkFnsIfAny);
        this.casbin.addFunction('hasPermission', this.hasPermission);
        return from(this.casbin.addFunction("logMatching", logMatching)).pipe(
          map(() => this)
        );
      })
    );
  }

  enforce(sub: string, obj: string, act: string, ctx: any): Observable<boolean> {
    if (!this.casbin) {
      throw new Error("Run setup() before enforcing!");
    }

    //casbin.enforce return a promise
    return from(this.casbin.enforce(sub, obj, act, ctx)) as Observable<boolean>;
  }

  enforcePromise(sub: string, obj: string, act: string, ctx: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.casbin.enforce(sub, obj, act, ctx).then((data: any) => {

        //console.log(sub, obj, act, ctx, data);
        resolve(data)
      })
    })
  }

  enforceSync(sub: string, obj: string, act: string): boolean {
    return this.casbin.enforceSync(sub, obj, act)
  }
}
