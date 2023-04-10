import { Injectable } from "@angular/core";
import { AuthService } from "@app/core/services/auth.service";
import { ServiceShare } from "@app/editor/services/service-share.service";
import { BehaviorSubject, from, NEVER, Observable, of, Subscription } from "rxjs";
import { concatMap, map } from "rxjs/operators";
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

  policiesFromBackend:any
  constructor(private serviceShare:ServiceShare, private authService: AuthService) {
    this.false.subscribe((d) => false);
    this.triggerUpdatePolicy();
    this.serviceShare.shareSelf('EnforcerService',this);
    this.authService.currentUser$.subscribe(data => {
      console.log('EnforcerService -> User', data);
      if(data) {
        this.policiesChangeSubject.next({data});
      }
    })
  }

  policiesChangeSubject = new BehaviorSubject(null);
  userInfo:any
  triggerUpdatePolicy(){
    this.policiesChangeSubject.subscribe((res)=>{
      if(res){
        this.userInfo = res.data
        this.policiesFromBackend = this.mapPolicies(res.data.permissions);
        this.updateAllPolicies(this.policiesFromBackend)
      }
    })
  }

  enforceRequest = (obj:string,act:string) => {
    this.enforceAsync(obj, act).subscribe((access)=>{
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
    return from(this.enforcer.enforcePromise(this.userInfo.id,obj,act)).pipe(map((x)=>{
      return x
    }))
  }

  mapPolicies = (policiesFromBackend:any) => {
    let allParsedPolicies:any[]= [];
    let parseRecursive = (array:any[])=>{
      if(array.length>0&&typeof array[0] == 'string'){
        let policy = {
          prefix:array[0],
          sub:array[1],
          obj:array[2],
          act:array[3],
          eft:array[4],
        }
        if(policy.obj == '*'&&policy.act=='.*'&&policy.eft=='allow'){
          allParsedPolicies.push(policy);
        }/* else if (policy.obj == '/articles/sections') {
          policy.eft = 'deny'
          allParsedPolicies.push(policy);
        }else if (policy.obj == '/articles/*') {
          policy.eft = 'deny'
          allParsedPolicies.push(policy);
        } */else{
          allParsedPolicies.push(policy);
        }
        //allParsedPolicies.push(policy);
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

  loadedPolicies = false;
  notifyForUpdate(){
    this.loadedPolicies = true;
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

            const enforcer = new JwtEnforcer(acls,this.serviceShare, this.authService);
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
