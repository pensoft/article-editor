import { IAuthToken, IUserDetail } from '@core/interfaces/auth.interface';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { CONSTANTS } from './constants';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { UserModel } from '@core/models/user.model';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';

const API_AUTH_URL = `https://ps-article.dev.scalewest.com/api/auth`;
export type UserType = UserModel | undefined;

@Injectable({providedIn: 'root'})
export class AuthService implements OnDestroy {
  private headers = new HttpHeaders()
    .set('Content-Type', 'application/x-www-form-urlencoded')
    // .set('Content-Type', 'application/json')
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
              private router: Router) {
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(userdetails: IUserDetail) {
    const body = new HttpParams()
      .set(CONSTANTS.EMAIL, userdetails.email)
      .set(CONSTANTS.PASSWORD, userdetails.password);

    return this._http.post<IAuthToken>(`${API_AUTH_URL}/login`, body.toString(), {
      headers: this.headers,
    }).pipe(
      map(token => {
        this.storeToken(token.accessToken);
        return token;
      }),
      switchMap(() => this.getUserInfo()),
      catchError((err) => {
        return of(undefined);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    })
  }

  invalidateToken(){
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

  storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  refreshToken() {
    return this._http.get<any>(`/refresh`, {observe: 'response'})
      .pipe(
        map((resp) => {
          if (resp && resp.headers.get('Authorization') && (resp.headers.get('Authorization') || '').includes('Bearer') ) {
            return (resp.headers.get('Authorization') || '').replace('Bearer ','');
          }
          return false;
        })
      )
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
