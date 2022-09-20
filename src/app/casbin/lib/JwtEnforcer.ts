import { HttpClient } from "@angular/common/http";
import { ServiceShare } from "@app/editor/services/service-share.service";
import { Model, newEnforcer } from "casbin";
import { resolve } from "dns";
import { from, Observable } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { ACL } from "../interfaces";
import { asyncLog, logMatching, matchAction } from "../models/matchers";
import JwtAdapter from "./JwtAdapter";

export default class JwtEnforcer {
  casbin: any | null;
  acls: ACL[];
  sub: string = 'asd';
  serviceShare:ServiceShare

  constructor(acls: ACL[],serviceShare:ServiceShare) {
    this.casbin = null;
    this.serviceShare = serviceShare
    if (!acls) {
      throw new Error("CTOR: JWT ACLS are required!");
    }

    this.acls = acls;
  }

  isOwner = (requestObj:string,policyObj:string) => {
    console.log(requestObj,policyObj);
    if(requestObj.includes('/references/items/')){
      let refId = requestObj.split('/references/items/')[1];
      return new Promise((resolve,reject)=>{

        /* setTimeout(()=>{
        },1000) */
        resolve(true);

        // breaks the interceptor
        /* this.serviceShare.RefsApiService.getReferenceById(+refId).subscribe((res)=>{
          console.log(res);
          resolve(true);
        }) */
      })
    }
    return Promise.resolve(true)
  }

  ownershipFuncs = {
    'isOwner': this.isOwner
  }

  handleOwnershipFunctions = (funcname:string,requestObj:string,policyObj:string) => {
    return this.ownershipFuncs[funcname](requestObj,policyObj);
  }

  checkForOwnershipFuntions(policiObj:string):any|undefined{
    if(policiObj.includes('isOwner(')){
      return 'isOwner'
    }
    return
  }

  keyMatchChanged = async (/* request */key1: string,/* policy */key2: string) => {
    console.log('matching -------------------------------- ', 'request', key1, 'policy', key2);
    const pos: number = key2.indexOf('*');
    if (pos === -1) {
      return Promise.resolve(key1 === key2);
    }

    let anyOwnershipFunction = this.checkForOwnershipFuntions(key2)
    if(anyOwnershipFunction){
      return await this.handleOwnershipFunctions(anyOwnershipFunction,key1,key2);
    }

    if (key1.length > pos) {
      return Promise.resolve(key1.slice(0, pos) === key2.slice(0, pos));
    }

    return Promise.resolve(key1 === key2.slice(0, pos));
  }

  setup(model: Model) {
    return from(newEnforcer(model, new JwtAdapter(this.acls))).pipe(
      concatMap((casbin) => {
        this.casbin = casbin;
        this.casbin.addFunction("matchAction", matchAction)
        this.casbin.addFunction('asyncLog',asyncLog)
        this.casbin.addFunction('keyMatchChanged',this.keyMatchChanged)
        return from(this.casbin.addFunction("logMatching", logMatching)).pipe(
          map(() => this)
        );
      })
    );
  }

  enforce( sub:string,obj: string, act: string): Observable<boolean> {
    if (!this.casbin) {
      throw new Error("Run setup() before enforcing!");
    }

    //casbin.enforce return a promise
    return from(this.casbin.enforce(sub, obj, act)) as Observable<boolean>;
  }

  enforcePromise(sub:string,obj: string, act: string):Promise<boolean>{
    return this.casbin.enforce(sub,obj, act);
  }

  enforceSync(sub:string,obj: string, act: string):boolean{
    return this.casbin.enforceSync(sub,obj, act)
  }
}
