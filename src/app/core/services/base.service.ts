import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {
  constructor() { }

  protected setParameter(routerParams: Params): HttpParams {
    let queryParams = new HttpParams();
    for (const key in routerParams) {
      if (routerParams.hasOwnProperty(key)) {
        queryParams = queryParams.set(key, routerParams[key]);
      }
    }
    return queryParams;
  }
}
