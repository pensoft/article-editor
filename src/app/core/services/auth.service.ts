import {IAuthToken, IUserDetail} from '@core/interfaces/auth.interface';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {CONSTANTS} from './constants';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, interval, Observable, of, Subject} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {UserModel} from '@core/models/user.model';
import {catchError, filter, map, switchMap, takeUntil, tap, timeout} from 'rxjs/operators';
import { environment } from '@env';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ServiceShare } from '@app/editor/services/service-share.service';
const API_AUTH_URL = environment.authUrl;
const API_URL = environment.apiUrl;
export type UserType = UserModel | undefined;

@Injectable({providedIn: 'root'})
export class AuthService implements OnDestroy {
  private headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('accept', 'application/x.article-api.v1+json')
  private unsubscribe$ = new Subject<void>();
  currentUser$: Observable<UserType>;
  currentUserSubject: BehaviorSubject<UserType>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private _http: HttpClient,
    private router: Router,
    private sharedService:ServiceShare,
    private jwtHelper: JwtHelperService
  ) {
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.sharedService.shareSelf('AuthService',this)
  }

  login(userdetails: IUserDetail) {
    const body = new HttpParams()
      .set(CONSTANTS.USERNAME, userdetails.email)
      .set(CONSTANTS.PASSWORD, userdetails.password);

    return this._http.post<IAuthToken>(`${API_AUTH_URL}/token`, body.toString(), {
      headers: this.headers,
      /* observe:'response',
      responseType:'json' */
    }).pipe(
      map((token) => {
        this.storeToken('token', token['access_token']);
        this.storeToken('refresh_token', token['refresh_token']);
        setTimeout(()=>{
          this.sharedService.EnforcerService.triggerUpdatePolicy()
        },0)
        return token;
      }),
      switchMap((token) => this.getUserInfo(token)),
      catchError((err) => {
        return of(undefined);
      })
    );
  }

  register(userdetails: IUserDetail) {
    const body = new HttpParams()
      .set(CONSTANTS.USERNAME, userdetails.email)
      .set(CONSTANTS.NAME, userdetails.name || '')
      .set(CONSTANTS.PASSWORD, userdetails.password);

    return this._http.post<IAuthToken>(`${API_AUTH_URL}/signup`, body.toString(), {
      headers: this.headers,

    }).pipe(
      switchMap(() => this.login(userdetails)),
      catchError((err) => {
        return of(undefined);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login'], {
      queryParams: {},
    })
    this.userInfo = undefined
  }

  invalidateToken() {
    this._http.post(`${API_AUTH_URL}/logout`, {}, {headers: this.headers})
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        complete: () => {
          this.logout();
        },
        error: () => {
          this.logout();
        },
      });
  }

  isLoggedIn() {
    return this.getToken() ? true : false; // add your strong logic
  }

  storeToken(tokenType, token: string) {
    localStorage.setItem(tokenType, token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isTokenExpired(access_token:string){
    return this.jwtHelper.isTokenExpired(access_token);
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();
    return this._http.post<any>(`${API_AUTH_URL}/refresh-token`, {'refresh-token': refreshToken})
      .pipe(
        map(({access_token: token, refresh_token: refreshToken}) =>
          ({
            token,
            refreshToken
          })
        ))
  }

  forgotPassword(email: string): Observable<boolean> {
    return this._http.post<boolean>(`${API_AUTH_URL}/forgot-password`, {
      email,
    });
  }

  userInfo:any = undefined

  getUserInfo(token = null) {
    const auth = token || this.getToken();
    if(token){
      this.storeToken('token', token['access_token']);
      this.storeToken('refresh_token', token['refresh_token']);
    }
    if (!auth) {
      return of(undefined);
    }
    if(this.userInfo){
      //this.sharedService.EnforcerService.policiesChangeSubject.next(this.userInfo);
      return of(this.userInfo)
    }else{
    }
      return this._http.get<any>(`${API_AUTH_URL}/me`)
        .pipe(
          map((user) => {
            if (user) {
              this.userInfo = user;
              this.currentUserSubject.next(user.data);
              this.sharedService.EnforcerService.policiesChangeSubject.next(user);
            } else {
              this.logout();
            }
            return user;
          }),
        )
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
