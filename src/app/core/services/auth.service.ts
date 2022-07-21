import {IAuthToken, IUserDetail} from '@core/interfaces/auth.interface';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {CONSTANTS} from './constants';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {UserModel} from '@core/models/user.model';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CookieService} from "ngx-cookie-service";

const API_AUTH_URL = `https://ps-accounts.dev.scalewest.com/api`;
const API_URL = `https://ps-api.dev.scalewest.com/api`;
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

  constructor(private _http: HttpClient,
              private router: Router,
              private cookieService: CookieService) {
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
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
        console.log('res', token);
        this.storeToken('token', token['access_token']);
        this.storeToken('refresh_token', token['refresh_token']);
        return token;
      }),
      switchMap(() => this.getUserInfo()),
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
    this.cookieService.deleteAll();
    // localStorage.clear();
    this.router.navigate(['/login'], {
      queryParams: {},
    })
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
    return !!this.getToken(); // add your strong logic
    // return this.getToken() ? true : false; // add your strong logic
  }

  storeToken(tokenType, token: string) {
    const hostname = window.location.hostname;
    const domainArr = hostname.match(/^(?:.*?\.)?([a-zA-Z0-9\-_]{3,}\.(?:\w{2,8}|\w{2,4}\.\w{2,4}))$/);
    const domain = domainArr? `.${domainArr[1]}`:hostname;
    this.cookieService.set(`${CONSTANTS.TOKEN_PREFIX}${tokenType}`, token, 365, '/', domain)

    // localStorage.setItem(tokenType, token);
  }

  getToken() {
    const key = 'token';
    return this.cookieService.get(`${CONSTANTS.TOKEN_PREFIX}${key}`);
    // return localStorage.getItem('token');
  }

  getRefreshToken() {
    const key = 'refreshToken';
    return this.cookieService.get(`${CONSTANTS.TOKEN_PREFIX}${key}`);
    // return localStorage.getItem('refreshToken');
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

  getUserInfo() {
    const auth = this.getToken();
    if (!auth) {
      return of(undefined);
    }

    return this._http.get<any>(`${API_AUTH_URL}/me`)
      .pipe(
        map((user) => {
          if (user) {
            this.currentUserSubject.next(user.data);
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
