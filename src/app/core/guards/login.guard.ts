import {Injectable} from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import {Observable, of, ReplaySubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';
import {AuthService} from "@core/services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  // The replay subject will emit the last value that has been passed in
  subject= new ReplaySubject<any>(1);

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
  private http: HttpClient,
    private _authservice: AuthService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.subject = new ReplaySubject<any>(1);
    this._authservice.getUserInfo().subscribe(user => {
      let redirectUrl;
      if (user) {
        redirectUrl = of(this.router.createUrlTree(['../choose'], {relativeTo: this.activatedRoute}));
      } else {
        redirectUrl = of(this.router.createUrlTree(['../login'], {relativeTo: this.activatedRoute}));
      }
      this.subject.next(redirectUrl);
    });
    return this.subject.pipe(first());
  }
}
