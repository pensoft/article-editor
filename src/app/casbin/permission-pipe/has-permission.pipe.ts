import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnforcerService } from '../services/enforcer.service';
import { getRequestKey } from '../services/helpers';

@Pipe({
  name: 'hasPermission'
})
export class HasPermissionPipe implements PipeTransform {

  constructor(private enforcer:EnforcerService){
  }

  transform(value: BehaviorSubject<any>, ...args: any[]): Observable<boolean> {
    let obj = args[0]
    let act = args[1]
    let enforceSelf = ()=>{
      setTimeout(()=>{
        this.enforcer.enforceRequest(obj,act);
      },0)
    }
    enforceSelf()
    return from(value).pipe(map((x) => {
      if(x && x == 'updated_policies'){
        enforceSelf()
        return false;
      }
      return (x&&x[getRequestKey('',obj,act)])?x[getRequestKey('',obj,act)].access:false
    }));
  }
}
