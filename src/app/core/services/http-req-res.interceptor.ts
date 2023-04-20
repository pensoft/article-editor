import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BroadcasterService } from './broadcaster.service';
import { CONSTANTS } from './constants';
import { mapExternalRefs } from '@app/editor/utils/references/refsFunctions';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Injectable()
export class HTTPReqResInterceptor implements HttpInterceptor {
  isalreadyRefreshing: boolean = false;
  private tokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    @Inject('API_GATEWAY_SERVICE') private _apiGatewayService: string,
    @Inject('AUTH_SERVICE') private _authService: string,
    @Inject(APP_CONFIG) private config: AppConfig,
    private _authservice: AuthService,
    private _broadcaster: BroadcasterService,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._broadcaster.broadcast(CONSTANTS.SHOW_LOADER, true);
    var pattern = new RegExp('^(https?|ftp)://');
    let endpoint = req.url;
    let newReq = req.clone({
      url: endpoint,
      headers: req.headers.set('Accept', `application/vnd.article-backoffice-api.v${this.config.articleApiVersion}+json`),
    });

    const token = this._authservice.getToken();

    if (token) {
      newReq = this.addToken(newReq, token)
    }
    return next.handle(newReq).pipe(
      map((x) => {
        if (x instanceof HttpResponse) {
          if (
            x.url?.includes('http://localhost:4200/find') ||
            x.url?.includes(this.config.externalRefsApi)
          ) {
            const source = x.url.split('=')
            return x.clone({body: mapExternalRefs(x.body, source[source.length - 1])})
          }
        }
        return x
      }),
      tap((e) => {
        if (e instanceof HttpResponse) {
          this.handleSuccess(e.body);
        }
      }),
      catchError((err) => this.handleError(newReq, next, err)),
      finalize(() => {
        this._broadcaster.broadcast(CONSTANTS.SHOW_LOADER, false);
      })
    );
  }

  handleSuccess(body: any) {
    /* handle success actions here */
  }

  handleError(newRequest: HttpRequest<any>, next: HttpHandler, err: any) {
    if (err instanceof HttpErrorResponse && err.status === 401) {
      return this.handle401(newRequest, next);
    } else {
      this._broadcaster.broadcast(CONSTANTS.ERROR, {
        error: 'Something went wrong',
        timeout: 5000,
      });
    }
    return throwError(err);
  }

  addToken(request: HttpRequest<any>, newToken: string) {
    return request.clone({
      headers: request.headers.set(CONSTANTS.AUTH_HEADER, `Bearer ${newToken}`),
    });
  }


  /* Refresh handler referred from https://www.intertech.com/angular-4-tutorial-handling-refresh-token-with-new-httpinterceptor/ */
  handle401(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isalreadyRefreshing) {
      //  don't want to have multiple refresh request when multiple unauthorized requests
      this.isalreadyRefreshing = true;
      // so that new subscribers don't trigger switchmap part and stay in queue till new token received
      this.tokenSubject.next(null);
      return this._authservice.refreshToken().pipe(
        switchMap(({token, refreshToken}) => {
          if (token) {
            // update token store & publish new token, yay!!
            this._authservice.storeToken(token);
            this._authservice.storeToken(refreshToken, 'refreshToken');
            this.tokenSubject.next(token);
            return next.handle(this.addToken(request, token));
          }
          // no new token received | something messed up
          this._authservice.logout();
          return throwError('no refresh token found');
        }),
        catchError((error) => {
          this._authservice.logout();
          return throwError(error);
        }),
        finalize(() => (this.isalreadyRefreshing = false))
      );
    } else {
      /* if tab is kept running and this isalreadyRefreshing is still true,
      user clicks another menu, req initiated but refresh failed */
      if (this.isalreadyRefreshing && request.url.includes('refresh')) {
        this._authservice.logout();
        return throwError('No refresh token! Going to login page!');
      }
      // new token ready subscribe -> every skipped request will be retried with fresh token
      return this.tokenSubject.pipe(
        filter((token: string) => token != null),
        take(1), // complete the stream
        switchMap((token: string) => {
          return next.handle(this.addToken(request, token));
        }),
      );
    }

  }

}
