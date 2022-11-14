import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpEventType,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { map, mergeMap, subscribeOn } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class CasbinInterceptor implements HttpInterceptor {

  constructor(
    private sharedService: ServiceShare,
    private _snackBar: MatSnackBar
    ) {

  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    //return next.handle(request)
    /* if(request.headers.has('sendFromCasbin')){
      let newreq = request.clone({ headers: request.headers.delete('sendFromCasbin') });
      return next.handle(newreq)
    } */
    if(!this.sharedService.EnforcerService||!this.sharedService.EnforcerService.loadedPolicies){
      return next.handle(request)
    }
    let unauthenticatedObservable:Observable<HttpEvent<unknown>> = new Observable((sub)=>{
      this._snackBar.open("You don't have permission and cannot access this information or do this action.",'Ok')
      sub.next(new HttpResponse({body:{message:"Not authentucated.",status:404,url:request.url}}));
    })
    if (
      request.url.endsWith('/layouts') ||
      request.url.endsWith('/citation-styles')
    ) {
      let urlParts = request.url.split('/');
      let casbinobj = '/'+urlParts[urlParts.length - 1]
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    } else if (
      /articles\/items\/uuid\/\S+$/.test(request.url)
    ) {
      return this.sharedService.EnforcerService.enforceAsync('/articles/items/*', request.method).pipe(mergeMap((access) => {
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    }else if (
      request.url.endsWith('/references/definitions') ||
      request.url.endsWith('/articles/items')
    ){
      let urlParts = request.url.split('/');
      let casbinobj = `/${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    }else if (
      /\/layouts\/[^\/\s]+$/.test(request.url) ||
      /\/citation-styles\/[^\/\s]+$/.test(request.url)
    ) {
      let urlParts = request.url.split('/');
      let casbinobj = `/${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    }else if (
      /\/references\/definitions\/[^\/\s]+$/.test(request.url)||
      /\/articles\/items\/[^\/\s]+$/.test(request.url) ||
      /\/articles\/sections\/[^\/\s]+$/.test(request.url)
    ) {
      let urlParts = request.url.split('/');
      let casbinobj = `/${urlParts[urlParts.length - 3]}/${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    } else {
      return next.handle(request);
    }
  }
}
