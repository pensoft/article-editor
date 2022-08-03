import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mergeMap,materialize,delay,dematerialize } from 'rxjs/operators';

export interface fakeUser {email:string,name:String}

@Injectable({
  providedIn: 'root'
})
export class CommentsInterceptorService implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // wrap in delayed observable to simulate server api call
    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
      .pipe(delay(500))
      .pipe(dematerialize()) as Observable<HttpEvent<any>>;

    function handleRoute() {
      switch (true) {
        case url.endsWith('/get-contributors') && method === 'GET':
          return getConnectedUsers();
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }
    function  getConnectedUsers(){
      let body = {data:[
        {
          email:'artem009j@longaitylo.com',
          name:'artem009j'
        },{
          email:'billyaa@khoantuta.com',
          name:'billyaa'
        },{
          email:'lobzik69@playfuny.com',
          name:'lobzik69'
        },{
          email:'pluckerw@nealheardtrainers.com',
          name:'pluckerw'
        },{
          email:'gtashbaev@gmailvn.net',
          name:'gtashbaev'
        },{
          email:'yuliana1mironova@encuestan.com',
          name:'yuliana1mironova'
        },{
          email:'sezinyazici1991@mexcool.com',
          name:'sezinyazici1991'
        },{
          email:'skaybim@pianoxltd.com',
          name:'skaybim'
        },{
          email:'frankvii@bachelors.ml',
          name:'frankvii'
        },{
          email:'aus101u@bachelors.ml',
          name:'frankvii'
        },{
          email:'tdive@disipulo.com',
          name:'tdive'
        },
      ]}
      return httpRes(body)
    }

    function httpRes(body?){
      return of(new HttpResponse({status:200,body}))
    }
  }

}
