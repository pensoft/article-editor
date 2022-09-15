import { E, I } from "@angular/cdk/keycodes";
import { Injectable, OnInit } from "@angular/core";
import { AuthService } from "@app/core/services/auth.service";
import { ServiceShare } from "@app/editor/services/service-share.service";
import { forEach } from "lodash";
import { BehaviorSubject, from, NEVER, Observable, of, Subscription } from "rxjs";
import { concatMap, map, switchMap, tap } from "rxjs/operators";
import { ACL } from "../interfaces";
import JwtEnforcer from "../lib/JwtEnforcer";
import { getModel } from "../models/index";
import { getRequestKey } from "./helpers";

@Injectable({providedIn: 'root'})
export class EnforcerService {
  private _acls: Observable<ACL[] | null> | null = null;

  private enforcer: JwtEnforcer | null = null;
  private sub: Subscription | null = null;

  private cache: { [key: string]: Observable<boolean> } = {};
  private false = of(false);

  newBeahviorSubject = new BehaviorSubject(null);
  enforcedEndpoints:any = {}

  policiesFromBackend
  constructor(private serviceShare:ServiceShare) {
    this.false.subscribe((d) => false);
    this.triggerUpdatePolicy();
    this.serviceShare.shareSelf('EnforcerService',this)
  }

  triggerUpdatePolicy(){
    this.serviceShare.AuthService.getUserInfo().subscribe((res)=>{
      this.policiesFromBackend = this.mapPolicies(res.data.permissions);
      console.log(this.policiesFromBackend);
      this.updateAllPolicies(this.policiesFromBackend)
    })
  }

  enforceRequest = (obj:string,act:string) => {
    this.enforcer.enforcePromise(obj, act).then((access)=>{
      console.log('enforce from pipe',obj,act,access);
      this.enforcedEndpoints[getRequestKey('',obj,act)] = {access}
      this.newBeahviorSubject.next(this.enforcedEndpoints);
    })
  }

/*   enforceSync = (obj:string,act:string) => {
    return this.enforcer.enforceSync(obj,act);
  } */

  enforceAsync = (obj:string,act:string) => {
    if(!this.enforcer){
      return of(false)
    }
    console.log(obj,act);
    return from(this.enforcer.enforcePromise(obj,act))
  }

  mapPolicies = (policiesFromBackend:any) => {
    let allParsedPolicies:any[]= [];
    let parseRecursive = (array:any[])=>{
      if(array.length>0&&typeof array[0] == 'string'){
        let policy = {
          sub:array[0],
          obj:array[1],
          act:array[2],
          eft:array[3]
        }
        if(!policy.obj.includes('isOwner(')){
          /* if(policy.obj == "/references/items"){
            policy.act = "(GET)"
          } */
          allParsedPolicies.push(policy);
        }
      }else{
        array.forEach((el,i)=>{
          if(typeof el != 'string'){
            parseRecursive(el);
          }
        })
      }
    }
    parseRecursive(policiesFromBackend);
    return allParsedPolicies
  }

  getKey(obj:string,act:string){
    return `${obj} + ${act}`;
  }

  updateAllPolicies(policiesFromBackend:any){
    this.load(of(policiesFromBackend)).then((done)=>{
      this.notifyForUpdate()
    });
  }

  notifyForUpdate(){
    this.enforcedEndpoints = {}
    this.newBeahviorSubject.next('updated_policies')
  }

  load(acls: Observable<ACL[]>) {
    return new Promise((resolve,reject)=>{
      this.unload();
      this.sub = acls
        .pipe(
          concatMap((acls) => {
            if (!acls) {
              return NEVER;
            }

            const enforcer = new JwtEnforcer(acls);
            return from(enforcer.setup(getModel()));
          })
        )
        .subscribe((enforcer) => {
          this._acls = acls;
          this.enforcer = enforcer;
          resolve(true)
        });
    })
  }

  unload() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.enforcer = null;
    this.cache = {};
  }
}
