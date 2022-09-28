import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CasbinResolver implements Resolve<boolean> {
  resolverKey = 'CasbinResolver';
  constructor(
    private serviceShare:ServiceShare
  ){}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return of(this.serviceShare.resolversData[this.resolverKey]);
  }
}
