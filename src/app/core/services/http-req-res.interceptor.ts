import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import {Inject, Injectable} from '@angular/core';
import {IAuthToken} from '@core/interfaces/auth.interface';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, finalize, map, switchMap, take, tap} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {BroadcasterService} from './broadcaster.service';
import {CONSTANTS} from './constants';
import {environment} from '@env';
import {mapExternalRefs} from '@app/editor/utils/references/refsFunctions';

@Injectable()
export class HTTPReqResInterceptor implements HttpInterceptor {

  constructor(
    private _authservice: AuthService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let returnNextHandleReq = (reqToReturn)=>{
      return next.handle(reqToReturn).pipe(map((x) => {
        if (x instanceof HttpResponse) {
          if (
            x.url?.includes('http://localhost:4200/find') ||
            x.url?.includes('https://refindit.org/find')
          ) {
            return x.clone({body: mapExternalRefs(x.body)})
          }
        }
        return x
      }));
    }
    if (req.url.indexOf('token') > -1 || req.url.indexOf('refresh-token') > -1) {
      return returnNextHandleReq(req);
    }
    let newReq = req.clone();
    const token = this._authservice.getToken();
    let expired = this._authservice.isTokenExpired(token)
    if (!expired) {
      newReq = this.addToken(newReq, token)
      return returnNextHandleReq(newReq);
    } else {
      return this._authservice.refreshToken().pipe(
        switchMap(({access_token: token, refresh_token: refreshToken}: any) => {
          this._authservice.storeToken('token', token);
          this._authservice.storeToken('refresh_token', refreshToken);
          return returnNextHandleReq(this.addToken(newReq, token));
        })
      )
    }
  }

  addToken(request: HttpRequest<any>, newToken: string) {
    return request.clone({
      headers: request.headers.set(CONSTANTS.AUTH_HEADER, `Bearer ${newToken}`),
    });
  }

}
