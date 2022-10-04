import {HttpClient} from "@angular/common/http";
import {ServiceShare} from "@app/editor/services/service-share.service";
import {Model, newEnforcer} from "casbin";
import {resolve} from "dns";
import {from, Observable} from "rxjs";
import {concatMap, map} from "rxjs/operators";
import {ACL} from "../interfaces";
import {matchAction} from "../models/matchers";
import JwtAdapter from "./JwtAdapter";
import {AuthService} from "@core/services/auth.service";
import {I} from "@angular/cdk/keycodes";
import {keyMatchFunc} from "casbin/lib/cjs/util";

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

  aclFunction: (robj: string, pobj: string, ctx: any) => boolean = (robj, pobj, ctx) => {
    const re = new RegExp(/::|\(|\)/gi);
    const policyObjData = pobj.split(re);

    if (policyObjData.length != 4) return false;

    if (!this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]]) return false;
    if (!this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]][policyObjData[1]]) return false;

    const functionArgs = policyObjData[2].split(',');

    return this.serviceShare.CasbinGlobalObjectsService[policyObjData[0]][policyObjData[1]](robj, ...functionArgs)
  }

  setup(model: Model) {
    return from(newEnforcer(model, new JwtAdapter(this.acls))).pipe(
      concatMap((casbin) => {
        this.casbin = casbin;
        this.casbin.addFunction("matchAction", matchAction);
        return from(this.casbin.addFunction('aclFunction', this.aclFunction)).pipe(
          map(() => this)
        );
      })
    );
  }

  enforce(sub: string, obj: string, act: string): Observable<boolean> {
    if (!this.casbin) {
      throw new Error("Run setup() before enforcing!");
    }

    //casbin.enforce return a promise
    return from(this.casbin.enforce(sub, obj, act)) as Observable<boolean>;
  }

  enforcePromise(sub: string, obj: string, act: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.casbin.enforce(sub, obj, act).then((data: any) => {

        resolve(data)
      })
    })
  }

  enforceSync(sub: string, obj: string, act: string): boolean {
    return this.casbin.enforceSync(sub, obj, act)
  }
}
