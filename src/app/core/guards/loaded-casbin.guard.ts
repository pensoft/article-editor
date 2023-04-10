import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { EnforcerService } from '@app/casbin/services/enforcer.service';
import { from, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoadedCasbinGuard implements CanActivate {
  constructor(public enforcer: EnforcerService, public authService: AuthService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('--LoadedCasbinGuard--')
    return from(new Promise<boolean>((resolve, reject) => {
        if (!this.authService.isLoggedIn()) {
          resolve(false);
        } else {
          if (this.enforcer.loadedPolicies) {
            resolve(true);
          } else {
            this.enforcer.newBeahviorSubject.subscribe((data) => {
              if (data == 'updated_policies') {
                resolve(true);
              }
            })
          }
        }
        setTimeout(() => {
          resolve(false)
        }, 3000)
    }))
  }
}
