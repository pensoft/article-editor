import {IAuthToken, IUserDetail} from '@core/interfaces/auth.interface';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {CONSTANTS} from './constants';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import {BehaviorSubject, interval, Observable, of, Subject} from 'rxjs';
import { Router} from '@angular/router';
import {UserModel} from '@core/models/user.model';
import {catchError, filter, map, switchMap, takeUntil, tap, timeout} from 'rxjs/operators';

import { JwtHelperService } from '@auth0/angular-jwt';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

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
    public _http: HttpClient,
    private router: Router,
    private sharedService:ServiceShare,
    private jwtHelper: JwtHelperService,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.sharedService.shareSelf('AuthService',this)
  }

  login(userdetails: IUserDetail) {
    const body = new HttpParams()
      .set(CONSTANTS.USERNAME, userdetails.email)
      .set(CONSTANTS.PASSWORD, userdetails.password)
      .set(CONSTANTS.GRANT_TYPE, CONSTANTS.PASSOWRD_GRANT_TYPE)
      .set(CONSTANTS.CLIENT_ID, this.config.pgClientId)
      .set(CONSTANTS.CLIENT_SECRET, this.config.pgClientSecret)

    return this._http.post<IAuthToken>(`${this.config.authUrl}/token`, body.toString(), {
      headers: this.headers,
      /* observe:'response',
      responseType:'json' */
    }).pipe(
      map((token) => {
        this.storeToken(token['access_token']);
        this.storeToken(token['refresh_token'], 'refreshToken');
        //if(this.userInfo)this.userInfo = undefined
        return token;
      }),
      switchMap((token) => this.getUserInfo()),
      catchError((err) => {
        return of(err);
      })
    );
  }

  register(userdetails: IUserDetail) {
    const body = new HttpParams()
      .set(CONSTANTS.USERNAME, userdetails.email)
      .set(CONSTANTS.NAME, userdetails.name || '')
      .set(CONSTANTS.PASSWORD, userdetails.password);

    return this._http.post<IAuthToken>(`${this.config.authUrl}/signup`, body.toString(), {
      headers: this.headers,

    }).pipe(
      switchMap(() => this.login(userdetails)),
      catchError((err) => {
        return of(err);
      })
    );
  }

  logout() {
    this.removeGlobalStyleForUser()
    localStorage.clear();
    this.router.navigate(['/'], {
      queryParams: {},
    })
    this.userInfo = undefined
  }

  invalidateToken() {
    this._http.post(`${this.config.authUrl}/logout`, {}, {headers: this.headers})
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
    return !!this.getToken();
  }

  storeToken(token, tokenType = 'token') {
    if(token) {
      localStorage.setItem(tokenType, token);
    }
  }

  getToken(key = 'token') {
    return localStorage.getItem(key);
  }

  isTokenExpired(access_token:string){
    return this.jwtHelper.isTokenExpired(access_token);
  }

  refreshToken() {
    const refreshToken = this.getToken('refreshToken');
    const body = new HttpParams()
      .set(CONSTANTS.REFRESH_TOKEN_GRANT_TYPE, refreshToken)
      .set(CONSTANTS.GRANT_TYPE, CONSTANTS.REFRESH_TOKEN_GRANT_TYPE)
      .set(CONSTANTS.CLIENT_ID, this.config.pgClientId)
      .set(CONSTANTS.CLIENT_SECRET, this.config.pgClientSecret);

    return this._http.post<any>(`${this.config.authUrl}/refresh-token`, body.toString())
      .pipe(
        map(({access_token: token, refresh_token: refreshToken}) =>
          ({
            token,
            refreshToken
          })
        ))
  }

  forgotPassword(email: string): Observable<boolean> {
    return this._http.post<boolean>(`${this.config.authUrl}/forgot-password`, {
      email,
    });
  }

  userInfo:any = undefined

  getUserInfo(token = null) {

    const auth = token || this.getToken();

    if (!auth) {
      return of(undefined);
    }

    this.storeToken(auth);

    return this._http.get<any>(`${this.config.authUrl}/me`)
      .pipe(
        map((user) => {
          if (user) {
            this.currentUserSubject.next(user.data);
            this.userInfo = user
            /*this.sharedService.EnforcerService?.policiesChangeSubject.next(user);*/
          } else {
            this.logout();
          }
          this.setGlobalStylesForUser(user);
          return user;
        }),
      )
  }

  userGlobalStyle?:HTMLStyleElement

  setGlobalStylesForUser = (userData:any) => {
    if(!userData) return;
    if(this.userGlobalStyle) return;
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(`
      span.insertion[user="${userData.data.id}"]{
        background-color: #6bc8c8 !important;
        color: black !important;
      }
      `));
    this.userGlobalStyle = style
    head.appendChild(style);
  }

  removeGlobalStyleForUser = () => {
    if(this.userGlobalStyle){
      const head = document.head || document.getElementsByTagName('head')[0];
      head.removeChild(this.userGlobalStyle);
      this.userGlobalStyle.innerHTML = ''
      this.userGlobalStyle.remove();
      this.userGlobalStyle = undefined
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
