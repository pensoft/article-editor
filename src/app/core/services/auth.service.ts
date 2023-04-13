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
    public _http: HttpClient,
    private router: Router,
    private sharedService:ServiceShare,
    private jwtHelper: JwtHelperService,
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

    return this._http.post<IAuthToken>(`${API_AUTH_URL}/signup`, body.toString(), {
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
    return this._http.post<any>(`${API_AUTH_URL}/refresh-token`, {'refresh_token': refreshToken})
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

    if (!auth) {
      return of(undefined);
    }

    this.storeToken(auth);

    return this._http.get<any>(`${API_AUTH_URL}/me`)
      .pipe(
        map((user) => {
          if (user) {
            this.currentUserSubject.next(user.data);
            /*this.sharedService.EnforcerService?.policiesChangeSubject.next(user);*/
          } else {
            this.logout();
          }
          this.setGlobalStylesForUser(user);
          return user;
        }),

      )

    /*let getInfo = (token = null)=>{
      const auth = token || this.getToken();
      if(token){
        this.storeToken(token['access_token']);
        this.storeToken(token['refresh_token'], 'refreshToken');
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

    return getInfo(token).pipe(tap(this.setGlobalStylesForUser));*/
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
