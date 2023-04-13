import { ActivatedRouteSnapshot, CanActivate, NavigationExtras, Router, RouterStateSnapshot } from '@angular/router';

import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private _authservice: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLogged = this._authservice.isLoggedIn();

    if( !isLogged ) {
      // this._authservice.logout()
      this._authservice.removeGlobalStyleForUser();
      localStorage.clear();
      const extras: NavigationExtras = {
        queryParams: {'previousUrl': state.url}
      };
      this.router.navigate(['/'], extras);
      this._authservice.userInfo = undefined;
      return false;
    } else {
      return true;
    }
    //
    //this._authservice.getUserInfo().subscribe()

    // return isLogged;
  }
}
