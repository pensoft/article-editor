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
export class DashboardResolver implements Resolve<boolean> {
  resolverKey = 'DasboardResolver';
  constructor(
    private serviceShare:ServiceShare
  ){}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.serviceShare.resolversData[this.resolverKey];
  }
}
