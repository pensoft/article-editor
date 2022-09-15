import { Model, newEnforcer } from "casbin";
import { from, Observable } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { ACL } from "../interfaces";
import { logMatching, matchAction } from "../models/matchers";
import JwtAdapter from "./JwtAdapter";

export default class JwtEnforcer {
  casbin: any | null;
  acls: ACL[];
  sub: string = 'asd';

  constructor(acls: ACL[]) {
    this.casbin = null;

    if (!acls) {
      throw new Error("CTOR: JWT ACLS are required!");
    }

    this.acls = acls;
  }

  setup(model: Model) {
    return from(newEnforcer(model, new JwtAdapter(this.acls))).pipe(
      concatMap((casbin) => {
        this.casbin = casbin;
        this.casbin.addFunction("matchAction", matchAction)
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
    return from(this.casbin.enforce(this.sub, obj, act)) as Observable<boolean>;
  }

  enforcePromise(obj: string, act: string):Promise<boolean>{
    return this.casbin.enforce(this.sub,obj, act);
  }

  enforceSync(obj: string, act: string):boolean{
    return this.casbin.enforceSync(this.sub,obj, act)
  }
}
