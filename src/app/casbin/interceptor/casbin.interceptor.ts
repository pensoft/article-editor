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
import { map, mergeMap } from 'rxjs/operators';

@Injectable()
export class CasbinInterceptor implements HttpInterceptor {

  constructor(private sharedService: ServiceShare) {

  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let unauthenticatedObservable:Observable<HttpEvent<unknown>> = new Observable((sub)=>{
      sub.next(new HttpResponse({body:{message:"Not authentucated.",status:404,url:request.url}}));
    })
    if (
      request.url.endsWith('/articles') ||
      request.url.endsWith('/citation-styles')
    ) {
      let urlParts = request.url.split('/');
      let casbinobj = '/'+urlParts[urlParts.length - 1]
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        console.log(`casbin ${casbinobj}`, access);
        console.log("real url ",request.url);
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    } else if (
      request.url.endsWith('/references/items') ||
      request.url.endsWith('/references/definitions')
    ){
      let urlParts = request.url.split('/');
      let casbinobj = `/${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        console.log(`casbin ${casbinobj}`, access);
        console.log("real url ",request.url);
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    }else if (
      /\/articles\/[^\/\s]+$/.test(request.url) ||
      /\/citation-styles\/[^\/\s]+$/.test(request.url) ||
      /\/articles\/[^\/\s]+$/.test(request.url)
    ) {
      let urlParts = request.url.split('/');
      let casbinobj = `/${urlParts[urlParts.length - 2]}/*`
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        console.log(`casbin ${casbinobj}`, access);
        console.log("real url ",request.url);
        if (access) {
          return next.handle(request);
        } else {
          return unauthenticatedObservable
        }
      }))
    } else if (
      /\/references\/definitions\/[^\/\s]+$/.test(request.url) ||
      /\/references\/items\/[^\/\s]+$/.test(request.url)
    ) {
      let urlParts = request.url.split('/');
      let casbinobj = `/${urlParts[urlParts.length - 3]}/${urlParts[urlParts.length - 2]}/*`
      return this.sharedService.EnforcerService.enforceAsync(casbinobj, request.method).pipe(mergeMap((access) => {
        console.log(`casbin ${casbinobj}`, access);
        console.log("real url ",request.url);
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
